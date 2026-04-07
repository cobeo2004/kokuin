import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { getProjectOrpc, client as baseClient } from "@/utils/orpc";
import {
  listProjectMembers,
  addProjectMember,
  updateProjectMemberRole,
  removeProjectMember,
} from "@/services/project.service";

export function useProjectMembers(projectId: string) {
  const qc = useQueryClient();
  const projectOrpc = useMemo(() => getProjectOrpc(projectId), [projectId]);
  const queryOpts = listProjectMembers(projectOrpc);

  const members = useQuery(queryOpts);
  const invalidate = () => qc.invalidateQueries({ queryKey: queryOpts.queryKey });

  // Note: mutations need the project-scoped client — wrap base client with project header
  // The X-Project-Id header is sent by getProjectOrpc's RPCLink
  const projectClient = useMemo(() => {
    return getProjectOrpc(projectId) as unknown as typeof baseClient;
  }, [projectId]);

  const add = useMutation({
    mutationFn: (input: { userId: string; role: "admin" | "member" }) =>
      addProjectMember(projectClient, input),
    onSuccess: invalidate,
  });

  const updateRole = useMutation({
    mutationFn: (input: { userId: string; role: "admin" | "member" }) =>
      updateProjectMemberRole(projectClient, input),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (userId: string) =>
      removeProjectMember(projectClient, { userId }),
    onSuccess: invalidate,
  });

  return {
    members: members.data ?? [],
    isPending: members.isPending,
    add,
    updateRole,
    remove,
  };
}
