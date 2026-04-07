import { useQuery } from "@tanstack/react-query";
import { listProjects } from "@/services/project.service";
import { orpc } from "@/utils/orpc";

export function useProjects() {
	const projects = useQuery(listProjects(orpc));
	return {
		projects: projects.data ?? [],
		isPending: projects.isPending,
		error: projects.error,
	};
}
