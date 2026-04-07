import { createFileRoute } from "@tanstack/react-router";
import { AdminScreen } from "@/screens/admin/AdminScreen";

export const Route = createFileRoute("/_app/admin/")({
	component: AdminScreen,
});
