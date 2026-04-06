export interface GraphStorageAdapter {
	getGraphPath(projectId: string, branch: string): string;
	getOverlayPath(userId: string, projectId: string, branch: string): string;
	exists(projectId: string, branch: string): boolean;
	overlayExists(userId: string, projectId: string, branch: string): boolean;
	deleteGraph(projectId: string, branch: string): void;
	deleteOverlay(userId: string, projectId: string, branch: string): void;
	ensureDir(path: string): void;
}
