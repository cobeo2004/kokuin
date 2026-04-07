import { type ChildProcess, spawn } from "node:child_process";
import path from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";

export interface ParsedNodeRaw {
	kind: string;
	name: string;
	qualifiedName: string;
	filePath: string;
	lineStart: number;
	lineEnd: number;
	language: string;
	parentName?: string;
	params?: string;
	returnType?: string;
	modifiers?: string;
	isTest?: boolean;
	fileHash?: string;
}

export interface ParsedEdgeRaw {
	sourceQualifiedName: string;
	targetQualifiedName: string;
	kind: string;
	weight?: number;
}

export interface ParseResult {
	nodes: ParsedNodeRaw[];
	edges: ParsedEdgeRaw[];
}

function getParserScriptPath(): string {
	// parser/main.py is 4 levels up from apps/tui/src/utils/
	return path.resolve(
		fileURLToPath(import.meta.url),
		"../../../../parser/main.py",
	);
}

export class ParserProcess {
	private proc: ChildProcess;
	private rl: ReturnType<typeof createInterface>;
	private pending = new Map<
		number,
		{ resolve: (r: ParseResult) => void; reject: (e: Error) => void }
	>();
	private nextId = 1;

	constructor() {
		const pythonBin = process.env.PARSER_PYTHON_PATH ?? "python3";
		const scriptPath = getParserScriptPath();

		this.proc = spawn(pythonBin, [scriptPath], {
			stdio: ["pipe", "pipe", "pipe"],
		});

		if (!this.proc.stdout || !this.proc.stdin) {
			throw new Error(
				"Failed to start Python parser. Make sure python3 is installed.",
			);
		}

		this.proc.stderr?.on("data", (data: Buffer) => {
			process.stderr.write(`[parser] ${data.toString()}`);
		});

		this.rl = createInterface({ input: this.proc.stdout });
		this.rl.on("line", (line) => {
			try {
				const msg = JSON.parse(line) as {
					id: number;
					result?: ParseResult;
					error?: { message: string };
				};
				const handler = this.pending.get(msg.id);
				if (!handler) return;
				this.pending.delete(msg.id);
				if (msg.error) {
					handler.reject(new Error(msg.error.message));
				} else {
					handler.resolve(msg.result ?? { nodes: [], edges: [] });
				}
			} catch {
				// ignore malformed lines
			}
		});
	}

	async parse(
		files: Array<{ path: string; language?: string }>,
	): Promise<ParseResult> {
		const id = this.nextId++;
		return new Promise((resolve, reject) => {
			this.pending.set(id, { resolve, reject });
			const request = JSON.stringify({
				id,
				method: "parse",
				params: { files },
			});
			this.proc.stdin?.write(`${request}\n`);
		});
	}

	kill(): void {
		this.rl.close();
		this.proc.kill();
	}
}
