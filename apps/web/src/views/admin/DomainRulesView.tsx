import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@kokuin/ui/components/card";

export function DomainRulesView() {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">Domain Rules</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="rounded border border-dashed p-4 text-center text-muted-foreground text-sm">
					Organization-level domain restriction management requires additional
					backend endpoints. Coming in a future update.
				</div>
			</CardContent>
		</Card>
	);
}
