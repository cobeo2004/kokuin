import type { GraphStore } from "./store";
import type { MergedGraphStore } from "./merge";
import type { GraphEdge, GraphNode, ImpactResult } from "./types";

export class ImpactAnalyzer {
	constructor(private store: GraphStore | MergedGraphStore) {}

	getImpactRadius(
		qualifiedName: string,
		maxDepth = 3,
		maxNodes = 500,
	): ImpactResult {
		const startNode = this.store.getNodeByQualifiedName(qualifiedName);
		if (!startNode) return { affectedNodes: [], affectedEdges: [], depth: 0 };

		const visited = new Set<number>();
		const affectedNodes: GraphNode[] = [];
		const affectedEdges: GraphEdge[] = [];
		let currentDepth = 0;
		let frontier = [startNode.id];
		visited.add(startNode.id);

		while (frontier.length > 0 && currentDepth < maxDepth) {
			currentDepth++;
			const nextFrontier: number[] = [];
			for (const nodeId of frontier) {
				if (affectedNodes.length >= maxNodes) break;
				const incomingEdges = this.store.getEdgesTo(nodeId);
				for (const edge of incomingEdges) {
					if (visited.has(edge.source_id)) continue;
					visited.add(edge.source_id);
					const node = this.store.getNodeById(edge.source_id);
					if (node) {
						affectedNodes.push(node);
						affectedEdges.push(edge);
						nextFrontier.push(edge.source_id);
					}
					if (affectedNodes.length >= maxNodes) break;
				}
			}
			frontier = nextFrontier;
		}
		return { affectedNodes, affectedEdges, depth: currentDepth };
	}
}
