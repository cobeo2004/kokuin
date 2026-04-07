import { createFileRoute } from "@tanstack/react-router";
import { ProjectBuildsScreen } from "@/screens/projects/ProjectBuildsScreen";

export const Route = createFileRoute("/_app/projects/$projectId/builds")({
	component: function RouteComponent() {
		const { projectId } = Route.useParams();
		return <ProjectBuildsScreen projectId={projectId} />;
	},
});
