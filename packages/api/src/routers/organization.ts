import prisma from "@kokuin/db";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { protectedProcedure } from "../index";

export const organizationRouter = {
	list: protectedProcedure.handler(async ({ context }) => {
		const memberships = await prisma.member.findMany({
			where: { userId: context.session.user.id },
			include: { organization: true },
		});
		return memberships.map((m) => ({
			...m.organization,
			role: m.role,
		}));
	}),

	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1).max(100),
				slug: z
					.string()
					.min(1)
					.max(50)
					.regex(
						/^[a-z0-9-]+$/,
						"Slug must be lowercase letters, numbers, hyphens only",
					),
			}),
		)
		.handler(async ({ input, context }) => {
			const existing = await prisma.organization.findUnique({
				where: { slug: input.slug },
			});
			if (existing) {
				throw new ORPCError("CONFLICT", { message: "Slug already taken" });
			}
			const org = await prisma.organization.create({
				data: {
					id: crypto.randomUUID(),
					name: input.name,
					slug: input.slug,
					members: {
						create: {
							id: crypto.randomUUID(),
							userId: context.session.user.id,
							role: "owner",
						},
					},
				},
			});
			return org;
		}),

	delete: protectedProcedure
		.input(z.object({ orgId: z.string() }))
		.handler(async ({ input, context }) => {
			const member = await prisma.member.findUnique({
				where: {
					organizationId_userId: {
						organizationId: input.orgId,
						userId: context.session.user.id,
					},
				},
			});
			if (!member || member.role !== "owner") {
				throw new ORPCError("FORBIDDEN", {
					message: "Only owners can delete organizations",
				});
			}
			await prisma.organization.delete({ where: { id: input.orgId } });
			return { success: true };
		}),
};
