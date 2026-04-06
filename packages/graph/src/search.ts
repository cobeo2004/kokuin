import type { Database } from "bun:sqlite";
import type { GraphStore } from "./store";
import type { GraphNode, SearchResult } from "./types";

interface SearchOptions {
	limit?: number;
	kindFilter?: string;
}

export class SearchEngine {
	private db: Database;

	constructor(store: GraphStore) {
		this.db = store.getDatabase();
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

		return rows
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
}
