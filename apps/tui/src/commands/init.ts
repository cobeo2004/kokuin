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
			const url = `${client.serverUrl.replace(/\/$/, "")}/rpc/project/byRepoUrl`;
			const res = await fetch(url, {
				method: "POST",
				headers: { ...client.headers, "Content-Type": "application/json" },
				body: JSON.stringify({ json: { url: repoUrl } }),
			});

			if (!res.ok) {
				const text = await res.text();
				console.error(`Server error: ${res.status} ${text}`);
				process.exit(1);
			}

			const envelope = (await res.json()) as { json: unknown };
			const project = envelope.json as {
				id: string;
				name: string;
				githubRepoUrl: string;
				defaultBranch: string;
				role: string;
			} | null;

			if (!project) {
				console.log(`No project found for remote: ${repoUrl}`);
				console.log("Create one at your Kokuin dashboard first.");
				process.exit(1);
			}

			console.log("Project found:");
			console.log(`  ID:      ${project.id}`);
			console.log(`  Name:    ${project.name}`);
			console.log(`  Repo:    ${project.githubRepoUrl}`);
			console.log(`  Branch:  ${project.defaultBranch}`);
			console.log(`  Role:    ${project.role}`);
			console.log("\nRepository is linked to this Kokuin project.");
		} catch (err) {
			console.error(`Failed to connect to server: ${err}`);
			process.exit(1);
		}
	});
