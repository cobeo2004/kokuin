import {
	chmodSync,
	existsSync,
	mkdirSync,
	readFileSync,
	unlinkSync,
	writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

interface Credentials {
	accessToken: string;
	userId: string;
	serverUrl: string;
}

const CONFIG_DIR = join(homedir(), ".kokuin");
const CREDS_FILE = join(CONFIG_DIR, "credentials.json");

export function saveCredentials(creds: Credentials): void {
	if (!existsSync(CONFIG_DIR)) {
		mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
	}
	chmodSync(CONFIG_DIR, 0o700);
	writeFileSync(CREDS_FILE, JSON.stringify(creds, null, 2), {
		mode: 0o600,
	});
	chmodSync(CREDS_FILE, 0o600);
}

export function loadCredentials(): Credentials | null {
	if (!existsSync(CREDS_FILE)) return null;
	try {
		return JSON.parse(readFileSync(CREDS_FILE, "utf-8")) as Credentials;
	} catch {
		return null;
	}
}

export function clearCredentials(): void {
	if (existsSync(CREDS_FILE)) unlinkSync(CREDS_FILE);
}
