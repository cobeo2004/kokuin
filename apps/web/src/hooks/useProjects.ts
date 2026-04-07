import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { listProjects } from "@/services/project.service";

export function useProjects() {
  const projects = useQuery(listProjects(orpc));
  return {
    projects: projects.data ?? [],
    isPending: projects.isPending,
    error: projects.error,
  };
}
