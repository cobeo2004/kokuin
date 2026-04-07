import type { ApiClient } from "./api-client.js";

export async function resolveProjectId(
	client: ApiClient,
	repoUrl: string,
): Promise<string> {
	const url = `${client.serverUrl.replace(/\/$/, "")}/rpc/project/byRepoUrl`;
	const res = await fetch(url, {
		method: "POST",
		headers: { ...client.headers, "Content-Type": "application/json" },
		body: JSON.stringify({ json: { url: repoUrl } }),
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Server error: ${res.status} ${text}`);
	}

	const envelope = (await res.json()) as { json: unknown };
	const project = envelope.json as { id: string } | null;

	if (!project) {
		throw new Error(
			"No project found for this repository. Run `kokuin init` first.",
		);
	}

	return project.id;
}
