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
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { getUser } from "@/functions/get-user";
import { getProjectOrpc } from "@/utils/orpc";

export const Route = createFileRoute("/projects/$projectId/members")({
	component: RouteComponent,
	beforeLoad: async () => {
		const session = await getUser();
		return { session };
	},
	loader: async ({ context }) => {
		if (!context.session) {
			throw redirect({ to: "/login" });
		}
	},
});

function RouteComponent() {
	const { projectId } = Route.useParams();
	const { session } = Route.useRouteContext();
	const qc = useQueryClient();

	const projectOrpc = useMemo(() => getProjectOrpc(projectId), [projectId]);

	const [addUserId, setAddUserId] = useState("");
	const [addRole, setAddRole] = useState<"admin" | "member">("member");

	const membersQueryOptions = projectOrpc.project.members.list.queryOptions();
	const members = useQuery(membersQueryOptions);
	const project = useQuery(projectOrpc.project.getById.queryOptions());

	const currentMember = members.data?.find(
		(m) => m.userId === session?.user.id,
	);
	const isAdmin = currentMember?.role === "admin";

	const invalidateMembers = () =>
		qc.invalidateQueries({ queryKey: membersQueryOptions.queryKey });

	const addMember = useMutation({
		mutationFn: ({
			userId,
			role,
		}: {
			userId: string;
			role: "admin" | "member";
		}) => projectOrpc.project.members.add.call({ userId, role }),
		onSuccess: () => {
			setAddUserId("");
			invalidateMembers();
		},
	});

	const updateRole = useMutation({
		mutationFn: ({
			userId,
			role,
		}: {
			userId: string;
			role: "admin" | "member";
		}) => projectOrpc.project.members.updateRole.call({ userId, role }),
		onSuccess: invalidateMembers,
	});

	const removeMember = useMutation({
		mutationFn: (userId: string) =>
			projectOrpc.project.members.remove.call({ userId }),
		onSuccess: invalidateMembers,
	});

	return (
		<div className="container mx-auto space-y-6 p-6">
			<div className="flex items-center justify-between">
				<div>
					<div className="mb-1 flex items-center gap-2 text-muted-foreground text-sm">
						<Link to="/dashboard" className="hover:underline">
							Dashboard
						</Link>
						<span>/</span>
						<Link
							to="/projects/$projectId"
							params={{ projectId }}
							className="hover:underline"
						>
							{project.data?.name ?? projectId}
						</Link>
						<span>/</span>
						<span>Members</span>
					</div>
					<h1 className="font-bold text-2xl">Members</h1>
				</div>
			</div>

			{isAdmin && (
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Add Member</CardTitle>
					</CardHeader>
					<CardContent>
						<form
							className="flex gap-2"
							onSubmit={(e) => {
								e.preventDefault();
								if (!addUserId.trim()) return;
								addMember.mutate({ userId: addUserId.trim(), role: addRole });
							}}
						>
							<Input
								placeholder="User ID"
								value={addUserId}
								onChange={(e) => setAddUserId(e.target.value)}
								className="flex-1"
							/>
							<select
								value={addRole}
								onChange={(e) =>
									setAddRole(e.target.value as "admin" | "member")
								}
								className="rounded-md border border-input bg-background px-3 py-2 text-sm"
							>
								<option value="member">Member</option>
								<option value="admin">Admin</option>
							</select>
							<Button type="submit" disabled={addMember.isPending}>
								Add
							</Button>
						</form>
					</CardContent>
				</Card>
			)}

			<Card>
				<CardHeader>
					<CardTitle className="text-base">
						Members ({members.data?.length ?? 0})
					</CardTitle>
				</CardHeader>
				<CardContent>
					{members.isPending ? (
						<div className="space-y-3">
							{Array.from({ length: 3 }).map((_, i) => (
								<Skeleton key={i} className="h-10 w-full" />
							))}
						</div>
					) : members.data?.length === 0 ? (
						<p className="text-muted-foreground text-sm">No members found.</p>
					) : (
						<ul className="divide-y">
							{members.data?.map((member) => (
								<li
									key={member.userId}
									className="flex items-center justify-between py-3"
								>
									<div className="flex items-center gap-3">
										<span className="font-mono text-muted-foreground text-xs">
											{member.userId}
										</span>
										<span
											className={`rounded-full px-2 py-0.5 font-medium text-xs ${
												member.role === "admin"
													? "bg-primary text-primary-foreground"
													: "bg-secondary text-secondary-foreground"
											}`}
										>
											{member.role}
										</span>
									</div>
									{isAdmin && member.userId !== session?.user.id && (
										<div className="flex items-center gap-2">
											<select
												value={member.role}
												onChange={(e) =>
													updateRole.mutate({
														userId: member.userId,
														role: e.target.value as "admin" | "member",
													})
												}
												disabled={updateRole.isPending}
												className="rounded-md border border-input bg-background px-2 py-1 text-xs"
											>
												<option value="member">Member</option>
												<option value="admin">Admin</option>
											</select>
											<Button
												variant="destructive"
												size="sm"
												onClick={() => removeMember.mutate(member.userId)}
												disabled={removeMember.isPending}
											>
												Remove
											</Button>
										</div>
									)}
								</li>
							))}
						</ul>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
