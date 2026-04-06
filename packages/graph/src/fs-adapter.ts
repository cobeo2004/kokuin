import { existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import type { GraphStorageAdapter } from "./adapter";

function sanitizeBranch(branch: string): string {
	return branch.replace(/[^a-zA-Z0-9_\-.]/g, "_");
}

export class FsStorageAdapter implements GraphStorageAdapter {
	constructor(private readonly baseDir: string) {}

	getGraphPath(projectId: string, branch: string): string {
		return join(this.baseDir, projectId, sanitizeBranch(branch), "graph.db");
	}

	getOverlayPath(userId: string, projectId: string, branch: string): string {
		return join(
			this.baseDir,
			projectId,
			sanitizeBranch(branch),
			"overlays",
			`${userId}.db`,
		);
	}

	exists(projectId: string, branch: string): boolean {
		return existsSync(this.getGraphPath(projectId, branch));
	}

	overlayExists(userId: string, projectId: string, branch: string): boolean {
		return existsSync(this.getOverlayPath(userId, projectId, branch));
	}

	deleteGraph(projectId: string, branch: string): void {
		const p = this.getGraphPath(projectId, branch);
		if (existsSync(p)) {
			rmSync(p);
		}
	}

	deleteOverlay(userId: string, projectId: string, branch: string): void {
		const p = this.getOverlayPath(userId, projectId, branch);
		if (existsSync(p)) {
			rmSync(p);
		}
	}

	ensureDir(path: string): void {
		mkdirSync(path, { recursive: true });
	}
}
