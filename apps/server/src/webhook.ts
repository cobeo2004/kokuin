import path from "node:path";
import prisma from "@kokuin/db";
import { env } from "@kokuin/env/server";
import { GraphStore } from "@kokuin/graph";
import type { Hono } from "hono";

async function verifyGitHubSignature(
	secret: string,
	payload: string,
	signature: string,
): Promise<boolean> {
	if (!signature.startsWith("sha256=")) {
		return false;
	}
	const sig = signature.slice("sha256=".length);
	const enc = new TextEncoder();
	const key = await crypto.subtle.importKey(
		"raw",
		enc.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const mac = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
	const expected = Array.from(new Uint8Array(mac))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
	// Constant-time comparison
	if (expected.length !== sig.length) return false;
	let diff = 0;
	for (let i = 0; i < expected.length; i++) {
		diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
	}
	return diff === 0;
}

async function triggerBuild(
	buildId: string,
	sqlitePath: string,
): Promise<void> {
	try {
		// Create an empty SQLite graph DB and mark build as ready
		new GraphStore(sqlitePath);
		await prisma.graphBuild.update({
			where: { id: buildId },
			data: { status: "ready", sqlitePath },
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		await prisma.graphBuild.update({
			where: { id: buildId },
			data: { status: "failed", errorMessage: message },
		});
	}
}

export function registerWebhookRoutes(app: Hono): void {
	app.post("/api/webhooks/github", async (c) => {
		const event = c.req.header("x-github-event");
		const rawBody = await c.req.text();

		// Verify signature
		const signature = c.req.header("x-hub-signature-256") ?? "";
		const valid = await verifyGitHubSignature(
			env.GITHUB_WEBHOOK_SECRET,
			rawBody,
			signature,
		);
		if (!valid) {
			return c.json({ error: "Invalid signature" }, 401);
		}

		// Only handle push events
		if (event !== "push") {
			return c.json({ ok: true, skipped: true });
		}

		let payload: {
			repository?: { clone_url?: string; html_url?: string };
			ref?: string;
			after?: string;
		};
		try {
			payload = JSON.parse(rawBody);
		} catch {
			return c.json({ error: "Invalid JSON payload" }, 400);
		}

		const repoUrl =
			payload.repository?.html_url ?? payload.repository?.clone_url ?? "";
		const ref = payload.ref ?? "";
		const branch = ref.startsWith("refs/heads/")
			? ref.slice("refs/heads/".length)
			: ref;
		const commitSha = payload.after ?? null;

		// Find matching project by githubRepoUrl
		const project = await prisma.project.findFirst({
			where: { githubRepoUrl: repoUrl },
		});

		if (!project) {
			return c.json({ ok: true, skipped: true, reason: "no matching project" });
		}

		// Upsert GraphBuild record (pending)
		const build = await prisma.graphBuild.upsert({
			where: { projectId_branch: { projectId: project.id, branch } },
			create: {
				projectId: project.id,
				branch,
				commitSha,
				status: "pending",
				triggeredBy: "webhook",
			},
			update: {
				commitSha,
				status: "pending",
				triggeredBy: "webhook",
				errorMessage: null,
			},
		});

		// Compute sqlite path for this build
		const sqlitePath = path.join(
			env.GRAPH_DATA_DIR,
			project.id,
			`${branch.replace(/\//g, "_")}.sqlite`,
		);

		// Trigger async build — do not block response
		triggerBuild(build.id, sqlitePath).catch(() => {});

		return c.json({ ok: true, buildId: build.id });
	});
}
