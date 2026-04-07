import { Badge } from "@kokuin/ui/components/badge";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@kokuin/ui/components/card";

interface MembersTableViewProps {
	orgRole: string | null;
	userName: string | null;
	userEmail: string | null;
}

export function MembersTableView({
	orgRole,
	userName,
	userEmail,
}: MembersTableViewProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">Members</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="mb-4 rounded border border-dashed p-4 text-center text-muted-foreground text-sm">
					Full member management (invite, role change, remove) requires
					additional backend endpoints. Coming in a future update.
				</div>
				<div className="rounded border">
					<div className="flex items-center justify-between px-4 py-3 text-sm">
						<div>
							<p className="font-medium">{userName ?? "—"}</p>
							<p className="text-muted-foreground text-xs">
								{userEmail ?? "—"}
							</p>
						</div>
						<Badge>{orgRole ?? "—"}</Badge>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
