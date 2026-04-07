import { execSync } from "node:child_process";

export function getGitRemoteUrl(): string | null {
	try {
		const url = execSync("git remote get-url origin", {
			encoding: "utf-8",
		}).trim();
		const normalized = url
			.replace(/^https?:\/\//, "")
			.replace(/^git@([^:]+):/, "$1/")
			.replace(/\.git$/, "");
		return `https://${normalized}`;
	} catch {
		return null;
	}
}

export function getCurrentBranch(): string {
	try {
		return execSync("git rev-parse --abbrev-ref HEAD", {
			encoding: "utf-8",
		}).trim();
	} catch {
		return "main";
	}
}

export function getChangedFiles(): string[] {
	try {
		const output = execSync("git diff --name-only HEAD", {
			encoding: "utf-8",
		}).trim();
		return output ? output.split("\n") : [];
	} catch {
		return [];
	}
}
