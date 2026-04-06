import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { GraphStore } from "../src/store";
import { sampleEdges, sampleNodes } from "./fixtures/sample-nodes";

describe("GraphStore", () => {
	let store: GraphStore;

	beforeEach(() => {
		store = new GraphStore(":memory:");
	});

	afterEach(() => {
		store.close();
	});

	test("initializes schema on creation — getStats returns 0/0", () => {
		const stats = store.getStats();
		expect(stats.nodeCount).toBe(0);
		expect(stats.edgeCount).toBe(0);
	});

	test("upserts nodes (5 nodes)", () => {
		store.upsertNodes(sampleNodes);
		const stats = store.getStats();
		expect(stats.nodeCount).toBe(5);
	});

	test("upserts edges after nodes exist (5 edges)", () => {
		store.upsertNodes(sampleNodes);
		store.upsertEdges(sampleEdges);
		const stats = store.getStats();
		expect(stats.edgeCount).toBe(5);
	});

	test("gets node by qualified name", () => {
		store.upsertNodes(sampleNodes);
		const node = store.getNodeByQualifiedName("/src/auth.ts::login");
		expect(node).not.toBeNull();
		expect(node?.name).toBe("login");
		expect(node?.kind).toBe("Function");
		expect(node?.file_path).toBe("/src/auth.ts");
	});

	test("returns null for non-existent node", () => {
		store.upsertNodes(sampleNodes);
		const node = store.getNodeByQualifiedName("does-not-exist");
		expect(node).toBeNull();
	});

	test("gets nodes by file path", () => {
		store.upsertNodes(sampleNodes);
		const nodes = store.getNodesByFilePath("/src/auth.ts");
		expect(nodes.length).toBe(3); // auth.ts file + login + validateToken
		const names = nodes.map((n) => n.name);
		expect(names).toContain("auth.ts");
		expect(names).toContain("login");
		expect(names).toContain("validateToken");
	});

	test("removes file data atomically", () => {
		store.upsertNodes(sampleNodes);
		store.upsertEdges(sampleEdges);
		store.removeFileData("/src/auth.ts");
		const nodes = store.getNodesByFilePath("/src/auth.ts");
		expect(nodes.length).toBe(0);
		// edges referencing removed nodes should also be gone (CASCADE)
		const stats = store.getStats();
		expect(stats.nodeCount).toBe(2); // handleLogin + test_login remain
	});

	test("stores file nodes and edges atomically (replace)", () => {
		// First insert
		store.upsertNodes(sampleNodes);
		store.upsertEdges(sampleEdges);

		// Replace auth.ts file data with updated nodes
		const updatedNodes = sampleNodes.filter(
			(n) => n.filePath === "/src/auth.ts",
		);
		const updatedEdges = sampleEdges.filter(
			(e) =>
				e.sourceQualifiedName === "/src/auth.ts" ||
				e.targetQualifiedName.startsWith("/src/auth.ts::"),
		);
		store.storeFileNodesEdges("/src/auth.ts", updatedNodes, updatedEdges);

		const nodes = store.getNodesByFilePath("/src/auth.ts");
		expect(nodes.length).toBe(3); // still 3 nodes for auth.ts
	});
});
