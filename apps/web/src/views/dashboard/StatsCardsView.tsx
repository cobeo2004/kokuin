import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@kokuin/ui/components/card";
import { Skeleton } from "@kokuin/ui/components/skeleton";
import { Activity, FolderOpen, Users } from "lucide-react";

interface StatsCardsViewProps {
	projectCount: number;
	memberCount: number;
	isPending: boolean;
}

export function StatsCardsView({
	projectCount,
	memberCount,
	isPending,
}: StatsCardsViewProps) {
	const cards = [
		{ label: "Total Projects", value: projectCount, icon: FolderOpen },
		{
			label: "Total Members",
			value: memberCount > 0 ? memberCount : "—",
			icon: Users,
		},
		{ label: "Active Builds", value: "—", icon: Activity },
	];

	return (
		<div className="grid gap-4 sm:grid-cols-3">
			{cards.map((card) => (
				<Card key={card.label}>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="font-medium text-muted-foreground text-sm">
							{card.label}
						</CardTitle>
						<card.icon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						{isPending ? (
							<Skeleton className="h-7 w-16" />
						) : (
							<p className="font-bold text-2xl">{card.value}</p>
						)}
					</CardContent>
				</Card>
			))}
		</div>
	);
}
