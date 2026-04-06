import type { RouterClient } from "@orpc/server";

import { protectedProcedure, publicProcedure } from "../index";
import { deviceAuthRouter } from "./device-auth";
import { graphRouter } from "./graph";
import { projectRouter } from "./project";

export const appRouter = {
	healthCheck: publicProcedure.handler(() => {
		return "OK";
	}),
	privateData: protectedProcedure.handler(({ context }) => {
		return {
			message: "This is private",
			user: context.session.user,
		};
	}),
	project: projectRouter,
	graph: graphRouter,
	deviceAuth: deviceAuthRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
