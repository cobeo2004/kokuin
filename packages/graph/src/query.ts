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
	constructor(private store: GraphStore) {}

	query(pattern: QueryPattern, targetQualifiedName: string): QueryResult {
		const targetNode = this.store.getNodeByQualifiedName(targetQualifiedName);
		if (!targetNode) return { nodes: [], edges: [] };

		const mapping = PATTERN_TO_EDGE[pattern];
		const edges = this.store.getEdgesByKind(
			targetNode.id,
			mapping.kind,
			mapping.direction,
		);

		// For "in" direction, related nodes are the sources; for "out", they're the targets
		const relatedNodeIds = edges.map((e: GraphEdge) =>
			mapping.direction === "in" ? e.source_id : e.target_id,
		);

		const nodes: GraphNode[] = [];
		for (const id of relatedNodeIds) {
			const node = this.store.getNodeById(id);
			if (node) nodes.push(node);
		}

		return { nodes, edges };
	}
}
