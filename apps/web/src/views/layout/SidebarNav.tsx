import { buttonVariants } from "@kokuin/ui/components/button";
import { cn } from "@kokuin/ui/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
	label: string;
	to: string;
	icon: LucideIcon;
}

interface SidebarNavProps {
	items: NavItem[];
}

export function SidebarNav({ items }: SidebarNavProps) {
	const router = useRouterState();
	const pathname = router.location.pathname;

	return (
		<nav className="flex flex-col gap-1">
			{items.map((item) => {
				const isActive =
					pathname === item.to || pathname.startsWith(`${item.to}/`);
				return (
					<Link
						key={item.to}
						to={item.to as never}
						className={cn(
							buttonVariants({ variant: "ghost" }),
							"w-full justify-start gap-2",
							isActive && "bg-accent text-accent-foreground",
						)}
					>
						<item.icon className="h-4 w-4" />
						{item.label}
					</Link>
				);
			})}
		</nav>
	);
}
