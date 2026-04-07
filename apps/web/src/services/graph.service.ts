import type { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { AppRouterClient } from "@kokuin/api/routers/index";

type Orpc = ReturnType<typeof createTanstackQueryUtils<AppRouterClient>>;

export const getGraphStatus = (orpc: Orpc) =>
	orpc.graph.status.queryOptions({ input: {} });
