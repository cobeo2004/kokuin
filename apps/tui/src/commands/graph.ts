import { Command } from "commander";
import { getApiClient } from "../utils/api-client.js";
import { getGitRemoteUrl } from "../utils/git.js";

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

graphCommand
	.command("status")
	.description("Show global graph and overlay statistics")
	.option("-b, --branch <branch>", "Branch to check")
	.action(async (options: { branch?: string }) => {
		const repoUrl = getGitRemoteUrl();
		const client = getApiClient();

		const headers: Record<string, string> = { ...client.headers };
		if (repoUrl) headers["X-Repo-Url"] = repoUrl;

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

			const headers: Record<string, string> = { ...client.headers };
			if (repoUrl) headers["X-Repo-Url"] = repoUrl;

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

		const headers: Record<string, string> = { ...client.headers };
		if (repoUrl) headers["X-Repo-Url"] = repoUrl;

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
