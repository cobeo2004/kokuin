import { Command } from "commander";
import { getApiClient } from "../utils/api-client.js";
import { getGitRemoteUrl } from "../utils/git.js";

export const graphCommand = new Command("graph").description(
	"Query and inspect the code review graph",
);

graphCommand
	.command("status")
	.description("Show global graph and overlay statistics")
	.action(async () => {
		const repoUrl = getGitRemoteUrl();
		const client = getApiClient();

		const headers: Record<string, string> = { ...client.headers };
		if (repoUrl) {
			headers["X-Repo-Url"] = repoUrl;
		}

		try {
			const response = await fetch(`${client.serverUrl}/api/graph/status`, {
				headers,
			});

			if (!response.ok) {
				const text = await response.text();
				console.error(`Server error: ${response.status} ${text}`);
				process.exit(1);
			}

			const status = (await response.json()) as {
				globalNodes?: number;
				globalEdges?: number;
				overlayNodes?: number;
				overlayEdges?: number;
				branch?: string;
				updatedAt?: string;
			};

			console.log("Graph status:");
			if (status.globalNodes !== undefined) {
				console.log(`  Global nodes: ${status.globalNodes}`);
				console.log(`  Global edges: ${status.globalEdges ?? 0}`);
			}
			if (status.overlayNodes !== undefined) {
				console.log(`  Overlay nodes: ${status.overlayNodes}`);
				console.log(`  Overlay edges: ${status.overlayEdges ?? 0}`);
			}
			if (status.branch) {
				console.log(`  Branch:       ${status.branch}`);
			}
			if (status.updatedAt) {
				console.log(`  Updated:      ${status.updatedAt}`);
			}
		} catch (err) {
			console.error(`Failed to connect to server: ${err}`);
			process.exit(1);
		}
	});

graphCommand
	.command("query <pattern> <target>")
	.description(
		"Run a pattern query against the graph (patterns: callers_of, callees_of, imports_of, tests_for)",
	)
	.option("-b, --branch <branch>", "Branch to query")
	.action(
		async (pattern: string, target: string, options: { branch?: string }) => {
			const repoUrl = getGitRemoteUrl();
			const client = getApiClient();

			const headers: Record<string, string> = { ...client.headers };
			if (repoUrl) {
				headers["X-Repo-Url"] = repoUrl;
			}

			const params = new URLSearchParams({ pattern, target });
			if (options.branch) {
				params.set("branch", options.branch);
			}

			try {
				const response = await fetch(
					`${client.serverUrl}/api/graph/query?${params.toString()}`,
					{ headers },
				);

				if (!response.ok) {
					const text = await response.text();
					console.error(`Server error: ${response.status} ${text}`);
					process.exit(1);
				}

				const result = (await response.json()) as {
					nodes?: Array<{ id: string; name?: string; file?: string }>;
				};

				const nodes = result.nodes ?? [];
				if (nodes.length === 0) {
					console.log("No results found.");
					return;
				}

				console.log(`Results for ${pattern}(${target}):`);
				for (const node of nodes) {
					const label = node.name ?? node.id;
					const loc = node.file ? ` — ${node.file}` : "";
					console.log(`  ${label}${loc}`);
				}
			} catch (err) {
				console.error(`Failed to connect to server: ${err}`);
				process.exit(1);
			}
		},
	);

graphCommand
	.command("search <term>")
	.description("Search the graph by keyword")
	.option("-b, --branch <branch>", "Branch to search")
	.option("-l, --limit <number>", "Maximum number of results", "20")
	.action(async (term: string, options: { branch?: string; limit: string }) => {
		const repoUrl = getGitRemoteUrl();
		const client = getApiClient();

		const headers: Record<string, string> = { ...client.headers };
		if (repoUrl) {
			headers["X-Repo-Url"] = repoUrl;
		}

		const params = new URLSearchParams({ term, limit: options.limit });
		if (options.branch) {
			params.set("branch", options.branch);
		}

		try {
			const response = await fetch(
				`${client.serverUrl}/api/graph/search?${params.toString()}`,
				{ headers },
			);

			if (!response.ok) {
				const text = await response.text();
				console.error(`Server error: ${response.status} ${text}`);
				process.exit(1);
			}

			const result = (await response.json()) as {
				results?: Array<{
					id: string;
					name?: string;
					file?: string;
					score?: number;
				}>;
			};

			const results = result.results ?? [];
			if (results.length === 0) {
				console.log("No results found.");
				return;
			}

			console.log(`Search results for "${term}" (${results.length}):`);
			for (const node of results) {
				const label = node.name ?? node.id;
				const loc = node.file ? ` — ${node.file}` : "";
				const score =
					node.score !== undefined ? ` (score: ${node.score.toFixed(3)})` : "";
				console.log(`  ${label}${loc}${score}`);
			}
		} catch (err) {
			console.error(`Failed to connect to server: ${err}`);
			process.exit(1);
		}
	});
