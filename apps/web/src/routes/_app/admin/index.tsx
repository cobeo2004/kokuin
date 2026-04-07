import { Button } from "@kokuin/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@kokuin/ui/components/card";
import { Input } from "@kokuin/ui/components/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { getProjectOrpc, orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_app/admin/")({
	component: RouteComponent,
});

function DomainManager({ projectId }: { projectId: string }) {
	const qc = useQueryClient();
	const projectOrpc = useMemo(() => getProjectOrpc(projectId), [projectId]);

	const [newDomain, setNewDomain] = useState("");

	const project = useQuery(projectOrpc.project.getById.queryOptions());

	const updateDomains = useMutation({
		mutationFn: (domains: string[]) =>
			projectOrpc.project.update.call({ allowedDomains: domains }),
		onSuccess: () => {
			qc.invalidateQueries({
				queryKey: projectOrpc.project.getById.queryOptions().queryKey,
			})
			setNewDomain("");
		},
	})

	if (project.isPending) {
		return <p className="text-muted-foreground text-sm">Loading project…</p>;
	}

	if (!project.data) {
		return <p className="text-muted-foreground text-sm">Project not found.</p>;
	}

	const domains = project.data.allowedDomains ?? [];

	const handleAdd = () => {
		const trimmed = newDomain.trim().toLowerCase();
		if (!trimmed || domains.includes(trimmed)) return;
		updateDomains.mutate([...domains, trimmed]);
	}

	const handleRemove = (domain: string) => {
		updateDomains.mutate(domains.filter((d) => d !== domain));
	};

	return (
		<div className="space-y-3">
			<p className="text-muted-foreground text-sm">
				{domains.length === 0
					? "No restrictions — all email domains are allowed."
					: `${domains.length} domain(s) allowlisted.`}
			</p>

			{domains.length > 0 && (
				<ul className="space-y-1">
					{domains.map((domain) => (
						<li
							key={domain}
							className="flex items-center justify-between rounded border px-3 py-1.5 text-sm"
						>
							<span className="font-mono">@{domain}</span>
							<Button
								variant="destructive"
								size="sm"
								onClick={() => handleRemove(domain)}
								disabled={updateDomains.isPending}
							>
								Remove
							</Button>
						</li>
					))}
				</ul>
			)}

			<form
				className="flex gap-2"
				onSubmit={(e) => {
					e.preventDefault();
					handleAdd()
				}}
			>
				<Input
					placeholder="example.com"
					value={newDomain}
					onChange={(e) => setNewDomain(e.target.value)}
					className="flex-1"
				/>
				<Button
					type="submit"
					disabled={updateDomains.isPending || !newDomain.trim()}
				>
					Add Domain
				</Button>
			</form>
		</div>
	)
}

function RouteComponent() {
	const { session } = Route.useRouteContext();

	const projects = useQuery(orpc.project.list.queryOptions());
	const adminProjects = projects.data?.filter((p) => p.role === "admin") ?? [];

	const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
		null,
	)

	const selectedProject = projects.data?.find(
		(p) => p.id === selectedProjectId,
	)

	return (
		<div className="container mx-auto space-y-6 p-6">
			<div>
				<div className="mb-1 flex items-center gap-2 text-muted-foreground text-sm">
					<Link to="/dashboard" className="hover:underline">
						Dashboard
					</Link>
					<span>/</span>
					<span>Admin</span>
				</div>
				<h1 className="font-bold text-2xl">Organization Admin</h1>
				<p className="mt-1 text-muted-foreground text-sm">
					Manage domain allowlists and project access controls.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Account</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2 text-sm">
					<div className="flex justify-between">
						<span className="text-muted-foreground">Name</span>
						<span>{session?.user.name}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Email</span>
						<span>{session?.user.email}</span>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">
						Domain Allowlist Management
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-1">
						<label className="text-muted-foreground text-sm">
							Select Project
							<select
								value={selectedProjectId ?? ""}
								onChange={(e) => setSelectedProjectId(e.target.value || null)}
								className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
							>
								<option value="">— choose a project —</option>
								{projects.data?.map((p) => (
									<option key={p.id} value={p.id}>
										{p.name} {p.role === "admin" ? "(admin)" : ""}
									</option>
								))}
							</select>
						</label>
					</div>

					{selectedProject && selectedProject.role !== "admin" && (
						<p className="text-muted-foreground text-sm">
							You need admin role to manage domains for this project.
						</p>
					)}

					{selectedProject && selectedProject.role === "admin" && (
						<DomainManager projectId={selectedProject.id} />
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">
						Your Projects ({projects.data?.length ?? 0})
					</CardTitle>
				</CardHeader>
				<CardContent>
					{projects.isPending ? (
						<p className="text-muted-foreground text-sm">Loading…</p>
					) : projects.data?.length === 0 ? (
						<p className="text-muted-foreground text-sm">No projects found.</p>
					) : (
						<ul className="divide-y">
							{projects.data?.map((p) => (
								<li
									key={p.id}
									className="flex items-center justify-between py-3"
								>
									<div className="space-y-0.5">
										<div className="flex items-center gap-2">
											<span className="font-medium text-sm">{p.name}</span>
											<span
												className={`rounded-full px-2 py-0.5 font-medium text-xs ${
													p.role === "admin"
														? "bg-primary text-primary-foreground"
														: "bg-secondary text-secondary-foreground"
												}`}
											>
												{p.role}
											</span>
										</div>
										<p className="text-muted-foreground text-xs">
											{p.githubRepoUrl}
										</p>
									</div>
									<div className="flex gap-2">
										<Link
											to="/projects/$projectId"
											params={{ projectId: p.id }}
											className="text-primary text-sm hover:underline"
										>
											View
										</Link>
										<Link
											to="/projects/$projectId/builds"
											params={{ projectId: p.id }}
											className="text-primary text-sm hover:underline"
										>
											Builds
										</Link>
									</div>
								</li>
							))}
						</ul>
					)}
				</CardContent>
			</Card>

			{adminProjects.length === 0 && !projects.isPending && (
				<p className="text-center text-muted-foreground text-sm">
					You are not an admin of any project.
				</p>
			)}
		</div>
	)
}
