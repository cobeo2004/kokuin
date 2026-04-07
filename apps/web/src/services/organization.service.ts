import type { AppRouterClient } from "@kokuin/api/routers/index";
import type { createTanstackQueryUtils } from "@orpc/tanstack-query";

type Orpc = ReturnType<typeof createTanstackQueryUtils<AppRouterClient>>;

export const listOrganizations = (orpc: Orpc) =>
	orpc.organization.list.queryOptions();

export const createOrganization = (
	client: AppRouterClient,
	input: { name: string; slug: string },
) => client.organization.create(input);

export const deleteOrganization = (
	client: AppRouterClient,
	orgId: string,
) => client.organization.delete({ orgId });
