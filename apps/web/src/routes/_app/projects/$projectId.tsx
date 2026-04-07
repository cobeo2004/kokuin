import { createFileRoute } from "@tanstack/react-router";
import { ProjectScreen } from "@/screens/projects/ProjectScreen";

export const Route = createFileRoute("/_app/projects/$projectId")({
	component: function RouteComponent() {
		const { projectId } = Route.useParams();
		return <ProjectScreen projectId={projectId} />;
	},
});
