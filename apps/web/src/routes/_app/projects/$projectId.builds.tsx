import { Button } from "@kokuin/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@kokuin/ui/components/card";
import { Skeleton } from "@kokuin/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { getProjectOrpc } from "@/utils/orpc";

export const Route = createFileRoute("/_app/projects/$projectId/builds")({
	component: RouteComponent,
});

function statusBadgeClass(status: string) {
	switch (status) {
		case "ready":
			return "bg-green-500/20 text-green-600";
		case "building":
			return "bg-yellow-500/20 text-yellow-600";
		case "failed":
			return "bg-red-500/20 text-red-600";
		default:
			return "bg-secondary text-secondary-foreground";
	}
}

function RouteComponent() {
	const { projectId } = Route.useParams();
	const projectOrpc = useMemo(() => getProjectOrpc(projectId), [projectId]);

	const project = useQuery(projectOrpc.project.getById.queryOptions());
	const defaultBranchStatus = useQuery(
		projectOrpc.graph.status.queryOptions({ input: {} }),
	);

	if (project.isPending) {
		return (
			<div className="container mx-auto space-y-4 p-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-48 w-full" />
			</div>
		)
	}

	if (!project.data) {
		return (
			<div className="container mx-auto p-6">
				<p className="text-muted-foreground">Project not found.</p>
				<Link to="/dashboard">
					<Button variant="outline" className="mt-4">
						Back to Dashboard
					</Button>
				</Link>
			</div>
		)
	}

	const p = project.data;
	const globalBuild = defaultBranchStatus.data?.global;

	return (
		<div className="container mx-auto space-y-6 p-6">
			<div className="flex items-center justify-between">
				<div>
					<div className="mb-1 flex items-center gap-2 text-muted-foreground text-sm">
						<Link to="/dashboard" className="hover:underline">
							Dashboard
						</Link>
						<span>/</span>
						<Link
							to="/projects/$projectId"
							params={{ projectId }}
							className="hover:underline"
						>
							{p.name}
						</Link>
						<span>/</span>
						<span>Builds</span>
					</div>
					<h1 className="font-bold text-2xl">Graph Builds</h1>
				</div>
				<div className="flex gap-2">
					<Link to="/projects/$projectId" params={{ projectId }}>
						<Button variant="outline">Back to Project</Button>
					</Link>
					<Button
						disabled
						title="Triggered automatically via GitHub webhook or CLI push"
					>
						Trigger Build
					</Button>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">
						Default Branch:{" "}
						<span className="rounded border px-2 py-0.5 font-mono text-xs">
							{p.defaultBranch}
						</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					{defaultBranchStatus.isPending ? (
						<div className="space-y-2">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-3/4" />
							<Skeleton className="h-4 w-1/2" />
						</div>
					) : globalBuild ? (
						<div className="space-y-3">
							<div className="flex items-center gap-3">
								<span
									className={`rounded-full px-3 py-1 font-medium text-sm ${statusBadgeClass(globalBuild.status)}`}
								>
									{globalBuild.status}
								</span>
								{globalBuild.commitSha && (
									<span className="font-mono text-muted-foreground text-xs">
										{globalBuild.commitSha.slice(0, 7)}
									</span>
								)}
							</div>

							<div className="grid gap-2 text-sm sm:grid-cols-2">
								<div className="flex justify-between rounded border px-3 py-2">
									<span className="text-muted-foreground">Nodes</span>
									<span className="font-medium">
										{globalBuild.nodeCount ?? 0}
									</span>
								</div>
								<div className="flex justify-between rounded border px-3 py-2">
									<span className="text-muted-foreground">Edges</span>
									<span className="font-medium">
										{globalBuild.edgeCount ?? 0}
									</span>
								</div>
							</div>

							{globalBuild.updatedAt && (
								<p className="text-muted-foreground text-xs">
									Last updated:{" "}
									{new Date(globalBuild.updatedAt).toLocaleString()}
								</p>
							)}

							{globalBuild.status === "failed" && (
								<div className="rounded border border-red-200 bg-red-50 px-3 py-2 dark:border-red-900 dark:bg-red-950/30">
									<p className="font-medium text-red-700 text-sm dark:text-red-400">
										Build Failed
									</p>
									<p className="mt-1 font-mono text-muted-foreground text-xs">
										Check server logs for details.
									</p>
								</div>
							)}
						</div>
					) : (
						<div className="py-4 text-center">
							<p className="text-muted-foreground">
								No build found for this branch.
							</p>
							<p className="mt-1 text-muted-foreground text-xs">
								Push to this branch or use the CLI to trigger a graph build.
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">How Builds Work</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2 text-muted-foreground text-sm">
					<p>
						Graph builds are triggered automatically when you push to a tracked
						branch via the GitHub webhook, or manually using the CLI:
					</p>
					<pre className="rounded bg-secondary/50 px-3 py-2 font-mono text-xs">
						kokuin graph push --branch {p.defaultBranch}
					</pre>
					<p>
						Once built, the graph is available for code review analysis, impact
						radius queries, and MCP tool access.
					</p>
				</CardContent>
			</Card>
		</div>
	)
}
