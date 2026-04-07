import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useCallback } from "react";
import { getProjectOrpc, getProjectClient } from "@/utils/orpc";
import {
  listProjectMembers,
  addProjectMember,
  updateProjectMemberRole,
  removeProjectMember,
} from "@/services/project.service";

export function useProjectMembers(projectId: string) {
  const qc = useQueryClient();
  const projectOrpc = useMemo(() => getProjectOrpc(projectId), [projectId]);
  const projectClient = useMemo(() => getProjectClient(projectId), [projectId]);
  const queryOpts = listProjectMembers(projectOrpc);

  const members = useQuery(queryOpts);
  const invalidate = useCallback(
    () => qc.invalidateQueries({ queryKey: queryOpts.queryKey }),
    [qc, queryOpts.queryKey],
  );

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
