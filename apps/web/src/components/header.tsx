import { Link } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

import UserMenu from "./user-menu";

export default function Header() {
	const { data: session } = authClient.useSession();

	return (
		<div>
			<div className="flex flex-row items-center justify-between px-2 py-1">
				<nav className="flex gap-4 text-lg">
					<Link to="/">Home</Link>
					<Link to="/dashboard">Dashboard</Link>
					{session && <Link to="/admin">Admin</Link>}
				</nav>
				<div className="flex items-center gap-2">
					<UserMenu />
				</div>
			</div>
			<hr />
		</div>
	);
}
