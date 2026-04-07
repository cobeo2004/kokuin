import { Badge } from "@kokuin/ui/components/badge";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@kokuin/ui/components/card";
import { Skeleton } from "@kokuin/ui/components/skeleton";
import { Activity, Calendar, GitBranch } from "lucide-react";
import { type GraphBuild, statusVariant } from "@/utils/buildStatus";

interface Project {
	name: string;
	defaultBranch: string;
	githubRepoUrl: string;
	createdAt: Date | string;
}

interface ProjectOverviewViewProps {
	project: Project | null;
	buildStatus: { global: GraphBuild | null } | null;
	isPending: boolean;
}

export function ProjectOverviewView({
	project,
	buildStatus,
	isPending,
}: ProjectOverviewViewProps) {
	if (isPending) {
		return (
			<div className="grid gap-4 sm:grid-cols-2">
				<Skeleton className="h-32" />
				<Skeleton className="h-32" />
			</div>
		);
	}

	if (!project) return null;

	const globalBuild = buildStatus?.global ?? null;

	return (
		<div className="grid gap-4 sm:grid-cols-2">
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="font-medium text-muted-foreground text-sm">
						Project Info
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2 text-sm">
					<div className="flex items-center gap-2">
						<GitBranch className="h-4 w-4 text-muted-foreground" />
						<code className="rounded bg-secondary px-1.5 py-0.5 text-xs">
							{project.defaultBranch}
						</code>
					</div>
					<div className="flex items-center gap-2">
						<Calendar className="h-4 w-4 text-muted-foreground" />
						<span className="text-muted-foreground">
							Created {new Date(project.createdAt).toLocaleDateString()}
						</span>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="font-medium text-muted-foreground text-sm">
						Graph Build
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2 text-sm">
					{globalBuild ? (
						<>
							<div className="flex items-center gap-2">
								<Activity className="h-4 w-4 text-muted-foreground" />
								<Badge variant={statusVariant(globalBuild.status)}>
									{globalBuild.status}
								</Badge>
							</div>
							{globalBuild.nodeCount != null && (
								<p className="text-muted-foreground text-xs">
									{globalBuild.nodeCount} nodes · {globalBuild.edgeCount ?? 0}{" "}
									edges
								</p>
							)}
							{globalBuild.updatedAt && (
								<p className="text-muted-foreground text-xs">
									Updated {new Date(globalBuild.updatedAt).toLocaleString()}
								</p>
							)}
						</>
					) : (
						<p className="text-muted-foreground text-xs">
							No build yet. Use the CLI to trigger one.
						</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
