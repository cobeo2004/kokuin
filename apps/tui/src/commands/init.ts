import { Command } from "commander";
import { getApiClient } from "../utils/api-client.js";
import { getGitRemoteUrl } from "../utils/git.js";

export const initCommand = new Command("init")
	.description("Detect git remote and find matching project on server")
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
				console.log(
					"Create one at your Kokuin server or run `kokuin project create`.",
				);
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
			};

			console.log("Project found:");
			console.log(`  ID:      ${project.id}`);
			console.log(`  Name:    ${project.name}`);
			console.log(`  Repo:    ${project.repoUrl}`);
			console.log("\nRepository is linked to this Kokuin project.");
		} catch (err) {
			console.error(`Failed to connect to server: ${err}`);
			process.exit(1);
		}
	});
