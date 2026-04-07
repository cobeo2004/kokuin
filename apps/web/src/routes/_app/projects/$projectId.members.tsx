import { createFileRoute } from "@tanstack/react-router";
import { ProjectMembersScreen } from "@/screens/projects/ProjectMembersScreen";

export const Route = createFileRoute("/_app/projects/$projectId/members")({
	component: function RouteComponent() {
		const { projectId } = Route.useParams();
		return <ProjectMembersScreen projectId={projectId} />;
	},
});
