import { Avatar, AvatarFallback } from "@kokuin/ui/components/avatar";
import { Button } from "@kokuin/ui/components/button";
import { Separator } from "@kokuin/ui/components/separator";
import { useNavigate } from "@tanstack/react-router";
import { Building2, LayoutDashboard, LogOut } from "lucide-react";
import { KokuinKanjiMark } from "@/components/brand/KokuinKanjiMark";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { signOut } from "@/services/auth.service";
import { type NavItem, SidebarNav } from "./SidebarNav";

const baseItems: NavItem[] = [
	{ label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
];

const adminItems: NavItem[] = [
	{ label: "Organization", to: "/admin", icon: Building2 },
];

export function AppSidebar() {
	const { user, isOrgAdmin, isPending } = useCurrentUser();
	const navigate = useNavigate();

	const initials = user?.name
		? user.name
				.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2)
		: "??";

	const handleSignOut = async () => {
		try {
			await signOut();
			navigate({ to: "/login" });
		} catch {
			// sign-out failure: stay on current page
		}
	};

	return (
		<aside className="flex h-full w-56 flex-col border-r bg-background px-3 py-4">
			{/* Logo */}
			<div className="mb-6 px-2">
				<KokuinKanjiMark variant="sidebar" />
			</div>

			{/* Main nav */}
			<SidebarNav items={baseItems} />

			{/* Admin nav */}
			{!isPending && isOrgAdmin && (
				<>
					<Separator className="my-3" />
					<p className="mb-1 px-2 text-muted-foreground text-xs uppercase tracking-wider">
						Admin
					</p>
					<SidebarNav items={adminItems} />
				</>
			)}

			{/* Spacer */}
			<div className="flex-1" />

			{/* User section */}
			<Separator className="mb-3" />
			<div className="flex items-center gap-2 px-1">
				<Avatar className="h-7 w-7">
					<AvatarFallback className="text-xs">{initials}</AvatarFallback>
				</Avatar>
				<div className="min-w-0 flex-1">
					<p className="truncate font-medium text-sm">{user?.name ?? "…"}</p>
				</div>
				<Button
					variant="ghost"
					size="icon"
					className="h-7 w-7 shrink-0"
					onClick={handleSignOut}
					title="Sign out"
				>
					<LogOut className="h-4 w-4" />
				</Button>
			</div>
		</aside>
	);
}
