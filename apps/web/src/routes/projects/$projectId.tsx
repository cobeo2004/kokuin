import { Button } from "@kokuin/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@kokuin/ui/components/card";
import { Skeleton } from "@kokuin/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useMemo } from "react";
import { getUser } from "@/functions/get-user";
import { getProjectOrpc } from "@/utils/orpc";

export const Route = createFileRoute("/projects/$projectId")({
	component: RouteComponent,
	beforeLoad: async () => {
		const session = await getUser();
		return { session };
	},
	loader: async ({ context }) => {
		if (!context.session) {
			throw redirect({ to: "/login" });
		}
	},
});

function RouteComponent() {
	const { projectId } = Route.useParams();
	const projectOrpc = useMemo(() => getProjectOrpc(projectId), [projectId]);

	const project = useQuery(projectOrpc.project.getById.queryOptions());
	const graphStatus = useQuery(
		projectOrpc.graph.status.queryOptions({ input: {} }),
	);
	const members = useQuery(projectOrpc.project.members.list.queryOptions());

	if (project.isPending) {
		return (
			<div className="container mx-auto space-y-4 p-6">
				<Skeleton className="h-8 w-48" />
				<div className="grid gap-4 sm:grid-cols-2">
					<Skeleton className="h-32" />
					<Skeleton className="h-32" />
				</div>
			</div>
		);
	}

	if (project.error || !project.data) {
		const msg = project.error ? String(project.error) : "Project not found.";
		return (
			<div className="container mx-auto p-6">
				<p className="text-muted-foreground">{msg}</p>
				<Link to="/dashboard">
					<Button variant="outline" className="mt-4">
						Back to Dashboard
					</Button>
				</Link>
			</div>
		);
	}

	const p = project.data;

	return (
		<div className="container mx-auto space-y-6 p-6">
			<div className="flex items-center justify-between">
				<div>
					<div className="mb-1 flex items-center gap-2 text-muted-foreground text-sm">
						<Link to="/dashboard" className="hover:underline">
							Dashboard
						</Link>
						<span>/</span>
						<span>{p.name}</span>
					</div>
					<h1 className="font-bold text-2xl">{p.name}</h1>
				</div>
				<div className="flex gap-2">
					<Link to="/projects/$projectId/members" params={{ projectId }}>
						<Button variant="outline">Members</Button>
					</Link>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Repository</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">URL</span>
							<a
								href={p.githubRepoUrl}
								target="_blank"
								rel="noreferrer"
								className="max-w-[200px] truncate text-primary hover:underline"
							>
								{p.githubRepoUrl}
							</a>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Default branch</span>
							<span className="rounded border px-2 py-0.5 font-mono text-xs">
								{p.defaultBranch}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Members</span>
							<span>{members.data?.length ?? "—"}</span>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-base">Graph Status</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 text-sm">
						{graphStatus.isPending ? (
							<>
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-3/4" />
							</>
						) : graphStatus.data?.global ? (
							<>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Status</span>
									<span
										className={`rounded-full px-2 py-0.5 font-medium text-xs ${
											graphStatus.data.global.status === "ready"
												? "bg-green-500/20 text-green-600"
												: "bg-secondary text-secondary-foreground"
										}`}
									>
										{graphStatus.data.global.status}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Nodes</span>
									<span>{graphStatus.data.global.nodeCount ?? 0}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Edges</span>
									<span>{graphStatus.data.global.edgeCount ?? 0}</span>
								</div>
								{graphStatus.data.global.commitSha && (
									<div className="flex justify-between">
										<span className="text-muted-foreground">Commit</span>
										<span className="font-mono text-xs">
											{graphStatus.data.global.commitSha.slice(0, 7)}
										</span>
									</div>
								)}
							</>
						) : (
							<p className="text-muted-foreground">No graph built yet.</p>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
