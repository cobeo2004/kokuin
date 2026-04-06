import type { Database } from "bun:sqlite";
import type { MergedGraphStore } from "./merge";
import type { GraphStore } from "./store";
import type { GraphNode, SearchResult } from "./types";

interface SearchOptions {
	limit?: number;
	kindFilter?: string;
}

export class SearchEngine {
	private db: Database;
	private merged: MergedGraphStore | null;

	constructor(store: GraphStore | MergedGraphStore) {
		if ("getDatabase" in store) {
			this.db = store.getDatabase();
			this.merged = null;
		} else {
			this.db = store.getGlobalStore().getDatabase();
			this.merged = store;
		}
	}

	search(query: string, options: SearchOptions = {}): SearchResult[] {
		const limit = options.limit ?? 20;

		// Sanitize query for FTS5: wrap in quotes, escape internal quotes
		const sanitized = `"${query.replace(/"/g, '""')}"`;

		const rows = this.db
			.query<GraphNode & { rank: number }, [string, number]>(
				`SELECT nodes.*, nodes_fts.rank
         FROM nodes_fts
         JOIN nodes ON nodes.id = nodes_fts.rowid
         WHERE nodes_fts MATCH ?
         ORDER BY nodes_fts.rank
         LIMIT ?`,
			)
			.all(sanitized, limit);

		const mergedRows = this.mergeOverlayRows(rows);

		return mergedRows
			.map((row) => {
				let score = -row.rank; // FTS5 rank is negative (lower = better)
				score = this.applyBoost(score, query, row);
				const { rank: _, ...node } = row;
				return { node: node as GraphNode, score };
			})
			.sort((a, b) => b.score - a.score);
	}

	private applyBoost(score: number, query: string, node: GraphNode): number {
		let boosted = score;
		if (
			/^[A-Z][a-z]/.test(query) &&
			(node.kind === "Class" || node.kind === "Type")
		) {
			boosted *= 1.5;
		}
		if (/_/.test(query) && node.kind === "Function") {
			boosted *= 1.5;
		}
		if (/\./.test(query)) {
			boosted *= 2.0;
		}
		return boosted;
	}

	private mergeOverlayRows(
		rows: Array<GraphNode & { rank: number }>,
	): Array<GraphNode & { rank: number }> {
		if (!this.merged) {
			return rows;
		}

		const overlayStore = this.merged.getOverlayStore();
		if (!overlayStore) {
			return rows;
		}

		const rowMap = new Map<string, GraphNode & { rank: number }>();
		for (const row of rows) {
			rowMap.set(row.qualified_name, row);
		}

		for (const row of rows) {
			const overlayNode = overlayStore.getNodeByQualifiedName(
				row.qualified_name,
			);
			if (overlayNode) {
				rowMap.set(row.qualified_name, {
					...overlayNode,
					rank: row.rank,
				});
			}
		}

		return Array.from(rowMap.values());
	}
}
