import type { GraphStore } from "./store";
import type { GraphEdge, GraphNode } from "./types";

export class MergedGraphStore {
	constructor(
		private readonly global: GraphStore,
		private readonly overlay: GraphStore | null,
	) {}

	getNodeByQualifiedName(qn: string): GraphNode | null {
		if (this.overlay) {
			const overlayNode = this.overlay.getNodeByQualifiedName(qn);
			if (overlayNode) return overlayNode;
		}
		return this.global.getNodeByQualifiedName(qn);
	}

	getNodeById(id: number): GraphNode | null {
		if (this.overlay) {
			const overlayNode = this.overlay.getNodeById(id);
			if (overlayNode) return overlayNode;
		}
		return this.global.getNodeById(id);
	}

	getNodesByFilePath(fp: string): GraphNode[] {
		const globalNodes = this.global.getNodesByFilePath(fp);
		if (!this.overlay) return globalNodes;

		const overlayNodes = this.overlay.getNodesByFilePath(fp);
		return this.mergeNodes(globalNodes, overlayNodes);
	}

	getStats(): { nodeCount: number; edgeCount: number } {
		const g = this.global.getStats();
		if (!this.overlay) return g;
		const o = this.overlay.getStats();
		return {
			nodeCount: g.nodeCount + o.nodeCount,
			edgeCount: g.edgeCount + o.edgeCount,
		};
	}

	getEdgesTo(id: number): GraphEdge[] {
		const globalEdges = this.global.getEdgesTo(id);
		if (!this.overlay) return globalEdges;
		const overlayEdges = this.overlay.getEdgesTo(id);
		return unionEdges(globalEdges, overlayEdges);
	}

	getEdgesFrom(id: number): GraphEdge[] {
		const globalEdges = this.global.getEdgesFrom(id);
		if (!this.overlay) return globalEdges;
		const overlayEdges = this.overlay.getEdgesFrom(id);
		return unionEdges(globalEdges, overlayEdges);
	}

	getGlobalStore(): GraphStore {
		return this.global;
	}

	getOverlayStore(): GraphStore | null {
		return this.overlay;
	}

	private mergeNodes(global: GraphNode[], overlay: GraphNode[]): GraphNode[] {
		const map = new Map<string, GraphNode>();
		for (const n of global) {
			map.set(n.qualified_name, n);
		}
		for (const n of overlay) {
			map.set(n.qualified_name, n);
		}
		return Array.from(map.values());
	}
}

function unionEdges(a: GraphEdge[], b: GraphEdge[]): GraphEdge[] {
	const seen = new Set<number>();
	const result: GraphEdge[] = [];
	for (const e of a) {
		seen.add(e.id);
		result.push(e);
	}
	for (const e of b) {
		if (!seen.has(e.id)) {
			result.push(e);
		}
	}
	return result;
}
