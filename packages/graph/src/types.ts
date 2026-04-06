export type NodeKind = "File" | "Class" | "Function" | "Type" | "Test";

export type EdgeKind =
	| "CALLS"
	| "IMPORTS_FROM"
	| "INHERITS"
	| "IMPLEMENTS"
	| "CONTAINS"
	| "TESTED_BY"
	| "DEPENDS_ON";

export interface GraphNode {
	id: number;
	kind: NodeKind;
	name: string;
	qualified_name: string;
	file_path: string;
	line_start: number;
	line_end: number;
	language: string;
	parent_name: string | null;
	params: string | null;
	return_type: string | null;
	modifiers: string | null;
	is_test: number;
	file_hash: string | null;
	extra: string | null;
	updated_at: string;
}

export interface GraphEdge {
	id: number;
	source_id: number;
	target_id: number;
	kind: EdgeKind;
	weight: number;
	extra: string | null;
}

export interface ParsedNode {
	kind: NodeKind;
	name: string;
	qualifiedName: string;
	filePath: string;
	lineStart: number;
	lineEnd: number;
	language: string;
	parentName?: string;
	params?: string;
	returnType?: string;
	modifiers?: string;
	isTest?: boolean;
	fileHash?: string;
	extra?: Record<string, unknown>;
}

export interface ParsedEdge {
	sourceQualifiedName: string;
	targetQualifiedName: string;
	kind: EdgeKind;
	weight?: number;
	extra?: Record<string, unknown>;
}

export interface ParserOutput {
	nodes: ParsedNode[];
	edges: ParsedEdge[];
}

export type QueryPattern =
	| "callers_of"
	| "callees_of"
	| "imports_of"
	| "imported_by"
	| "tests_for"
	| "tested_by"
	| "contains"
	| "contained_in";

export interface QueryResult {
	nodes: GraphNode[];
	edges: GraphEdge[];
}

export interface SearchResult {
	node: GraphNode;
	score: number;
}

export interface ImpactResult {
	affectedNodes: GraphNode[];
	affectedEdges: GraphEdge[];
	depth: number;
}

export interface ChangeInfo {
	filePath: string;
	lineRanges: Array<{ start: number; end: number }>;
}

export interface RiskScoredNode {
	node: GraphNode;
	riskScore: number;
	reasons: string[];
}
