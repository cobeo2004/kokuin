import { createFileRoute, redirect } from "@tanstack/react-router";
import { getUser } from "@/functions/get-user";
import { AuthScreen } from "@/screens/auth/AuthScreen";

export const Route = createFileRoute("/login")({
	beforeLoad: async () => {
		const session = await getUser();
		if (session) {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: AuthScreen,
});
