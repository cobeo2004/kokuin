import { Skeleton } from "@kokuin/ui/components/skeleton";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useProjectMembers } from "@/hooks/useProjectMembers";
import { ProjectMembersView } from "@/views/projects/ProjectMembersView";

interface ProjectMembersScreenProps {
	projectId: string;
}

export function ProjectMembersScreen({ projectId }: ProjectMembersScreenProps) {
	const { user } = useCurrentUser();
	const { members, isPending, add, updateRole, remove } =
		useProjectMembers(projectId);

	const currentMember = members.find((m) => m.userId === user?.id);
	const isAdmin = currentMember?.role === "admin";

	if (isPending) return <Skeleton className="m-6 h-48 w-full" />;

	return (
		<div className="container mx-auto space-y-6 p-6">
			<h1 className="font-bold text-2xl">Members</h1>
			<ProjectMembersView
				members={members}
				isPending={isPending}
				isAdmin={isAdmin}
				currentUserId={user?.id ?? ""}
				add={add}
				updateRole={updateRole}
				remove={remove}
			/>
		</div>
	);
}
