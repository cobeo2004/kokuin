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
import { useState } from "react";
import { client, orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_app/organizations/")({
	component: RouteComponent,
});

function CreateOrgDialog({ onClose }: { onClose: () => void }) {
	const qc = useQueryClient();
	const [name, setName] = useState("");
	const [slug, setSlug] = useState("");

	const create = useMutation({
		mutationFn: () => client.organization.create({ name, slug }),
		onSuccess: () => {
			qc.invalidateQueries({
				queryKey: orpc.organization.list.queryOptions().queryKey,
			});
			onClose();
		},
	});

	const autoSlug = (val: string) =>
		val
			.toLowerCase()
			.replace(/\s+/g, "-")
			.replace(/[^a-z0-9-]/g, "");

	const handleNameChange = (val: string) => {
		setName(val);
		if (!slug || slug === autoSlug(name)) {
			setSlug(autoSlug(val));
		}
	};

	const canSubmit = name.trim() && slug.trim() && !create.isPending;

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: backdrop dismiss
		// biome-ignore lint/a11y/useKeyWithClickEvents: backdrop dismiss
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<div className="w-full max-w-sm rounded-lg border bg-background p-6 shadow-lg">
				<h2 className="mb-4 font-semibold text-lg">Create Organization</h2>

				<div className="space-y-4">
					<div className="space-y-1">
						<label htmlFor="org-name" className="text-muted-foreground text-sm">
							Name
						</label>
						<Input
							id="org-name"
							placeholder="Acme Corp"
							value={name}
							onChange={(e) => handleNameChange(e.target.value)}
							autoFocus
						/>
					</div>

					<div className="space-y-1">
						<label htmlFor="org-slug" className="text-muted-foreground text-sm">
							Slug
						</label>
						<Input
							id="org-slug"
							placeholder="acme-corp"
							value={slug}
							onChange={(e) => setSlug(autoSlug(e.target.value))}
						/>
						<p className="text-muted-foreground text-xs">
							Lowercase letters, numbers, and hyphens only.
						</p>
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
	);
}

function RouteComponent() {
	const [showCreate, setShowCreate] = useState(false);
	const qc = useQueryClient();

	const orgs = useQuery(orpc.organization.list.queryOptions());

	const deleteOrg = useMutation({
		mutationFn: (orgId: string) => client.organization.delete({ orgId }),
		onSuccess: () => {
			qc.invalidateQueries({
				queryKey: orpc.organization.list.queryOptions().queryKey,
			});
		},
	});

	return (
		<div className="container mx-auto p-6">
			{showCreate && <CreateOrgDialog onClose={() => setShowCreate(false)} />}

			<div className="mb-6 flex items-center justify-between">
				<div>
					<div className="mb-1 flex items-center gap-2 text-muted-foreground text-sm">
						<Link to="/dashboard" className="hover:underline">
							Dashboard
						</Link>
						<span>/</span>
						<span>Organizations</span>
					</div>
					<h1 className="font-bold text-2xl">Organizations</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Manage your organizations and memberships.
					</p>
				</div>
				<Button onClick={() => setShowCreate(true)}>New Organization</Button>
			</div>

			{orgs.isPending ? (
				<p className="text-muted-foreground text-sm">Loading…</p>
			) : orgs.data?.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<p className="mb-4 text-muted-foreground">No organizations yet.</p>
					<Button variant="outline" onClick={() => setShowCreate(true)}>
						Create your first organization
					</Button>
				</div>
			) : (
				<div className="space-y-3">
					{orgs.data?.map((org) => (
						<Card key={org.id}>
							<CardHeader className="pb-2">
								<div className="flex items-center justify-between">
									<div>
										<CardTitle className="text-base">{org.name}</CardTitle>
										<p className="text-muted-foreground text-xs">/{org.slug}</p>
									</div>
									<div className="flex items-center gap-3">
										<span
											className={`rounded-full px-2 py-0.5 font-medium text-xs ${
												org.role === "owner"
													? "bg-primary text-primary-foreground"
													: "bg-secondary text-secondary-foreground"
											}`}
										>
											{org.role}
										</span>
										{org.role === "owner" && (
											<Button
												variant="destructive"
												size="sm"
												disabled={deleteOrg.isPending}
												onClick={() => {
													if (
														confirm(
															`Delete "${org.name}"? This cannot be undone.`,
														)
													) {
														deleteOrg.mutate(org.id);
													}
												}}
											>
												Delete
											</Button>
										)}
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground text-sm">
									Member since {new Date(org.createdAt).toLocaleDateString()}
								</p>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
