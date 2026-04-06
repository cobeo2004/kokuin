import prisma from "@kokuin/db";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import {
	projectAdminProcedure,
	projectProcedure,
	protectedProcedure,
} from "../index";

export const projectRouter = {
	list: protectedProcedure.handler(async ({ context }) => {
		const memberships = await prisma.projectMember.findMany({
			where: { userId: context.session.user.id },
			include: { project: true },
		});
		return memberships.map((m) => ({ ...m.project, role: m.role }));
	}),

	getById: projectProcedure.handler(async ({ context }) => {
		return context.project;
	}),

	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1).max(100),
				orgId: z.string(),
				githubRepoUrl: z.string().url(),
				defaultBranch: z.string().default("main"),
				allowedDomains: z.array(z.string()).default([]),
			}),
		)
		.handler(async ({ input, context }) => {
			return prisma.project.create({
				data: {
					...input,
					createdBy: context.session.user.id,
					members: {
						create: { userId: context.session.user.id, role: "admin" },
					},
				},
			});
		}),

	update: projectAdminProcedure
		.input(
			z.object({
				name: z.string().min(1).max(100).optional(),
				allowedDomains: z.array(z.string()).optional(),
				defaultBranch: z.string().optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			return prisma.project.update({
				where: { id: context.project.id },
				data: input,
			});
		}),

	delete: projectAdminProcedure.handler(async ({ context }) => {
		await prisma.project.delete({ where: { id: context.project.id } });
		return { success: true };
	}),

	byRepoUrl: protectedProcedure
		.input(z.object({ url: z.string() }))
		.handler(async ({ input, context }) => {
			const project = await prisma.project.findFirst({
				where: { githubRepoUrl: input.url },
			});
			if (!project) return null;
			const membership = await prisma.projectMember.findUnique({
				where: {
					projectId_userId: {
						projectId: project.id,
						userId: context.session.user.id,
					},
				},
			});
			if (!membership) return null;
			return { ...project, role: membership.role };
		}),

	members: {
		list: projectProcedure.handler(async ({ context }) => {
			return prisma.projectMember.findMany({
				where: { projectId: context.project.id },
			});
		}),

		add: projectAdminProcedure
			.input(
				z.object({
					userId: z.string(),
					role: z.enum(["admin", "member"]).default("member"),
				}),
			)
			.handler(async ({ input, context }) => {
				if (context.project.allowedDomains.length > 0) {
					const user = await prisma.user.findUnique({
						where: { id: input.userId },
					});
					if (user) {
						const domain = user.email.split("@")[1] ?? "";
						if (domain && !context.project.allowedDomains.includes(domain)) {
							throw new ORPCError("FORBIDDEN", {
								message: `Email domain @${domain} is not allowed for this project`,
							});
						}
					}
				}
				return prisma.projectMember.create({
					data: {
						projectId: context.project.id,
						userId: input.userId,
						role: input.role,
					},
				});
			}),

		updateRole: projectAdminProcedure
			.input(
				z.object({
					userId: z.string(),
					role: z.enum(["admin", "member"]),
				}),
			)
			.handler(async ({ input, context }) => {
				return prisma.projectMember.update({
					where: {
						projectId_userId: {
							projectId: context.project.id,
							userId: input.userId,
						},
					},
					data: { role: input.role },
				});
			}),

		remove: projectAdminProcedure
			.input(z.object({ userId: z.string() }))
			.handler(async ({ input, context }) => {
				await prisma.projectMember.delete({
					where: {
						projectId_userId: {
							projectId: context.project.id,
							userId: input.userId,
						},
					},
				});
				return { success: true };
			}),
	},
};
