import type { AppRouterClient } from "@kokuin/api/routers/index";
import type { createTanstackQueryUtils } from "@orpc/tanstack-query";

type Orpc = ReturnType<typeof createTanstackQueryUtils<AppRouterClient>>;

export const listProjects = (orpc: Orpc) =>
	orpc.project.list.queryOptions();

export const createProject = (
	client: AppRouterClient,
	input: {
		name: string;
		orgId: string;
		githubRepoUrl: string;
		defaultBranch?: string;
		allowedDomains?: string[];
	},
) => client.project.create(input);

// Requires a project-scoped orpc instance from getProjectOrpc(projectId)
export const listProjectMembers = (orpc: Orpc) =>
	orpc.project.members.list.queryOptions();

export const addProjectMember = (
	client: AppRouterClient,
	input: { userId: string; role: "admin" | "member" },
) => client.project.members.add(input);

export const updateProjectMemberRole = (
	client: AppRouterClient,
	input: { userId: string; role: "admin" | "member" },
) => client.project.members.updateRole(input);

export const removeProjectMember = (
	client: AppRouterClient,
	input: { userId: string },
) => client.project.members.remove(input);
