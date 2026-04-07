import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { listOrganizations } from "@/services/organization.service";
import { orpc } from "@/utils/orpc";

export function useCurrentUser() {
	const session = authClient.useSession();
	const orgs = useQuery({
		...listOrganizations(orpc),
		enabled: !!session.data?.user,
	});

	// Derive the user's org role (owner/admin/member) from first org membership
	const orgRole = orgs.data?.[0]?.role ?? null;

	return {
		user: session.data?.user ?? null,
		isPending: session.isPending || orgs.isPending,
		orgRole,
		isOrgAdmin: orgRole === "owner" || orgRole === "admin",
	};
}
