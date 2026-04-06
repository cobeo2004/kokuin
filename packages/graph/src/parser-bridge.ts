import { type ChildProcess, spawn } from "node:child_process";
import { createInterface, type Interface } from "node:readline";
import type { ParserOutput } from "./types";

export class ParserBridge {
	private process: ChildProcess | null = null;
	private readline: Interface | null = null;
	private requestId = 0;
	private pending = new Map<
		number,
		{
			resolve: (value: unknown) => void;
			reject: (reason: Error) => void;
		}
	>();

	constructor(
		private pythonPath = "python3",
		private scriptPath = "parser/main.py",
	) {}

	async start(): Promise<void> {
		this.process = spawn(this.pythonPath, [this.scriptPath], {
			stdio: ["pipe", "pipe", "pipe"],
		});
		if (!this.process.stdout) throw new Error("Parser process has no stdout");
		this.readline = createInterface({ input: this.process.stdout });
		this.readline.on("line", (line: string) => {
			try {
				const response = JSON.parse(line);
				const pending = this.pending.get(response.id);
				if (pending) {
					this.pending.delete(response.id);
					if (response.error) pending.reject(new Error(response.error.message));
					else pending.resolve(response.result);
				}
			} catch {
				/* ignore non-JSON */
			}
		});
		this.process.stderr?.on("data", (data: Buffer) => {
			console.error(`[parser] ${data.toString().trim()}`);
		});
		const pong = await this.send("ping", {});
		if (pong !== "pong") throw new Error("Parser worker failed ping");
	}

	async parseFiles(
		files: Array<{ path: string; language?: string }>,
	): Promise<ParserOutput> {
		return (await this.send("parse", { files })) as ParserOutput;
	}

	private send(
		method: string,
		params: Record<string, unknown>,
	): Promise<unknown> {
		if (!this.process?.stdin) throw new Error("Parser not started");
		const id = ++this.requestId;
		return new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				this.pending.delete(id);
				reject(new Error(`Parser request ${id} timed out`));
			}, 30_000);
			this.pending.set(id, {
				resolve: (v) => {
					clearTimeout(timeout);
					resolve(v);
				},
				reject: (e) => {
					clearTimeout(timeout);
					reject(e);
				},
			});
			this.process?.stdin?.write(`${JSON.stringify({ id, method, params })}\n`);
		});
	}

	stop(): void {
		this.readline?.close();
		this.process?.kill();
		this.process = null;
		this.readline = null;
		for (const [, p] of this.pending) p.reject(new Error("Parser stopped"));
		this.pending.clear();
	}
}
