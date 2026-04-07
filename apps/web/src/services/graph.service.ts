import type { AppRouterClient } from "@kokuin/api/routers/index";
import type { createTanstackQueryUtils } from "@orpc/tanstack-query";

type Orpc = ReturnType<typeof createTanstackQueryUtils<AppRouterClient>>;

// Requires a project-scoped orpc instance from getProjectOrpc(projectId)
// Queries the default branch. Pass a project-scoped orpc built with getProjectOrpc(projectId).
export const getGraphStatus = (orpc: Orpc) =>
	orpc.graph.status.queryOptions({ input: {} });
