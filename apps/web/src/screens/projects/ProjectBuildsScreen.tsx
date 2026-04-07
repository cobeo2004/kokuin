import { Skeleton } from "@kokuin/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useProjectBuilds } from "@/hooks/useProjectBuilds";
import { getProjectOrpc } from "@/utils/orpc";
import { BuildsListView } from "@/views/projects/BuildsListView";

interface ProjectBuildsScreenProps {
	projectId: string;
}

export function ProjectBuildsScreen({ projectId }: ProjectBuildsScreenProps) {
	const projectOrpc = useMemo(() => getProjectOrpc(projectId), [projectId]);
	const project = useQuery(projectOrpc.project.getById.queryOptions());
	const { buildStatus, isPending } = useProjectBuilds(projectId);

	if (project.isPending) return <Skeleton className="m-6 h-48 w-full" />;

	if (project.isError || !project.data) {
		return (
			<div className="container mx-auto p-6">
				<p className="text-muted-foreground text-sm">Project not found.</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto space-y-6 p-6">
			<h1 className="font-bold text-2xl">Graph Builds</h1>
			<BuildsListView
				buildStatus={buildStatus}
				defaultBranch={project.data.defaultBranch}
				isPending={isPending}
			/>
		</div>
	);
}
