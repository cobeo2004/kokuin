import { saveCredentials } from "./credentials.js";

interface DeviceAuthResponse {
	deviceCode: string;
	userCode: string;
	expiresAt: string;
	pollInterval: number;
}

interface TokenResponse {
	accessToken: string;
}

function normalizeServerUrl(serverUrl: string): string {
	return serverUrl.replace(/\/$/, "");
}

async function rpcCall<T>(
	serverUrl: string,
	path: string,
	input?: Record<string, unknown>,
): Promise<T> {
	const url = `${normalizeServerUrl(serverUrl)}/rpc/${path}`;
	const res = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		// ORPC wire format: body must be {"json": <input>}
		body: JSON.stringify({ json: input ?? {} }),
	});

	// ORPC wire format: response is {"json": <output>} or {"json": <error>}
	const envelope = (await res.json()) as { json: unknown };
	const data = envelope.json as T;

	if (!res.ok) {
		const message =
			data && typeof data === "object" && "message" in data
				? String((data as { message?: unknown }).message)
				: `RPC request failed: ${res.status} ${res.statusText}`;
		throw new Error(message);
	}

	return data;
}

export async function runDeviceFlow(serverUrl: string, webUrl?: string): Promise<void> {
	console.log(`Connecting to ${serverUrl}...`);

	const auth = await rpcCall<DeviceAuthResponse>(
		serverUrl,
		"deviceAuth/authorize",
	);

	const verificationUrl = `${normalizeServerUrl(webUrl ?? serverUrl)}/device`;
	console.log(`\nTo sign in, visit: ${verificationUrl}`);
	console.log(`Enter code: ${auth.userCode}\n`);

	const intervalMs = (auth.pollInterval ?? 5) * 1000;
	const expiresAtMs = Date.parse(auth.expiresAt);
	const expiresAt = Number.isNaN(expiresAtMs)
		? Date.now() + 15 * 60 * 1000
		: expiresAtMs;

	while (Date.now() < expiresAt) {
		await new Promise<void>((resolve) => setTimeout(resolve, intervalMs));

		try {
			const token = await rpcCall<TokenResponse>(
				serverUrl,
				"deviceAuth/token",
				{ deviceCode: auth.deviceCode },
			);

			saveCredentials({
				accessToken: token.accessToken,
				userId: "unknown",
				serverUrl: normalizeServerUrl(serverUrl),
			});

			console.log("Successfully authenticated.");
			return;
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			// "authorization_pending" is expected while the user hasn't approved yet
			if (message.includes("authorization_pending")) {
				continue;
			}
			// Any other error is fatal
			throw err;
		}
	}

	throw new Error("Device flow timed out. Please try again.");
}
