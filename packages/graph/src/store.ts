import { Database } from "bun:sqlite";
import { CREATE_FTS_SQL, CREATE_TABLES_SQL, REBUILD_FTS_SQL } from "./schema";
import type { GraphEdge, GraphNode, ParsedEdge, ParsedNode } from "./types";

export class GraphStore {
	private db: Database;

	constructor(path: string) {
		this.db = new Database(path);
		this.db.exec("PRAGMA journal_mode=WAL;");
		this.db.exec("PRAGMA foreign_keys=ON;");
		this.db.exec(CREATE_TABLES_SQL);
		this.db.exec(CREATE_FTS_SQL);
	}

	getStats(): { nodeCount: number; edgeCount: number } {
		const nodeCount = (
			this.db
				.query<{ count: number }, []>("SELECT COUNT(*) as count FROM nodes")
				.get() ?? { count: 0 }
		).count;
		const edgeCount = (
			this.db
				.query<{ count: number }, []>("SELECT COUNT(*) as count FROM edges")
				.get() ?? { count: 0 }
		).count;
		return { nodeCount, edgeCount };
	}

	upsertNodes(nodes: ParsedNode[]): void {
		const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO nodes
        (kind, name, qualified_name, file_path, line_start, line_end, language,
         parent_name, params, return_type, modifiers, is_test, file_hash, extra, updated_at)
      VALUES
        ($kind, $name, $qualified_name, $file_path, $line_start, $line_end, $language,
         $parent_name, $params, $return_type, $modifiers, $is_test, $file_hash, $extra, datetime('now'))
    `);

		const insertMany = this.db.transaction((rows: ParsedNode[]) => {
			for (const n of rows) {
				stmt.run({
					$kind: n.kind,
					$name: n.name,
					$qualified_name: n.qualifiedName,
					$file_path: n.filePath,
					$line_start: n.lineStart,
					$line_end: n.lineEnd,
					$language: n.language,
					$parent_name: n.parentName ?? null,
					$params: n.params ?? null,
					$return_type: n.returnType ?? null,
					$modifiers: n.modifiers ?? null,
					$is_test: n.isTest ? 1 : 0,
					$file_hash: n.fileHash ?? null,
					$extra: n.extra != null ? JSON.stringify(n.extra) : null,
				});
			}
		});

		insertMany(nodes);
	}

	upsertEdges(edges: ParsedEdge[]): void {
		const getIdStmt = this.db.prepare<{ id: number }, [string]>(
			"SELECT id FROM nodes WHERE qualified_name = ?",
		);

		const insertStmt = this.db.prepare(`
      INSERT OR REPLACE INTO edges (source_id, target_id, kind, weight, extra)
      VALUES ($source_id, $target_id, $kind, $weight, $extra)
    `);

		const insertMany = this.db.transaction((rows: ParsedEdge[]) => {
			for (const e of rows) {
				const src = getIdStmt.get(e.sourceQualifiedName);
				const tgt = getIdStmt.get(e.targetQualifiedName);
				if (!src || !tgt) continue;
				insertStmt.run({
					$source_id: src.id,
					$target_id: tgt.id,
					$kind: e.kind,
					$weight: e.weight ?? 1.0,
					$extra: e.extra != null ? JSON.stringify(e.extra) : null,
				});
			}
		});

		insertMany(edges);
	}

	getNodeByQualifiedName(qn: string): GraphNode | null {
		return (
			this.db
				.query<GraphNode, [string]>(
					"SELECT * FROM nodes WHERE qualified_name = ?",
				)
				.get(qn) ?? null
		);
	}

	getNodeById(id: number): GraphNode | null {
		return (
			this.db
				.query<GraphNode, [number]>("SELECT * FROM nodes WHERE id = ?")
				.get(id) ?? null
		);
	}

	getNodesByFilePath(fp: string): GraphNode[] {
		return this.db
			.query<GraphNode, [string]>("SELECT * FROM nodes WHERE file_path = ?")
			.all(fp);
	}

	getEdgesFrom(nodeId: number): GraphEdge[] {
		return this.db
			.query<GraphEdge, [number]>("SELECT * FROM edges WHERE source_id = ?")
			.all(nodeId);
	}

	getEdgesTo(nodeId: number): GraphEdge[] {
		return this.db
			.query<GraphEdge, [number]>("SELECT * FROM edges WHERE target_id = ?")
			.all(nodeId);
	}

	getEdgesByKind(
		nodeId: number,
		kind: string,
		direction: "in" | "out",
	): GraphEdge[] {
		const col = direction === "out" ? "source_id" : "target_id";
		return this.db
			.query<GraphEdge, [number, string]>(
				`SELECT * FROM edges WHERE ${col} = ? AND kind = ?`,
			)
			.all(nodeId, kind);
	}

	removeFileData(filePath: string): void {
		this.db.transaction(() => {
			this.db.prepare("DELETE FROM nodes WHERE file_path = ?").run(filePath);
		})();
	}

	storeFileNodesEdges(
		filePath: string,
		nodes: ParsedNode[],
		edges: ParsedEdge[],
	): void {
		this.db.transaction(() => {
			this.db.prepare("DELETE FROM nodes WHERE file_path = ?").run(filePath);
			this.upsertNodes(nodes);
			this.upsertEdges(edges);
		})();
	}

	rebuildFts(): void {
		this.db.exec(REBUILD_FTS_SQL);
	}

	getAllNodes(): GraphNode[] {
		return this.db.query<GraphNode, []>("SELECT * FROM nodes").all();
	}

	getAllEdges(): GraphEdge[] {
		return this.db.query<GraphEdge, []>("SELECT * FROM edges").all();
	}

	getDatabase(): Database {
		return this.db;
	}

	close(): void {
		this.db.close();
	}
}
