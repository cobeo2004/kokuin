import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { QueryEngine } from "../src/query";
import { GraphStore } from "../src/store";
import { sampleEdges, sampleNodes } from "./fixtures/sample-nodes";

describe("QueryEngine", () => {
	let store: GraphStore;
	let engine: QueryEngine;

	beforeEach(() => {
		store = new GraphStore(":memory:");
		store.upsertNodes(sampleNodes);
		store.upsertEdges(sampleEdges);
		engine = new QueryEngine(store);
	});

	afterEach(() => {
		store.close();
	});

	test("callers_of returns functions that call the target", () => {
		const result = engine.query("callers_of", "/src/auth.ts::login");
		const names = result.nodes.map((n) => n.name);
		expect(names).toContain("handleLogin");
	});

	test("callees_of returns functions called by the source", () => {
		const result = engine.query("callees_of", "/src/auth.ts::login");
		const names = result.nodes.map((n) => n.name);
		expect(names).toContain("validateToken");
	});

	test("tests_for returns test nodes for the target", () => {
		const result = engine.query("tests_for", "/src/auth.ts::login");
		const names = result.nodes.map((n) => n.name);
		expect(names).toContain("test_login");
	});

	test("contains returns children of a file", () => {
		const result = engine.query("contains", "/src/auth.ts");
		const names = result.nodes.map((n) => n.name);
		expect(names).toContain("login");
		expect(names).toContain("validateToken");
	});

	test("returns empty result for unknown target", () => {
		const result = engine.query("callers_of", "/does/not/exist");
		expect(result.nodes).toHaveLength(0);
	});
});
