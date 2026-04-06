import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { SearchEngine } from "../src/search";
import { GraphStore } from "../src/store";
import { sampleNodes } from "./fixtures/sample-nodes";

describe("SearchEngine", () => {
	let store: GraphStore;
	let search: SearchEngine;

	beforeEach(() => {
		store = new GraphStore(":memory:");
		store.upsertNodes(sampleNodes);
		store.rebuildFts();
		search = new SearchEngine(store);
	});

	afterEach(() => {
		store.close();
	});

	test("finds nodes by name", () => {
		const results = search.search("login");
		expect(results.length).toBeGreaterThan(0);
		expect(results[0].node.name).toBe("login");
	});

	test("finds nodes by file path keyword", () => {
		const results = search.search("auth");
		expect(results.length).toBeGreaterThan(0);
	});

	test("returns empty for no match", () => {
		const results = search.search("zzzznonexistent");
		expect(results).toHaveLength(0);
	});

	test("respects limit parameter", () => {
		const results = search.search("auth", { limit: 2 });
		expect(results.length).toBeLessThanOrEqual(2);
	});

	test("boosting does not crash", () => {
		const results = search.search("Login");
		expect(results).toBeDefined();
	});
});
