import { Skeleton } from "@kokuin/ui/components/skeleton";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@kokuin/ui/components/tabs";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useProjectBuilds } from "@/hooks/useProjectBuilds";
import { useProjectMembers } from "@/hooks/useProjectMembers";
import { getProjectOrpc } from "@/utils/orpc";
import { BuildsListView } from "@/views/projects/BuildsListView";
import { ProjectMembersView } from "@/views/projects/ProjectMembersView";
import { ProjectOverviewView } from "@/views/projects/ProjectOverviewView";

interface ProjectScreenProps {
	projectId: string;
}

export function ProjectScreen({ projectId }: ProjectScreenProps) {
	const { user } = useCurrentUser();
	const projectOrpc = useMemo(() => getProjectOrpc(projectId), [projectId]);
	const project = useQuery(projectOrpc.project.getById.queryOptions());
	const { buildStatus, isPending: buildsPending } = useProjectBuilds(projectId);
	const {
		members,
		isPending: membersPending,
		add,
		updateRole,
		remove,
	} = useProjectMembers(projectId);

	const currentMember = members.find((m) => m.userId === user?.id);
	const isProjectAdmin = currentMember?.role === "admin";

	if (project.isPending) {
		return (
			<div className="container mx-auto space-y-4 p-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-48 w-full" />
			</div>
		);
	}

	if (!project.data) {
		return (
			<div className="container mx-auto p-6">
				<p className="text-muted-foreground">Project not found.</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto space-y-6 p-6">
			<div>
				<h1 className="font-bold text-2xl">{project.data.name}</h1>
				<a
					href={project.data.githubRepoUrl}
					target="_blank"
					rel="noreferrer"
					className="text-muted-foreground text-sm hover:text-foreground"
				>
					{project.data.githubRepoUrl}
				</a>
			</div>

			<Tabs defaultValue="overview">
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="builds">Builds</TabsTrigger>
					{isProjectAdmin && <TabsTrigger value="members">Members</TabsTrigger>}
				</TabsList>

				<TabsContent value="overview" className="mt-4">
					<ProjectOverviewView
						project={project.data}
						buildStatus={buildStatus}
						isPending={buildsPending}
					/>
				</TabsContent>

				<TabsContent value="builds" className="mt-4">
					<BuildsListView
						buildStatus={buildStatus}
						defaultBranch={project.data.defaultBranch}
						isPending={buildsPending}
					/>
				</TabsContent>

				{isProjectAdmin && (
					<TabsContent value="members" className="mt-4">
						<ProjectMembersView
							members={members}
							isPending={membersPending}
							isAdmin={isProjectAdmin}
							currentUserId={user?.id ?? ""}
							add={add}
							updateRole={updateRole}
							remove={remove}
						/>
					</TabsContent>
				)}
			</Tabs>
		</div>
	);
}
