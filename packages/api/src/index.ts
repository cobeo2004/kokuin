import { ORPCError, os } from "@orpc/server";
import type { Context } from "./context";

export const o = os.$context<Context>();
export const publicProcedure = o;

const requireAuth = o.middleware(async ({ context, next }) => {
	if (!context.session?.user) {
		throw new ORPCError("UNAUTHORIZED");
	}
	return next({ context: { session: context.session } });
});

export const protectedProcedure = publicProcedure.use(requireAuth);

const requireProject = o.middleware(async ({ context, next }) => {
	if (!context.project || !context.projectMember) {
		throw new ORPCError("FORBIDDEN", {
			message: "You are not a member of this project",
		});
	}
	return next({
		context: {
			// biome-ignore lint/style/noNonNullAssertion: guarded above
			project: context.project!,
			// biome-ignore lint/style/noNonNullAssertion: guarded above
			projectMember: context.projectMember!,
		},
	});
});

export const projectProcedure = protectedProcedure.use(requireProject);

const requireProjectAdmin = o.middleware(async ({ context, next }) => {
	if (!context.projectMember || context.projectMember.role !== "admin") {
		throw new ORPCError("FORBIDDEN", { message: "Admin access required" });
	}
	return next({
		context: {
			// biome-ignore lint/style/noNonNullAssertion: guarded above
			project: context.project!,
			projectMember: context.projectMember,
		},
	});
});

export const projectAdminProcedure = projectProcedure.use(requireProjectAdmin);
