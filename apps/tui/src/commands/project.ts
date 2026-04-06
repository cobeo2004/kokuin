import { Command } from "commander";
import { getApiClient } from "../utils/api-client.js";
import { getGitRemoteUrl } from "../utils/git.js";

export const projectCommand = new Command("project").description(
	"Manage Kokuin projects",
);

projectCommand
	.command("list")
	.description("List all projects for the authenticated user")
	.action(async () => {
		const client = getApiClient();

		try {
			const response = await fetch(`${client.serverUrl}/api/projects`, {
				headers: client.headers,
			});

			if (!response.ok) {
				const text = await response.text();
				console.error(`Server error: ${response.status} ${text}`);
				process.exit(1);
			}

			const projects = (await response.json()) as Array<{
				id: string;
				name: string;
				repoUrl: string;
			}>;

			if (projects.length === 0) {
				console.log("No projects found.");
				return;
			}

			console.log(`Projects (${projects.length}):`);
			for (const p of projects) {
				console.log(`  ${p.name}`);
				console.log(`    ID:   ${p.id}`);
				console.log(`    Repo: ${p.repoUrl}`);
			}
		} catch (err) {
			console.error(`Failed to connect to server: ${err}`);
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
			const response = await fetch(
				`${client.serverUrl}/api/projects/resolve?repoUrl=${encodeURIComponent(repoUrl)}`,
				{
					headers: {
						...client.headers,
						"X-Repo-Url": repoUrl,
					},
				},
			);

			if (response.status === 404) {
				console.log(`No project found for remote: ${repoUrl}`);
				process.exit(1);
			}

			if (!response.ok) {
				const text = await response.text();
				console.error(`Server error: ${response.status} ${text}`);
				process.exit(1);
			}

			const project = (await response.json()) as {
				id: string;
				name: string;
				repoUrl: string;
				createdAt?: string;
			};

			console.log("Project info:");
			console.log(`  ID:         ${project.id}`);
			console.log(`  Name:       ${project.name}`);
			console.log(`  Repo:       ${project.repoUrl}`);
			if (project.createdAt) {
				console.log(`  Created:    ${project.createdAt}`);
			}
		} catch (err) {
			console.error(`Failed to connect to server: ${err}`);
			process.exit(1);
		}
	});
