import { Button } from "@kokuin/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@kokuin/ui/components/card";
import { Skeleton } from "@kokuin/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { getUser } from "@/functions/get-user";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
	beforeLoad: async () => {
		const session = await getUser();
		return { session };
	},
	loader: async ({ context }) => {
		if (!context.session) {
			throw redirect({
				to: "/login",
			});
		}
	},
});

function RouteComponent() {
	const { session } = Route.useRouteContext();

	const projects = useQuery(orpc.project.list.queryOptions());

	return (
		<div className="container mx-auto p-6">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="font-bold text-2xl">Dashboard</h1>
					<p className="text-muted-foreground">
						Welcome back, {session?.user.name}
					</p>
				</div>
				<Button disabled title="Coming soon">
					Create Project
				</Button>
			</div>

			{projects.isPending ? (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 3 }).map((_, i) => (
						<Card key={i}>
							<CardHeader>
								<Skeleton className="h-5 w-32" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-4 w-48" />
							</CardContent>
						</Card>
					))}
				</div>
			) : projects.data?.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<p className="mb-4 text-muted-foreground">No projects yet.</p>
					<Button variant="outline" disabled title="Coming soon">
						Create your first project
					</Button>
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{projects.data?.map((project) => (
						<Link
							key={project.id}
							to="/projects/$projectId"
							params={{ projectId: project.id }}
						>
							<Card className="cursor-pointer transition-colors hover:border-primary/50">
								<CardHeader className="pb-2">
									<div className="flex items-start justify-between gap-2">
										<CardTitle className="text-base">{project.name}</CardTitle>
										<span
											className={`rounded-full px-2 py-0.5 font-medium text-xs ${
												project.role === "admin"
													? "bg-primary text-primary-foreground"
													: "bg-secondary text-secondary-foreground"
											}`}
										>
											{project.role}
										</span>
									</div>
								</CardHeader>
								<CardContent>
									<p className="truncate text-muted-foreground text-sm">
										{project.githubRepoUrl}
									</p>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
