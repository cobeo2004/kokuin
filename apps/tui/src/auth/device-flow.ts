import { saveCredentials } from "./credentials.js";

interface DeviceAuthResponse {
	deviceCode: string;
	userCode: string;
	verificationUrl: string;
	expiresIn: number;
	interval: number;
}

interface TokenResponse {
	accessToken: string;
	userId: string;
}

interface RpcResponse<T> {
	result?: T;
	error?: { message: string };
}

async function rpcCall<T>(
	serverUrl: string,
	method: string,
	params: Record<string, unknown>,
): Promise<T> {
	const res = await fetch(`${serverUrl}/rpc`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ method, params }),
	});

	if (!res.ok) {
		throw new Error(`RPC request failed: ${res.status} ${res.statusText}`);
	}

	const data = (await res.json()) as RpcResponse<T>;

	if (data.error) {
		throw new Error(data.error.message);
	}

	if (data.result === undefined) {
		throw new Error("RPC response missing result");
	}

	return data.result;
}

export async function runDeviceFlow(serverUrl: string): Promise<void> {
	console.log(`Connecting to ${serverUrl}...`);

	const auth = await rpcCall<DeviceAuthResponse>(
		serverUrl,
		"deviceAuth.authorize",
		{},
	);

	console.log(`\nTo sign in, visit: ${auth.verificationUrl}`);
	console.log(`Enter code: ${auth.userCode}\n`);

	const intervalMs = (auth.interval ?? 5) * 1000;
	const expiresAt = Date.now() + auth.expiresIn * 1000;

	while (Date.now() < expiresAt) {
		await new Promise<void>((resolve) => setTimeout(resolve, intervalMs));

		try {
			const token = await rpcCall<TokenResponse>(
				serverUrl,
				"deviceAuth.token",
				{ deviceCode: auth.deviceCode },
			);

			saveCredentials({
				accessToken: token.accessToken,
				userId: token.userId,
				serverUrl,
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
