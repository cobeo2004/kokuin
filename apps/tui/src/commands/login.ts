import { Command } from "commander";
import { clearCredentials, loadCredentials } from "../auth/credentials.js";
import { runDeviceFlow } from "../auth/device-flow.js";

export const loginCommand = new Command("login")
	.description("Authenticate with a Kokuin server")
	.option("-s, --server <url>", "Server URL", "https://app.kokuin.dev")
	.option(
		"-w, --web-url <url>",
		"Web app URL (for device page, defaults to server URL)",
	)
	.action(async (options: { server: string; webUrl?: string }) => {
		await runDeviceFlow(options.server, options.webUrl);
	});

export const logoutCommand = new Command("logout")
	.description("Remove stored credentials")
	.action(() => {
		clearCredentials();
		console.log("Logged out.");
	});

export const whoamiCommand = new Command("whoami")
	.description("Show the currently authenticated user")
	.action(() => {
		const creds = loadCredentials();
		if (!creds) {
			console.log("Not authenticated. Run `kokuin login` first.");
			process.exit(1);
		}
		console.log(`User ID:    ${creds.userId}`);
		console.log(`Server:     ${creds.serverUrl}`);
	});
