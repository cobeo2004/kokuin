import { existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import type { GraphStorageAdapter } from "./adapter";

function sanitizePathSegment(value: string): string {
	const trimmed = value.trim();
	if (!trimmed) return "_";
	return trimmed.replace(/[^a-zA-Z0-9_\-.]/g, "_");
}

function sanitizeBranch(branch: string): string {
	return sanitizePathSegment(branch);
}

export class FsStorageAdapter implements GraphStorageAdapter {
	constructor(private readonly baseDir: string) {}

	getGraphPath(projectId: string, branch: string): string {
		return join(
			this.baseDir,
			sanitizePathSegment(projectId),
			sanitizeBranch(branch),
			"graph.db",
		);
	}

	getOverlayPath(userId: string, projectId: string, branch: string): string {
		return join(
			this.baseDir,
			sanitizePathSegment(projectId),
			sanitizeBranch(branch),
			"overlays",
			`${sanitizePathSegment(userId)}.db`,
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
