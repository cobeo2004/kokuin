import { Button } from "@kokuin/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@kokuin/ui/components/card";
import { Input } from "@kokuin/ui/components/input";
import { Skeleton } from "@kokuin/ui/components/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { client, orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_app/dashboard")({
	component: RouteComponent,
});

function CreateProjectDialog({ onClose }: { onClose: () => void }) {
	const qc = useQueryClient();
	const orgs = useQuery(orpc.organization.list.queryOptions());

	const [name, setName] = useState("");
	const [orgId, setOrgId] = useState("");
	const [githubRepoUrl, setGithubRepoUrl] = useState("");
	const [defaultBranch, setDefaultBranch] = useState("main");

	const create = useMutation({
		mutationFn: () =>
			client.project.create({
				name,
				orgId,
				githubRepoUrl,
				defaultBranch,
				allowedDomains: [],
			}),
		onSuccess: () => {
			qc.invalidateQueries({
				queryKey: orpc.project.list.queryOptions().queryKey,
			})
			onClose();
		},
	})

	const canSubmit =
		name.trim() && orgId && githubRepoUrl.trim() && !create.isPending;

	return (
        // biome-ignore lint/a11y/noStaticElementInteractions: backdrop dismiss
        // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop dismiss
        <div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
            <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
				<h2 className="mb-4 font-semibold text-lg">Create Project</h2>

				<div className="space-y-4">
					<div className="space-y-1">
						<label htmlFor="cp-name" className="text-muted-foreground text-sm">
							Project Name
						</label>
						<Input
							id="cp-name"
							placeholder="my-project"
							value={name}
							onChange={(e) => setName(e.target.value)}
							autoFocus
						/>
					</div>

					<div className="space-y-1">
						<label htmlFor="cp-org" className="text-muted-foreground text-sm">
							Organization
						</label>
						{orgs.isPending ? (
							<Skeleton className="h-9 w-full" />
						) : orgs.data?.length === 0 ? (
							<p className="text-muted-foreground text-sm">
								You have no organizations. Create one first.
							</p>
						) : (
							<select
								id="cp-org"
								value={orgId}
								onChange={(e) => setOrgId(e.target.value)}
								className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
							>
								<option value="">— select organization —</option>
								{orgs.data?.map((org) => (
									<option key={org.id} value={org.id}>
										{org.name}
									</option>
								))}
							</select>
						)}
					</div>

					<div className="space-y-1">
						<label htmlFor="cp-repo" className="text-muted-foreground text-sm">
							GitHub Repo URL
						</label>
						<Input
							id="cp-repo"
							placeholder="https://github.com/org/repo"
							value={githubRepoUrl}
							onChange={(e) => setGithubRepoUrl(e.target.value)}
						/>
					</div>

					<div className="space-y-1">
						<label
							htmlFor="cp-branch"
							className="text-muted-foreground text-sm"
						>
							Default Branch
						</label>
						<Input
							id="cp-branch"
							placeholder="main"
							value={defaultBranch}
							onChange={(e) => setDefaultBranch(e.target.value)}
						/>
					</div>

					{create.error && (
						<p className="text-destructive text-sm">{String(create.error)}</p>
					)}
				</div>

				<div className="mt-6 flex justify-end gap-2">
					<Button
						variant="outline"
						onClick={onClose}
						disabled={create.isPending}
					>
						Cancel
					</Button>
					<Button onClick={() => create.mutate()} disabled={!canSubmit}>
						{create.isPending ? "Creating…" : "Create"}
					</Button>
				</div>
			</div>
        </div>
    )
}

function RouteComponent() {
	const { session } = Route.useRouteContext();
	const [showCreate, setShowCreate] = useState(false);

	const projects = useQuery(orpc.project.list.queryOptions());

	return (
		<div className="container mx-auto p-6">
			{showCreate && (
				<CreateProjectDialog onClose={() => setShowCreate(false)} />
			)}

			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="font-bold text-2xl">Dashboard</h1>
					<p className="text-muted-foreground">
						Welcome back, {session?.user.name}
					</p>
				</div>
				<Button onClick={() => setShowCreate(true)}>Create Project</Button>
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
					<Button variant="outline" onClick={() => setShowCreate(true)}>
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
	)
}
