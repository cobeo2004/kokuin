import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@kokuin/ui/components/tabs";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useOrganization } from "@/hooks/useOrganization";
import { DomainRulesView } from "@/views/admin/DomainRulesView";
import { MembersTableView } from "@/views/admin/MembersTableView";
import { OrgSettingsView } from "@/views/admin/OrgSettingsView";

export function AdminScreen() {
	const {
		user,
		orgRole,
		isOrgAdmin,
		isPending: userPending,
	} = useCurrentUser();
	const { org, isPending: orgPending, error } = useOrganization();

	const isPending = userPending || orgPending;

	// Role guard: redirect non-admins
	if (!isPending && !isOrgAdmin) {
		return (
			<div className="container mx-auto p-6">
				<p className="text-muted-foreground text-sm">
					You don't have permission to access organization settings.
				</p>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="container mx-auto p-6">
				<p className="text-destructive text-sm">
					Failed to load organization: {error.message}
				</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto space-y-6 p-6">
			<div>
				<h1 className="font-bold text-2xl">Organization Settings</h1>
				<p className="mt-1 text-muted-foreground text-sm">{org?.name ?? "—"}</p>
			</div>

			<Tabs defaultValue="overview">
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="members">Members</TabsTrigger>
					<TabsTrigger value="domains">Domain Rules</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="mt-4">
					<OrgSettingsView org={org} isPending={isPending} />
				</TabsContent>

				<TabsContent value="members" className="mt-4">
					<MembersTableView
						orgRole={orgRole}
						userName={user?.name ?? null}
						userEmail={user?.email ?? null}
					/>
				</TabsContent>

				<TabsContent value="domains" className="mt-4">
					<DomainRulesView />
				</TabsContent>
			</Tabs>
		</div>
	);
}
