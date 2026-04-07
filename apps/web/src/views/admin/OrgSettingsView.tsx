import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@kokuin/ui/components/card";
import { Skeleton } from "@kokuin/ui/components/skeleton";

interface OrgSettingsViewProps {
	org: {
		id: string;
		name: string;
		slug: string;
		createdAt: Date | string;
	} | null;
	isPending: boolean;
}

export function OrgSettingsView({ org, isPending }: OrgSettingsViewProps) {
	if (isPending) {
		return <Skeleton className="h-32 w-full" />;
	}

	if (!org) {
		return (
			<p className="text-muted-foreground text-sm">No organization found.</p>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">Organization Details</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3 text-sm">
				<div className="flex justify-between border-b pb-2">
					<span className="text-muted-foreground">Name</span>
					<span className="font-medium">{org.name}</span>
				</div>
				<div className="flex justify-between border-b pb-2">
					<span className="text-muted-foreground">Slug</span>
					<code className="rounded bg-secondary px-1.5 py-0.5 text-xs">
						/{org.slug}
					</code>
				</div>
				<div className="flex justify-between">
					<span className="text-muted-foreground">Created</span>
					<span>{new Date(org.createdAt).toLocaleDateString()}</span>
				</div>
			</CardContent>
		</Card>
	);
}
