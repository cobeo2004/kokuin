import { GraphStore } from "./store";
import type { GraphEdge, GraphNode, ParsedEdge, ParsedNode } from "./types";

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

	materialize(): GraphStore {
		const merged = new GraphStore(":memory:");
		const nodes = this.overlay
			? this.mergeNodes(this.global.getAllNodes(), this.overlay.getAllNodes())
			: this.global.getAllNodes();
		merged.upsertNodes(nodes.map(toParsedNode));

		const allEdges: ParsedEdge[] = [];
		for (const edge of this.global.getAllEdges()) {
			const parsed = toParsedEdge(this.global, edge);
			if (parsed) allEdges.push(parsed);
		}
		if (this.overlay) {
			for (const edge of this.overlay.getAllEdges()) {
				const parsed = toParsedEdge(this.overlay, edge);
				if (parsed) allEdges.push(parsed);
			}
		}
		merged.upsertEdges(allEdges);
		merged.rebuildFts();
		return merged;
	}

	getGlobalStore(): GraphStore {
		return this.global;
	}

	getOverlayStore(): GraphStore | null {
		return this.overlay;
	}

	close(): void {
		this.global.close();
		this.overlay?.close();
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

function toParsedNode(node: GraphNode): ParsedNode {
	return {
		kind: node.kind,
		name: node.name,
		qualifiedName: node.qualified_name,
		filePath: node.file_path,
		lineStart: node.line_start,
		lineEnd: node.line_end,
		language: node.language,
		parentName: node.parent_name ?? undefined,
		params: node.params ?? undefined,
		returnType: node.return_type ?? undefined,
		modifiers: node.modifiers ?? undefined,
		isTest: Boolean(node.is_test),
		fileHash: node.file_hash ?? undefined,
		extra: parseExtra(node.extra),
	};
}

function toParsedEdge(store: GraphStore, edge: GraphEdge): ParsedEdge | null {
	const source = store.getNodeById(edge.source_id);
	const target = store.getNodeById(edge.target_id);
	if (!source || !target) return null;

	return {
		sourceQualifiedName: source.qualified_name,
		targetQualifiedName: target.qualified_name,
		kind: edge.kind,
		weight: edge.weight,
		extra: parseExtra(edge.extra),
	};
}

function parseExtra(extra: string | null): Record<string, unknown> | undefined {
	if (!extra) return undefined;
	try {
		const parsed = JSON.parse(extra);
		if (parsed && typeof parsed === "object") {
			return parsed as Record<string, unknown>;
		}
	} catch {
		return undefined;
	}
	return undefined;
}
