import path from "node:path";
import prisma from "@kokuin/db";
import { env } from "@kokuin/env/server";
import type {
	ChangeInfo,
	ParsedEdge,
	ParsedNode,
	QueryPattern,
} from "@kokuin/graph";
import {
	ChangeDetector,
	FsStorageAdapter,
	GraphStore,
	ImpactAnalyzer,
	MergedGraphStore,
	QueryEngine,
	SearchEngine,
} from "@kokuin/graph";
import { z } from "zod";
import { projectProcedure } from "../index";

const nodeKindSchema = z.enum(["File", "Class", "Function", "Type", "Test"]);
const edgeKindSchema = z.enum([
	"CALLS",
	"IMPORTS_FROM",
	"INHERITS",
	"IMPLEMENTS",
	"CONTAINS",
	"TESTED_BY",
	"DEPENDS_ON",
]);

const parsedNodeSchema = z.object({
	kind: nodeKindSchema,
	name: z.string(),
	qualifiedName: z.string(),
	filePath: z.string(),
	lineStart: z.number().int(),
	lineEnd: z.number().int(),
	language: z.string(),
	parentName: z.string().optional(),
	params: z.string().optional(),
	returnType: z.string().optional(),
	modifiers: z.string().optional(),
	isTest: z.boolean().optional(),
	fileHash: z.string().optional(),
	extra: z.record(z.string(), z.unknown()).optional(),
});

const parsedEdgeSchema = z.object({
	sourceQualifiedName: z.string(),
	targetQualifiedName: z.string(),
	kind: edgeKindSchema,
	weight: z.number().optional(),
	extra: z.record(z.string(), z.unknown()).optional(),
});

const queryInputSchema = z.object({
	pattern: z.enum([
		"callers_of",
		"callees_of",
		"imports_of",
		"imported_by",
		"tests_for",
		"tested_by",
		"contains",
		"contained_in",
	]),
	target: z.string(),
	branch: z.string().optional(),
});

const searchInputSchema = z.object({
	query: z.string().min(1),
	limit: z.number().int().min(1).max(100).default(20),
	branch: z.string().optional(),
});

const impactInputSchema = z.object({
	target: z.string(),
	maxDepth: z.number().int().min(1).max(10).default(3),
	branch: z.string().optional(),
});

const detectChangesInputSchema = z.object({
	changes: z.array(
		z.object({
			filePath: z.string(),
			lineRanges: z.array(z.object({ start: z.number(), end: z.number() })),
		}),
	),
	branch: z.string().optional(),
});

const statusInputSchema = z.object({ branch: z.string().optional() });

const pushOverlayInputSchema = z.object({
	branch: z.string(),
	nodes: z.array(parsedNodeSchema),
	edges: z.array(parsedEdgeSchema),
});

const storage = new FsStorageAdapter(env.GRAPH_DATA_DIR);

function openMergedStore(projectId: string, branch: string, userId: string) {
	const globalPath = storage.getGraphPath(projectId, branch);
	const globalStore = new GraphStore(globalPath);
	let overlayStore: GraphStore | null = null;
	if (storage.overlayExists(userId, projectId, branch)) {
		overlayStore = new GraphStore(
			storage.getOverlayPath(userId, projectId, branch),
		);
	}
	return new MergedGraphStore(globalStore, overlayStore);
}

function withMergedMaterialized<T>(
	projectId: string,
	branch: string,
	userId: string,
	run: (store: GraphStore) => T,
): T {
	const merged = openMergedStore(projectId, branch, userId);
	let materialized: GraphStore | null = null;
	try {
		materialized = merged.materialize();
		return run(materialized);
	} finally {
		materialized?.close();
		merged.close();
	}
}

export const graphRouter = {
	query: projectProcedure
		.input(queryInputSchema)
		.handler(({ input, context }) => {
			const branch = input.branch ?? context.project.defaultBranch;
			return withMergedMaterialized(
				context.project.id,
				branch,
				context.session.user.id,
				(store) =>
					new QueryEngine(store).query(
						input.pattern as QueryPattern,
						input.target,
					),
			);
		}),

	search: projectProcedure
		.input(searchInputSchema)
		.handler(({ input, context }) => {
			const branch = input.branch ?? context.project.defaultBranch;
			return withMergedMaterialized(
				context.project.id,
				branch,
				context.session.user.id,
				(store) => {
					store.rebuildFts();
					return new SearchEngine(store).search(input.query, {
						limit: input.limit,
					});
				},
			);
		}),

	impactRadius: projectProcedure
		.input(impactInputSchema)
		.handler(({ input, context }) => {
			const branch = input.branch ?? context.project.defaultBranch;
			return withMergedMaterialized(
				context.project.id,
				branch,
				context.session.user.id,
				(store) =>
					new ImpactAnalyzer(store).getImpactRadius(
						input.target,
						input.maxDepth,
					),
			);
		}),

	detectChanges: projectProcedure
		.input(detectChangesInputSchema)
		.handler(({ input, context }) => {
			const branch = input.branch ?? context.project.defaultBranch;
			return withMergedMaterialized(
				context.project.id,
				branch,
				context.session.user.id,
				(store) =>
					new ChangeDetector(store).mapChangesToNodes(
						input.changes as ChangeInfo[],
					),
			);
		}),

	status: projectProcedure
		.input(statusInputSchema)
		.handler(async ({ input, context }) => {
			const branch = input.branch ?? context.project.defaultBranch;
			const build = await prisma.graphBuild.findUnique({
				where: {
					projectId_branch: { projectId: context.project.id, branch },
				},
			});
			const overlay = await prisma.userGraphOverlay.findUnique({
				where: {
					userId_projectId_branch: {
						userId: context.session.user.id,
						projectId: context.project.id,
						branch,
					},
				},
			});
			return {
				global: build
					? {
							status: build.status,
							commitSha: build.commitSha,
							nodeCount: build.nodeCount,
							edgeCount: build.edgeCount,
							updatedAt: build.updatedAt,
						}
					: null,
				overlay: overlay
					? {
							nodeCount: overlay.nodeCount,
							edgeCount: overlay.edgeCount,
							lastSyncedAt: overlay.lastSyncedAt,
						}
					: null,
			};
		}),

	pushOverlay: projectProcedure
		.input(pushOverlayInputSchema)
		.handler(async ({ input, context }) => {
			const overlayPath = storage.getOverlayPath(
				context.session.user.id,
				context.project.id,
				input.branch,
			);
			storage.ensureDir(path.dirname(overlayPath));
			const overlayStore = new GraphStore(overlayPath);
			try {
				overlayStore.upsertNodes(input.nodes as ParsedNode[]);
				overlayStore.upsertEdges(input.edges as ParsedEdge[]);
				overlayStore.rebuildFts();
				const stats = overlayStore.getStats();
				await prisma.userGraphOverlay.upsert({
					where: {
						userId_projectId_branch: {
							userId: context.session.user.id,
							projectId: context.project.id,
							branch: input.branch,
						},
					},
					create: {
						userId: context.session.user.id,
						projectId: context.project.id,
						branch: input.branch,
						sqlitePath: overlayPath,
						nodeCount: stats.nodeCount,
						edgeCount: stats.edgeCount,
					},
					update: {
						sqlitePath: overlayPath,
						nodeCount: stats.nodeCount,
						edgeCount: stats.edgeCount,
						lastSyncedAt: new Date(),
					},
				});
				return stats;
			} finally {
				overlayStore.close();
			}
		}),
};
