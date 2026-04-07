import { execSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { type GraphNode, GraphStore } from "@kokuin/graph";
import { Command } from "commander";
import { getApiClient } from "../utils/api-client.js";
import { getCurrentBranch, getGitRemoteUrl } from "../utils/git.js";
import {
	type ParsedEdgeRaw,
	type ParsedNodeRaw,
	ParserProcess,
} from "../utils/parser.js";
import { resolveProjectId } from "../utils/project.js";

export const graphCommand = new Command("graph").description(
	"Query and inspect the code review graph",
);

async function rpcCall<T>(
	serverUrl: string,
	path: string,
	headers: Record<string, string>,
	input?: unknown,
): Promise<T> {
	const url = `${serverUrl.replace(/\/$/, "")}/rpc/${path}`;
	const res = await fetch(url, {
		method: "POST",
		headers: { ...headers, "Content-Type": "application/json" },
		body: JSON.stringify({ json: input ?? {} }),
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`${res.status} ${text}`);
	}
	const envelope = (await res.json()) as { json: unknown };
	return envelope.json as T;
}

function getGraphHeaders(repoUrl: string | null): Record<string, string> {
	const client = getApiClient();
	const headers: Record<string, string> = { ...client.headers };
	if (repoUrl) headers["X-Repo-Url"] = repoUrl;
	return headers;
}

graphCommand
	.command("status")
	.description("Show global graph and overlay statistics")
	.option("-b, --branch <branch>", "Branch to check")
	.action(async (options: { branch?: string }) => {
		const repoUrl = getGitRemoteUrl();
		const client = getApiClient();
		const headers = getGraphHeaders(repoUrl);

		try {
			const status = await rpcCall<{
				global: {
					status: string;
					branch: string;
					nodeCount: number;
					edgeCount: number;
					commitSha?: string;
					updatedAt?: string;
				} | null;
				overlay: {
					nodeCount: number;
					edgeCount: number;
					lastSyncedAt?: string;
				} | null;
			}>(client.serverUrl, "graph/status", headers, { branch: options.branch });

			console.log("Graph status:");
			if (status.global) {
				console.log(`  Branch:        ${status.global.branch}`);
				console.log(`  Status:        ${status.global.status}`);
				console.log(`  Global nodes:  ${status.global.nodeCount}`);
				console.log(`  Global edges:  ${status.global.edgeCount}`);
				if (status.global.commitSha) {
					console.log(
						`  Commit:        ${status.global.commitSha.slice(0, 7)}`,
					);
				}
				if (status.global.updatedAt) {
					console.log(
						`  Updated:       ${new Date(status.global.updatedAt).toLocaleString()}`,
					);
				}
			} else {
				console.log("  No global graph built yet.");
			}
			if (status.overlay) {
				console.log(`  Overlay nodes: ${status.overlay.nodeCount}`);
				console.log(`  Overlay edges: ${status.overlay.edgeCount}`);
			}
		} catch (err) {
			console.error(`Failed: ${err}`);
			process.exit(1);
		}
	});

graphCommand
	.command("query <pattern> <target>")
	.description(
		"Run a pattern query (patterns: callers_of, callees_of, imports_of, tests_for)",
	)
	.option("-b, --branch <branch>", "Branch to query")
	.action(
		async (pattern: string, target: string, options: { branch?: string }) => {
			const repoUrl = getGitRemoteUrl();
			const client = getApiClient();
			const headers = getGraphHeaders(repoUrl);

			try {
				const nodes = await rpcCall<
					Array<{ id: string; name?: string; file_path?: string }>
				>(client.serverUrl, "graph/query", headers, {
					pattern,
					target,
					branch: options.branch,
				});

				if (nodes.length === 0) {
					console.log("No results found.");
					return;
				}

				console.log(`Results for ${pattern}(${target}) — ${nodes.length}:`);
				for (const node of nodes) {
					const label = node.name ?? node.id;
					const loc = node.file_path ? ` — ${node.file_path}` : "";
					console.log(`  ${label}${loc}`);
				}
			} catch (err) {
				console.error(`Failed: ${err}`);
				process.exit(1);
			}
		},
	);

graphCommand
	.command("search <term>")
	.description("Search the graph by keyword")
	.option("-b, --branch <branch>", "Branch to search")
	.option("-l, --limit <number>", "Maximum results", "20")
	.action(async (term: string, options: { branch?: string; limit: string }) => {
		const repoUrl = getGitRemoteUrl();
		const client = getApiClient();
		const headers = getGraphHeaders(repoUrl);

		try {
			const results = await rpcCall<
				Array<{
					id: string;
					name?: string;
					file_path?: string;
					score?: number;
				}>
			>(client.serverUrl, "graph/search", headers, {
				query: term,
				limit: Number(options.limit),
				branch: options.branch,
			});

			if (results.length === 0) {
				console.log("No results found.");
				return;
			}

			console.log(`Search results for "${term}" (${results.length}):`);
			for (const node of results) {
				const label = node.name ?? node.id;
				const loc = node.file_path ? ` — ${node.file_path}` : "";
				const score =
					node.score !== undefined ? ` (score: ${node.score.toFixed(3)})` : "";
				console.log(`  ${label}${loc}${score}`);
			}
		} catch (err) {
			console.error(`Failed: ${err}`);
			process.exit(1);
		}
	});

graphCommand
	.command("build")
	.description("Build a local graph overlay from changed or all files")
	.option("--full", "Parse all tracked files instead of just changed files")
	.action(async (options: { full?: boolean }) => {
		const repoUrl = getGitRemoteUrl();
		if (!repoUrl) {
			console.error("No git remote found.");
			process.exit(1);
		}

		const client = getApiClient();
		const branch = getCurrentBranch();

		let projectId: string;
		try {
			projectId = await resolveProjectId(client, repoUrl);
		} catch (err) {
			console.error(`${err}`);
			process.exit(1);
		}

		// Determine files to parse
		let files: string[];
		try {
			if (options.full) {
				const output = execSync("git ls-files", { encoding: "utf-8" }).trim();
				files = output ? output.split("\n") : [];
			} else {
				const output = execSync("git diff HEAD --name-only", {
					encoding: "utf-8",
				}).trim();
				files = output ? output.split("\n") : [];
			}
		} catch {
			console.error("Failed to list files via git.");
			process.exit(1);
		}

		if (files.length === 0) {
			console.log("Nothing to build.");
			return;
		}

		console.log(
			`Building overlay from ${files.length} ${options.full ? "tracked" : "changed"} files...`,
		);

		// Resolve absolute paths
		let repoRoot: string;
		try {
			repoRoot = execSync("git rev-parse --show-toplevel", {
				encoding: "utf-8",
			}).trim();
		} catch {
			console.error("Failed to determine repository root.");
			process.exit(1);
		}
		const absFiles = files.map((f) => ({
			path: path.resolve(repoRoot, f),
		}));

		// Run parser
		let parser: ParserProcess;
		try {
			parser = new ParserProcess();
		} catch (err) {
			console.error(`${err}`);
			process.exit(1);
		}

		let nodes: ParsedNodeRaw[] = [];
		let edges: ParsedEdgeRaw[] = [];

		try {
			const result = await parser.parse(absFiles);
			nodes = result.nodes;
			edges = result.edges;
		} catch (err) {
			console.error(`Parser error: ${err}`);
			process.exit(1);
		} finally {
			parser.kill();
		}

		// Write overlay SQLite
		const overlayDir = path.join(homedir(), ".kokuin", projectId, branch);
		mkdirSync(overlayDir, { recursive: true });
		const overlayPath = path.join(overlayDir, "overlay.db");

		const store = new GraphStore(overlayPath);
		try {
			store.upsertNodes(
				nodes.map((n) => ({
					...n,
					isTest: n.isTest ?? false,
				})) as Parameters<typeof store.upsertNodes>[0],
			);
			store.upsertEdges(edges as Parameters<typeof store.upsertEdges>[0]);
			store.rebuildFts();
			const stats = store.getStats();
			console.log(`Parsed: ${stats.nodeCount} nodes, ${stats.edgeCount} edges`);
			console.log(`Overlay saved: ${overlayPath}`);
			console.log("Run `kokuin graph push` to upload to the server.");
		} finally {
			store.close();
		}
	});

graphCommand
	.command("push")
	.description("Push local graph overlay to the server")
	.option("-b, --branch <branch>", "Branch to push overlay for")
	.action(async (options: { branch?: string }) => {
		const repoUrl = getGitRemoteUrl();
		if (!repoUrl) {
			console.error("No git remote found.");
			process.exit(1);
		}

		const client = getApiClient();
		const branch = options.branch ?? getCurrentBranch();

		let projectId: string;
		try {
			projectId = await resolveProjectId(client, repoUrl);
		} catch (err) {
			console.error(`${err}`);
			process.exit(1);
		}

		const overlayPath = path.join(
			homedir(),
			".kokuin",
			projectId,
			branch,
			"overlay.db",
		);

		if (!existsSync(overlayPath)) {
			console.error("No local overlay found. Run `kokuin graph build` first.");
			process.exit(1);
		}

		const store = new GraphStore(overlayPath);
		let rawNodes: GraphNode[];
		let mappedEdges: Array<{
			sourceQualifiedName: string;
			targetQualifiedName: string;
			kind: string;
			weight?: number;
		}>;
		try {
			rawNodes = store.getAllNodes();
			const db = store.getDatabase();
			const edgeRows = db
				.query<
					{
						source_qn: string;
						target_qn: string;
						kind: string;
						weight: number;
					},
					[]
				>(
					`SELECT sn.qualified_name AS source_qn, tn.qualified_name AS target_qn, e.kind, e.weight
           FROM edges e
           JOIN nodes sn ON sn.id = e.source_id
           JOIN nodes tn ON tn.id = e.target_id`,
				)
				.all();
			mappedEdges = edgeRows.map((e) => ({
				sourceQualifiedName: e.source_qn,
				targetQualifiedName: e.target_qn,
				kind: e.kind,
				weight: e.weight,
			}));
		} catch (err) {
			console.error(`Failed to read local overlay: ${err}`);
			process.exit(1);
		} finally {
			store.close();
		}

		// Map snake_case DB rows to camelCase for the server's pushOverlay input schema
		const nodes = rawNodes.map((n: GraphNode) => ({
			kind: n.kind,
			name: n.name,
			qualifiedName: n.qualified_name,
			filePath: n.file_path,
			lineStart: n.line_start,
			lineEnd: n.line_end,
			language: n.language,
			parentName: n.parent_name ?? undefined,
			params: n.params ?? undefined,
			returnType: n.return_type ?? undefined,
			modifiers: n.modifiers ?? undefined,
			isTest: n.is_test === 1,
			fileHash: n.file_hash ?? undefined,
		}));

		console.log(
			`Pushing overlay (${nodes.length} nodes, ${mappedEdges.length} edges) for branch ${branch}...`,
		);

		const headers: Record<string, string> = {
			...client.headers,
			"X-Repo-Url": repoUrl,
		};

		try {
			const stats = await rpcCall<{ nodeCount: number; edgeCount: number }>(
				client.serverUrl,
				"graph/pushOverlay",
				headers,
				{ branch, nodes, edges: mappedEdges },
			);
			console.log("Overlay uploaded successfully.");
			console.log(
				`Server now has: ${stats.nodeCount} nodes, ${stats.edgeCount} edges`,
			);
		} catch (err) {
			const errMsg = `${err}`;
			if (errMsg.includes("401")) {
				console.error("Authentication expired. Run `kokuin login`.");
			} else if (errMsg.includes("403")) {
				console.error("You are not a member of this project.");
			} else {
				console.error(`Failed: ${err}`);
			}
			process.exit(1);
		}
	});
