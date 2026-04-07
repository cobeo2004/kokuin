import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getGraphStatus } from "@/services/graph.service";
import { getProjectOrpc } from "@/utils/orpc";

export function useProjectBuilds(projectId: string) {
	const projectOrpc = useMemo(() => getProjectOrpc(projectId), [projectId]);
	const status = useQuery(getGraphStatus(projectOrpc));
	return {
		buildStatus: status.data ?? null,
		isPending: status.isPending,
		error: status.error,
	};
}
