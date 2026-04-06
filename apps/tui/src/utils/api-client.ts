import { loadCredentials } from "../auth/credentials.js";

export interface ApiClient {
	serverUrl: string;
	headers: Record<string, string>;
}

export function getApiClient(): ApiClient {
	const creds = loadCredentials();
	if (!creds) {
		console.error("Not authenticated. Run `kokuin login` first.");
		process.exit(1);
	}
	return {
		serverUrl: creds.serverUrl,
		headers: {
			Authorization: `Bearer ${creds.accessToken}`,
			"Content-Type": "application/json",
		},
	};
}
