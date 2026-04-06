import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { ImpactAnalyzer } from "../src/impact";
import { GraphStore } from "../src/store";
import { sampleEdges, sampleNodes } from "./fixtures/sample-nodes";

describe("ImpactAnalyzer", () => {
	let store: GraphStore;
	let analyzer: ImpactAnalyzer;

	beforeEach(() => {
		store = new GraphStore(":memory:");
		store.upsertNodes(sampleNodes);
		store.upsertEdges(sampleEdges);
		analyzer = new ImpactAnalyzer(store);
	});

	afterEach(() => {
		store.close();
	});

	test("finds direct callers at depth 1", () => {
		// validateToken is called by login — login should appear at depth 1
		const result = analyzer.getImpactRadius("/src/auth.ts::validateToken", 1);
		const names = result.affectedNodes.map((n) => n.name);
		expect(names).toContain("login");
		expect(result.depth).toBe(1);
	});

	test("finds transitive callers at depth 2", () => {
		// validateToken <- login <- handleLogin
		const result = analyzer.getImpactRadius("/src/auth.ts::validateToken", 2);
		const names = result.affectedNodes.map((n) => n.name);
		expect(names).toContain("login");
		expect(names).toContain("handleLogin");
		expect(result.depth).toBe(2);
	});

	test("respects max nodes limit", () => {
		// maxNodes=1 should stop after the first affected node
		const result = analyzer.getImpactRadius(
			"/src/auth.ts::validateToken",
			3,
			1,
		);
		expect(result.affectedNodes.length).toBeLessThanOrEqual(1);
		expect(result.affectedEdges.length).toBeLessThanOrEqual(1);
	});

	test("returns empty for unknown node", () => {
		const result = analyzer.getImpactRadius("/does/not/exist::unknown");
		expect(result.affectedNodes).toHaveLength(0);
		expect(result.affectedEdges).toHaveLength(0);
		expect(result.depth).toBe(0);
	});
});
