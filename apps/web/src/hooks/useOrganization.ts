import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { listOrganizations } from "@/services/organization.service";

export function useOrganization() {
  const orgs = useQuery(listOrganizations(orpc));
  // Use the first org (Kokuin is single-org per user for now)
  const org = orgs.data?.[0] ?? null;
  return {
    org,
    isPending: orgs.isPending,
    error: orgs.error,
  };
}
