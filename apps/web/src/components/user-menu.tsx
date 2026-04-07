import { Button } from "@kokuin/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@kokuin/ui/components/dropdown-menu";
import { Skeleton } from "@kokuin/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

export default function UserMenu() {
	const navigate = useNavigate();
	const { data: session, isPending } = authClient.useSession();
	const orgs = useQuery({
		...orpc.organization.list.queryOptions(),
		enabled: !!session,
	});

	if (isPending) {
		return <Skeleton className="h-9 w-24" />;
	}

	if (!session) {
		return (
			<Link to="/login">
				<Button variant="outline">Sign In</Button>
			</Link>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger render={<Button variant="outline" />}>
				{session.user.name}
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56 bg-card">
				{orgs.data && orgs.data.length > 0 && (
					<DropdownMenuGroup>
						<DropdownMenuLabel>Organizations</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{orgs.data.map((org) => (
							<DropdownMenuItem key={org.id} asChild>
								<Link to="/organizations">{org.name}</Link>
							</DropdownMenuItem>
						))}
						<DropdownMenuItem asChild>
							<Link to="/organizations" className="text-muted-foreground">
								Manage organizations…
							</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
					</DropdownMenuGroup>
				)}

				{(!orgs.data || orgs.data.length === 0) && (
					<DropdownMenuGroup>
						<DropdownMenuItem asChild>
							<Link to="/organizations">Create organization…</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
					</DropdownMenuGroup>
				)}

				<DropdownMenuGroup>
					<DropdownMenuLabel>My Account</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem>{session.user.email}</DropdownMenuItem>
					<DropdownMenuItem
						variant="destructive"
						onClick={() => {
							authClient.signOut({
								fetchOptions: {
									onSuccess: () => {
										navigate({ to: "/" });
									},
								},
							});
						}}
					>
						Sign Out
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
