import { auth } from "@kokuin/auth";
import prisma from "@kokuin/db";
import type { Context as HonoContext } from "hono";

export type CreateContextOptions = {
	context: HonoContext;
};

async function resolveSession(context: HonoContext) {
	// Bearer token: CLI device-flow access token
	const authHeader = context.req.header("Authorization");
	if (authHeader?.startsWith("Bearer ")) {
		const token = authHeader.slice("Bearer ".length);
		const record = await prisma.deviceAuthCode.findFirst({
			where: { accessToken: token },
		});
		if (record?.userId) {
			const user = await prisma.user.findUnique({ where: { id: record.userId } });
			if (user) {
				return { user } as Awaited<ReturnType<typeof auth.api.getSession>>;
			}
		}
		return null;
	}
	// Cookie session (web app)
	return auth.api.getSession({ headers: context.req.raw.headers });
}

export async function createContext({ context }: CreateContextOptions) {
	const session = await resolveSession(context);

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
