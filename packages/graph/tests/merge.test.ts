import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { MergedGraphStore } from "../src/merge";
import { GraphStore } from "../src/store";
import type { ParsedNode } from "../src/types";
import { sampleEdges, sampleNodes } from "./fixtures/sample-nodes";

describe("MergedGraphStore", () => {
	let globalStore: GraphStore;
	let overlayStore: GraphStore;

	beforeEach(() => {
		globalStore = new GraphStore(":memory:");
		overlayStore = new GraphStore(":memory:");
		globalStore.upsertNodes(sampleNodes);
		globalStore.upsertEdges(sampleEdges);
	});

	afterEach(() => {
		globalStore.close();
		overlayStore.close();
	});

	test("returns global results when no overlay data", () => {
		const merged = new MergedGraphStore(globalStore, overlayStore);
		const node = merged.getNodeByQualifiedName("/src/auth.ts::login");
		expect(node).not.toBeNull();
		expect(node?.name).toBe("login");

		const nodes = merged.getNodesByFilePath("/src/auth.ts");
		expect(nodes.length).toBe(3);
	});

	test("overlay overrides global for same qualified_name", () => {
		const modifiedNode: ParsedNode = {
			kind: "Function",
			name: "login",
			qualifiedName: "/src/auth.ts::login",
			filePath: "/src/auth.ts",
			lineStart: 5,
			lineEnd: 99,
			language: "typescript",
			parentName: "auth.ts",
			params: "username: string, password: string, options: LoginOptions",
			returnType: "Promise<User>",
		};
		overlayStore.upsertNodes([modifiedNode]);

		const merged = new MergedGraphStore(globalStore, overlayStore);
		const node = merged.getNodeByQualifiedName("/src/auth.ts::login");
		expect(node).not.toBeNull();
		expect(node?.line_end).toBe(99);
		expect(node?.params).toBe(
			"username: string, password: string, options: LoginOptions",
		);
	});

	test("includes overlay-only nodes not in global", () => {
		const newNode: ParsedNode = {
			kind: "Function",
			name: "logout",
			qualifiedName: "/src/auth.ts::logout",
			filePath: "/src/auth.ts",
			lineStart: 40,
			lineEnd: 55,
			language: "typescript",
			parentName: "auth.ts",
			params: "userId: string",
			returnType: "void",
		};
		overlayStore.upsertNodes([newNode]);

		const merged = new MergedGraphStore(globalStore, overlayStore);
		const node = merged.getNodeByQualifiedName("/src/auth.ts::logout");
		expect(node).not.toBeNull();
		expect(node?.name).toBe("logout");

		const nodes = merged.getNodesByFilePath("/src/auth.ts");
		// 3 global + 1 overlay-only
		expect(nodes.length).toBe(4);
	});

	test("works with null overlay — returns global stats", () => {
		const merged = new MergedGraphStore(globalStore, null);
		const stats = merged.getStats();
		expect(stats.nodeCount).toBe(5);
		expect(stats.edgeCount).toBe(5);
	});
});
