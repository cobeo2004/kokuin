import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { ChangeDetector } from "./changes";
import { FsStorageAdapter } from "./fs-adapter";
import { ImpactAnalyzer } from "./impact";
import { MergedGraphStore } from "./merge";
import { QueryEngine } from "./query";
import { SearchEngine } from "./search";
import { GraphStore } from "./store";

interface McpConfig {
	graphDataDir: string;
	projectId: string;
	branch: string;
	userId: string;
}

export function createMcpServer(config: McpConfig): McpServer {
	const storage = new FsStorageAdapter(config.graphDataDir);
	const server = new McpServer({ name: "kokuin-graph", version: "0.1.0" });

	function getMerged(): MergedGraphStore {
		const globalStore = new GraphStore(
			storage.getGraphPath(config.projectId, config.branch),
		);
		let overlay: GraphStore | null = null;
		if (storage.overlayExists(config.userId, config.projectId, config.branch)) {
			overlay = new GraphStore(
				storage.getOverlayPath(config.userId, config.projectId, config.branch),
			);
		}
		return new MergedGraphStore(globalStore, overlay);
	}

	server.tool(
		"query_graph",
		"Query graph: callers_of, callees_of, imports_of, tests_for, contains",
		{
			pattern: z.enum([
				"callers_of",
				"callees_of",
				"imports_of",
				"imported_by",
				"tests_for",
				"tested_by",
				"contains",
				"contained_in",
			]),
			target: z.string(),
		},
		async ({ pattern, target }) => {
			const merged = getMerged();
			try {
				const result = new QueryEngine(merged.getGlobalStore()).query(
					pattern,
					target,
				);
				return {
					content: [
						{ type: "text" as const, text: JSON.stringify(result, null, 2) },
					],
				};
			} finally {
				merged.getGlobalStore().close();
				merged.getOverlayStore()?.close();
			}
		},
	);

	server.tool(
		"semantic_search_nodes",
		"Search for code by keyword",
		{
			query: z.string(),
			limit: z.number().default(20),
		},
		async ({ query, limit }) => {
			const merged = getMerged();
			try {
				const store = merged.getGlobalStore();
				store.rebuildFts();
				const results = new SearchEngine(store).search(query, { limit });
				return {
					content: [
						{ type: "text" as const, text: JSON.stringify(results, null, 2) },
					],
				};
			} finally {
				merged.getGlobalStore().close();
				merged.getOverlayStore()?.close();
			}
		},
	);

	server.tool(
		"get_impact_radius",
		"BFS blast radius from a node",
		{
			target: z.string(),
			maxDepth: z.number().default(3),
		},
		async ({ target, maxDepth }) => {
			const merged = getMerged();
			try {
				const result = new ImpactAnalyzer(
					merged.getGlobalStore(),
				).getImpactRadius(target, maxDepth);
				return {
					content: [
						{ type: "text" as const, text: JSON.stringify(result, null, 2) },
					],
				};
			} finally {
				merged.getGlobalStore().close();
				merged.getOverlayStore()?.close();
			}
		},
	);

	server.tool(
		"detect_changes",
		"Risk-score changed code",
		{
			changes: z.array(
				z.object({
					filePath: z.string(),
					lineRanges: z.array(z.object({ start: z.number(), end: z.number() })),
				}),
			),
		},
		async ({ changes }) => {
			const merged = getMerged();
			try {
				const results = new ChangeDetector(
					merged.getGlobalStore(),
				).mapChangesToNodes(changes);
				return {
					content: [
						{ type: "text" as const, text: JSON.stringify(results, null, 2) },
					],
				};
			} finally {
				merged.getGlobalStore().close();
				merged.getOverlayStore()?.close();
			}
		},
	);

	server.tool("graph_status", "Show graph stats", {}, async () => {
		const merged = getMerged();
		try {
			return {
				content: [
					{
						type: "text" as const,
						text: JSON.stringify(merged.getStats(), null, 2),
					},
				],
			};
		} finally {
			merged.getGlobalStore().close();
			merged.getOverlayStore()?.close();
		}
	});

	return server;
}

async function main(): Promise<void> {
	const config: McpConfig = {
		graphDataDir: process.env.GRAPH_DATA_DIR ?? "./data/graphs",
		projectId: process.env.KOKUIN_PROJECT_ID ?? "",
		branch: process.env.KOKUIN_BRANCH ?? "main",
		userId: process.env.KOKUIN_USER_ID ?? "",
	};
	if (!config.projectId || !config.userId) {
		console.error("KOKUIN_PROJECT_ID and KOKUIN_USER_ID required");
		process.exit(1);
	}
	const server = createMcpServer(config);
	const transport = new StdioServerTransport();
	await server.connect(transport);
}

main().catch(console.error);
