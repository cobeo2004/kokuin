import { Badge } from "@kokuin/ui/components/badge";
import { Button } from "@kokuin/ui/components/button";
import { Input } from "@kokuin/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@kokuin/ui/components/select";
import { Skeleton } from "@kokuin/ui/components/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@kokuin/ui/components/table";
import type { UseMutationResult } from "@tanstack/react-query";
import { useState } from "react";

interface Member {
	userId: string;
	role: string;
}

interface ProjectMembersViewProps {
	members: Member[];
	isPending: boolean;
	isAdmin: boolean;
	currentUserId: string;
	add: UseMutationResult<
		unknown,
		Error,
		{ userId: string; role: "admin" | "member" }
	>;
	updateRole: UseMutationResult<
		unknown,
		Error,
		{ userId: string; role: "admin" | "member" }
	>;
	remove: UseMutationResult<unknown, Error, string>;
}

export function ProjectMembersView({
	members,
	isPending,
	isAdmin,
	currentUserId,
	add,
	updateRole,
	remove,
}: ProjectMembersViewProps) {
	const [addUserId, setAddUserId] = useState("");
	const [addRole, setAddRole] = useState<"admin" | "member">("member");

	if (isPending) return <Skeleton className="h-48 w-full" />;

	return (
		<div className="space-y-4">
			{isAdmin && (
				<form
					className="flex gap-2"
					onSubmit={(e) => {
						e.preventDefault();
						if (!addUserId.trim()) return;
						add.mutate({ userId: addUserId.trim(), role: addRole });
						setAddUserId("");
					}}
				>
					<Input
						placeholder="User ID"
						value={addUserId}
						onChange={(e) => setAddUserId(e.target.value)}
						className="flex-1"
					/>
					<Select
						value={addRole}
						onValueChange={(v) => setAddRole(v as "admin" | "member")}
					>
						<SelectTrigger className="w-28">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="member">Member</SelectItem>
							<SelectItem value="admin">Admin</SelectItem>
						</SelectContent>
					</Select>
					<Button type="submit" disabled={add.isPending}>
						Add
					</Button>
				</form>
			)}

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>User ID</TableHead>
						<TableHead>Role</TableHead>
						{isAdmin && <TableHead className="text-right">Actions</TableHead>}
					</TableRow>
				</TableHeader>
				<TableBody>
					{members.map((member) => (
						<TableRow key={member.userId}>
							<TableCell className="font-mono text-sm">
								{member.userId}
							</TableCell>
							<TableCell>
								<Badge
									variant={member.role === "admin" ? "default" : "secondary"}
								>
									{member.role}
								</Badge>
							</TableCell>
							{isAdmin && (
								<TableCell className="text-right">
									<div className="flex justify-end gap-2">
										<Button
											size="sm"
											variant="outline"
											disabled={
												updateRole.isPending || member.userId === currentUserId
											}
											onClick={() =>
												updateRole.mutate({
													userId: member.userId,
													role: member.role === "admin" ? "member" : "admin",
												})
											}
										>
											{member.role === "admin" ? "Make member" : "Make admin"}
										</Button>
										<Button
											size="sm"
											variant="destructive"
											disabled={
												remove.isPending || member.userId === currentUserId
											}
											onClick={() => remove.mutate(member.userId)}
										>
											Remove
										</Button>
									</div>
								</TableCell>
							)}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
