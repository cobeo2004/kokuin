import { Button } from "@kokuin/ui/components/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useOrganization } from "@/hooks/useOrganization";
import { useProjects } from "@/hooks/useProjects";
import { CreateProjectDialog } from "@/views/dashboard/CreateProjectDialog";
import { ProjectListView } from "@/views/dashboard/ProjectListView";
import { StatsCardsView } from "@/views/dashboard/StatsCardsView";

export function DashboardScreen() {
	const { isOrgAdmin } = useCurrentUser();
	const { org, isPending: orgPending } = useOrganization();
	const {
		projects,
		isPending: projectsPending,
		error: projectsError,
	} = useProjects();
	const [showCreate, setShowCreate] = useState(false);

	const isPending = orgPending || projectsPending;

	if (projectsError) {
		return (
			<div className="container mx-auto p-6">
				<p className="text-destructive text-sm">
					Failed to load projects: {projectsError.message}
				</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto space-y-6 p-6">
			<div className="flex items-center justify-between">
				<h1 className="font-bold text-2xl">Dashboard</h1>
				{isOrgAdmin && (
					<Button onClick={() => setShowCreate(true)} className="gap-2">
						<Plus className="h-4 w-4" />
						New Project
					</Button>
				)}
			</div>

			<StatsCardsView
				projectCount={projects.length}
				memberCount={0}
				isPending={isPending}
			/>

			<ProjectListView
				projects={projects}
				isPending={projectsPending}
				isOrgAdmin={isOrgAdmin}
				onCreateProject={() => setShowCreate(true)}
			/>

			<CreateProjectDialog
				open={showCreate && !!org}
				onClose={() => setShowCreate(false)}
				orgId={org?.id ?? ""}
			/>
		</div>
	);
}
