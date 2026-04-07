import { Badge } from "@kokuin/ui/components/badge";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@kokuin/ui/components/card";
import { Skeleton } from "@kokuin/ui/components/skeleton";

interface GraphBuild {
	status: string;
	nodeCount?: number | null;
	edgeCount?: number | null;
	updatedAt?: Date | string | null;
	commitSha?: string | null;
}

interface GraphStatus {
	global: GraphBuild | null;
}

interface BuildsListViewProps {
	buildStatus: GraphStatus | null;
	defaultBranch: string;
	isPending: boolean;
}

function statusVariant(
	status: string,
): "default" | "secondary" | "destructive" | "outline" {
	if (status === "ready") return "default";
	if (status === "building") return "secondary";
	if (status === "failed") return "destructive";
	return "outline";
}

export function BuildsListView({
	buildStatus,
	defaultBranch,
	isPending,
}: BuildsListViewProps) {
	if (isPending) return <Skeleton className="h-48 w-full" />;

	const globalBuild = buildStatus?.global ?? null;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">
					Build Status —{" "}
					<code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">
						{defaultBranch}
					</code>
				</CardTitle>
			</CardHeader>
			<CardContent>
				{globalBuild ? (
					<div className="space-y-3">
						<div className="flex items-center gap-3">
							<Badge variant={statusVariant(globalBuild.status)}>
								{globalBuild.status}
							</Badge>
							{globalBuild.commitSha && (
								<span className="font-mono text-muted-foreground text-xs">
									{globalBuild.commitSha.slice(0, 7)}
								</span>
							)}
							{globalBuild.updatedAt && (
								<span className="text-muted-foreground text-xs">
									Last updated{" "}
									{new Date(globalBuild.updatedAt).toLocaleString()}
								</span>
							)}
						</div>
						{globalBuild.nodeCount != null && (
							<div className="grid gap-2 text-sm sm:grid-cols-2">
								<div className="flex justify-between rounded border px-3 py-2">
									<span className="text-muted-foreground">Nodes</span>
									<span className="font-medium">{globalBuild.nodeCount}</span>
								</div>
								<div className="flex justify-between rounded border px-3 py-2">
									<span className="text-muted-foreground">Edges</span>
									<span className="font-medium">
										{globalBuild.edgeCount ?? 0}
									</span>
								</div>
							</div>
						)}
						{globalBuild.status === "failed" && (
							<div className="rounded border border-destructive/30 bg-destructive/10 px-3 py-2">
								<p className="font-medium text-destructive text-sm">
									Build Failed
								</p>
								<p className="mt-1 text-muted-foreground text-xs">
									Check server logs for details.
								</p>
							</div>
						)}
					</div>
				) : (
					<div className="py-8 text-center">
						<p className="text-muted-foreground text-sm">
							No build found for this branch.
						</p>
						<p className="mt-1 text-muted-foreground text-xs">
							Push to this branch or use{" "}
							<code className="rounded bg-secondary px-1 py-0.5 text-xs">
								kokuin graph push
							</code>{" "}
							to trigger a build.
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
