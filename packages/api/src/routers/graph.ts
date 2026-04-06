import prisma from "@kokuin/db";
import { env } from "@kokuin/env/server";
import type { ChangeInfo, QueryPattern } from "@kokuin/graph";
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

export const graphRouter = {
	query: projectProcedure
		.input(
			z.object({
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
			}),
		)
		.handler(({ input, context }) => {
			const branch = input.branch ?? context.project.defaultBranch;
			const merged = openMergedStore(
				context.project.id,
				branch,
				context.session.user.id,
			);
			try {
				const engine = new QueryEngine(merged.getGlobalStore());
				return engine.query(input.pattern as QueryPattern, input.target);
			} finally {
				merged.getGlobalStore().close();
				merged.getOverlayStore()?.close();
			}
		}),

	search: projectProcedure
		.input(
			z.object({
				query: z.string().min(1),
				limit: z.number().int().min(1).max(100).default(20),
				branch: z.string().optional(),
			}),
		)
		.handler(({ input, context }) => {
			const branch = input.branch ?? context.project.defaultBranch;
			const merged = openMergedStore(
				context.project.id,
				branch,
				context.session.user.id,
			);
			try {
				const store = merged.getGlobalStore();
				store.rebuildFts();
				return new SearchEngine(store).search(input.query, {
					limit: input.limit,
				});
			} finally {
				merged.getGlobalStore().close();
				merged.getOverlayStore()?.close();
			}
		}),

	impactRadius: projectProcedure
		.input(
			z.object({
				target: z.string(),
				maxDepth: z.number().int().min(1).max(10).default(3),
				branch: z.string().optional(),
			}),
		)
		.handler(({ input, context }) => {
			const branch = input.branch ?? context.project.defaultBranch;
			const merged = openMergedStore(
				context.project.id,
				branch,
				context.session.user.id,
			);
			try {
				return new ImpactAnalyzer(merged.getGlobalStore()).getImpactRadius(
					input.target,
					input.maxDepth,
				);
			} finally {
				merged.getGlobalStore().close();
				merged.getOverlayStore()?.close();
			}
		}),

	detectChanges: projectProcedure
		.input(
			z.object({
				changes: z.array(
					z.object({
						filePath: z.string(),
						lineRanges: z.array(
							z.object({ start: z.number(), end: z.number() }),
						),
					}),
				),
				branch: z.string().optional(),
			}),
		)
		.handler(({ input, context }) => {
			const branch = input.branch ?? context.project.defaultBranch;
			const merged = openMergedStore(
				context.project.id,
				branch,
				context.session.user.id,
			);
			try {
				return new ChangeDetector(merged.getGlobalStore()).mapChangesToNodes(
					input.changes as ChangeInfo[],
				);
			} finally {
				merged.getGlobalStore().close();
				merged.getOverlayStore()?.close();
			}
		}),

	status: projectProcedure
		.input(z.object({ branch: z.string().optional() }))
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
		.input(
			z.object({
				branch: z.string(),
				nodes: z.array(z.any()),
				edges: z.array(z.any()),
			}),
		)
		.handler(async ({ input, context }) => {
			const overlayPath = storage.getOverlayPath(
				context.session.user.id,
				context.project.id,
				input.branch,
			);
			const overlayStore = new GraphStore(overlayPath);
			try {
				overlayStore.upsertNodes(input.nodes);
				overlayStore.upsertEdges(input.edges);
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
