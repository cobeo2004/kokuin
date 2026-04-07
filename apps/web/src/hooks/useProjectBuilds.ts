import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getProjectOrpc } from "@/utils/orpc";
import { getGraphStatus } from "@/services/graph.service";

export function useProjectBuilds(projectId: string) {
  const projectOrpc = useMemo(() => getProjectOrpc(projectId), [projectId]);
  const status = useQuery(getGraphStatus(projectOrpc));
  return {
    buildStatus: status.data ?? null,
    isPending: status.isPending,
    error: status.error,
  };
}
