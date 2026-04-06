import type { MergedGraphStore } from "./merge";
import type { GraphStore } from "./store";
import type { GraphEdge, GraphNode, QueryPattern, QueryResult } from "./types";

const PATTERN_TO_EDGE: Record<
	QueryPattern,
	{ kind: string; direction: "in" | "out" }
> = {
	callers_of: { kind: "CALLS", direction: "in" },
	callees_of: { kind: "CALLS", direction: "out" },
	imports_of: { kind: "IMPORTS_FROM", direction: "out" },
	imported_by: { kind: "IMPORTS_FROM", direction: "in" },
	tests_for: { kind: "TESTED_BY", direction: "in" },
	tested_by: { kind: "TESTED_BY", direction: "out" },
	contains: { kind: "CONTAINS", direction: "out" },
	contained_in: { kind: "CONTAINS", direction: "in" },
};

export class QueryEngine {
	constructor(private store: GraphStore | MergedGraphStore) {}

	query(pattern: QueryPattern, targetQualifiedName: string): QueryResult {
		const mapping = PATTERN_TO_EDGE[pattern];

		if (isMergedStore(this.store)) {
			const globalResult = this.queryStore(
				this.store.getGlobalStore(),
				targetQualifiedName,
				mapping.kind,
				mapping.direction,
			);
			const overlayStore = this.store.getOverlayStore();
			if (!overlayStore) {
				return globalResult;
			}
			const overlayResult = this.queryStore(
				overlayStore,
				targetQualifiedName,
				mapping.kind,
				mapping.direction,
			);

			const nodeMap = new Map<string, GraphNode>();
			for (const node of globalResult.nodes) {
				nodeMap.set(node.qualified_name, node);
			}
			for (const node of overlayResult.nodes) {
				nodeMap.set(node.qualified_name, node);
			}

			const edgeMap = new Map<string, GraphEdge>();
			for (const edge of globalResult.edges) {
				edgeMap.set(this.edgeKey(edge), edge);
			}
			for (const edge of overlayResult.edges) {
				edgeMap.set(this.edgeKey(edge), edge);
			}

			return {
				nodes: Array.from(nodeMap.values()),
				edges: Array.from(edgeMap.values()),
			};
		}

		return this.queryStore(
			this.store,
			targetQualifiedName,
			mapping.kind,
			mapping.direction,
		);
	}

	private queryStore(
		store: GraphStore,
		targetQualifiedName: string,
		edgeKind: string,
		direction: "in" | "out",
	): QueryResult {
		const targetNode = store.getNodeByQualifiedName(targetQualifiedName);
		if (!targetNode) return { nodes: [], edges: [] };

		const edges = store.getEdgesByKind(targetNode.id, edgeKind, direction);
		const relatedNodeIds = edges.map((e) =>
			direction === "in" ? e.source_id : e.target_id,
		);

		const nodes: GraphNode[] = [];
		for (const id of relatedNodeIds) {
			const node = store.getNodeById(id);
			if (node) nodes.push(node);
		}

		return { nodes, edges };
	}

	private edgeKey(edge: GraphEdge): string {
		return `${edge.source_id}:${edge.target_id}:${edge.kind}:${edge.weight}:${edge.extra ?? ""}`;
	}
}

function isMergedStore(
	store: GraphStore | MergedGraphStore,
): store is MergedGraphStore {
	return "getGlobalStore" in store;
}
