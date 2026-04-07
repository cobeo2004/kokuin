import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getUser } from "@/functions/get-user";
import { AppSidebar } from "@/views/layout/AppSidebar";

export const Route = createFileRoute("/_app")({
	beforeLoad: async () => {
		const session = await getUser();
		if (!session) {
			throw redirect({ to: "/" });
		}
		return { session };
	},
	component: AppLayout,
});

function AppLayout() {
	return (
		<div className="flex h-svh">
			<AppSidebar />
			<main className="flex-1 overflow-y-auto">
				<Outlet />
			</main>
		</div>
	);
}
