import { auth } from "@kokuin/auth";
import prisma from "@kokuin/db";
import type { Context as HonoContext } from "hono";

export type CreateContextOptions = {
	context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
	const session = await auth.api.getSession({
		headers: context.req.raw.headers,
	});

	let project = null;
	let projectMember = null;

	const projectId = context.req.header("X-Project-Id");
	const repoUrl = context.req.header("X-Repo-Url");

	if (session?.user) {
		if (projectId) {
			project = await prisma.project.findUnique({ where: { id: projectId } });
			if (project) {
				projectMember = await prisma.projectMember.findUnique({
					where: {
						projectId_userId: {
							projectId: project.id,
							userId: session.user.id,
						},
					},
				});
			}
		} else if (repoUrl) {
			project = await prisma.project.findFirst({
				where: { githubRepoUrl: repoUrl },
			});
			if (project) {
				projectMember = await prisma.projectMember.findUnique({
					where: {
						projectId_userId: {
							projectId: project.id,
							userId: session.user.id,
						},
					},
				});
			}
		}
	}

	return { session, project, projectMember };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
