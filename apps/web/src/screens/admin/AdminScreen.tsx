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
	const { user, orgRole } = useCurrentUser();
	const { org, isPending } = useOrganization();

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
