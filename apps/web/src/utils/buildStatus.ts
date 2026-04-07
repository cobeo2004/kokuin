export type GraphBuild = {
	status: string;
	nodeCount?: number;
	edgeCount?: number;
	updatedAt?: Date | string;
	branch?: string;
};

export function statusVariant(
	status: string,
): "default" | "secondary" | "destructive" | "outline" {
	if (status === "ready") return "default";
	if (status === "building") return "secondary";
	if (status === "failed") return "destructive";
	return "outline";
}
