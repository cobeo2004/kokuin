import { Command } from "commander";
import { getApiClient } from "../utils/api-client.js";
import { getGitRemoteUrl } from "../utils/git.js";

export const projectCommand = new Command("project").description(
	"Manage Kokuin projects",
);

async function rpcCall<T>(
	serverUrl: string,
	path: string,
	headers: Record<string, string>,
	input?: unknown,
): Promise<T> {
	const url = `${serverUrl.replace(/\/$/, "")}/rpc/${path}`;
	const res = await fetch(url, {
		method: "POST",
		headers: { ...headers, "Content-Type": "application/json" },
		body: JSON.stringify({ json: input ?? {} }),
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`${res.status} ${text}`);
	}
	const envelope = (await res.json()) as { json: unknown };
	return envelope.json as T;
}

projectCommand
	.command("list")
	.description("List all projects for the authenticated user")
	.action(async () => {
		const client = getApiClient();
		try {
			const projects = await rpcCall<
				Array<{ id: string; name: string; githubRepoUrl: string; role: string }>
			>(client.serverUrl, "project/list", client.headers);

			if (projects.length === 0) {
				console.log("No projects found.");
				return;
			}

			console.log(`Projects (${projects.length}):`);
			for (const p of projects) {
				console.log(`  ${p.name} [${p.role}]`);
				console.log(`    ID:   ${p.id}`);
				console.log(`    Repo: ${p.githubRepoUrl}`);
			}
		} catch (err) {
			console.error(`Failed: ${err}`);
			process.exit(1);
		}
	});

projectCommand
	.command("info")
	.description("Show details for the current repository's project")
	.action(async () => {
		const repoUrl = getGitRemoteUrl();
		if (!repoUrl) {
			console.error(
				"No git remote found. Make sure you are inside a git repository with an origin remote.",
			);
			process.exit(1);
		}

		const client = getApiClient();
		try {
			const project = await rpcCall<{
				id: string;
				name: string;
				githubRepoUrl: string;
				defaultBranch: string;
				role: string;
				createdAt?: string;
			} | null>(client.serverUrl, "project/byRepoUrl", client.headers, {
				url: repoUrl,
			});

			if (!project) {
				console.log(`No project found for remote: ${repoUrl}`);
				process.exit(1);
			}

			console.log("Project info:");
			console.log(`  ID:      ${project.id}`);
			console.log(`  Name:    ${project.name}`);
			console.log(`  Repo:    ${project.githubRepoUrl}`);
			console.log(`  Branch:  ${project.defaultBranch}`);
			console.log(`  Role:    ${project.role}`);
			if (project.createdAt) {
				console.log(
					`  Created: ${new Date(project.createdAt).toLocaleDateString()}`,
				);
			}
		} catch (err) {
			console.error(`Failed: ${err}`);
			process.exit(1);
		}
	});
