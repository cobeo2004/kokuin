import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/login")({
	beforeLoad: async () => {
		throw redirect({ to: "/" });
	},
	component: () => null,
});
