import { useQuery } from "@tanstack/react-query";
import { getProjectOrpc } from "@/utils/orpc";
import { getGraphStatus } from "@/services/graph.service";

export function useProjectBuilds(projectId: string) {
  const status = useQuery(getGraphStatus(getProjectOrpc(projectId)));
  return {
    buildStatus: status.data ?? null,
    isPending: status.isPending,
    error: status.error,
  };
}
