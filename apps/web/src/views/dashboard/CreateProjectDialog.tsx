import { Button } from "@kokuin/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@kokuin/ui/components/dialog";
import { Input } from "@kokuin/ui/components/input";
import { Label } from "@kokuin/ui/components/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { createProject, listProjects } from "@/services/project.service";
import { client, orpc } from "@/utils/orpc";

interface CreateProjectDialogProps {
	open: boolean;
	onClose: () => void;
	orgId: string;
}

export function CreateProjectDialog({
	open,
	onClose,
	orgId,
}: CreateProjectDialogProps) {
	const qc = useQueryClient();
	const [name, setName] = useState("");
	const [githubRepoUrl, setGithubRepoUrl] = useState("");
	const [defaultBranch, setDefaultBranch] = useState("main");

	const create = useMutation({
		mutationFn: () =>
			createProject(client, { name, orgId, githubRepoUrl, defaultBranch }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: listProjects(orpc).queryKey });
			toast.success("Project created");
			setName("");
			setGithubRepoUrl("");
			setDefaultBranch("main");
			onClose();
		},
		onError: (e) => toast.error(e.message),
	});

	const canSubmit = name.trim() && githubRepoUrl.trim() && !create.isPending;

	return (
		<Dialog open={open} onOpenChange={(o) => !o && onClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Create Project</DialogTitle>
				</DialogHeader>
				<div className="space-y-3">
					<div className="space-y-1">
						<Label htmlFor="proj-name">Name</Label>
						<Input
							id="proj-name"
							placeholder="my-repo"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</div>
					<div className="space-y-1">
						<Label htmlFor="proj-repo">GitHub Repo URL</Label>
						<Input
							id="proj-repo"
							placeholder="https://github.com/org/repo"
							value={githubRepoUrl}
							onChange={(e) => setGithubRepoUrl(e.target.value)}
						/>
					</div>
					<div className="space-y-1">
						<Label htmlFor="proj-branch">Default Branch</Label>
						<Input
							id="proj-branch"
							placeholder="main"
							value={defaultBranch}
							onChange={(e) => setDefaultBranch(e.target.value)}
						/>
					</div>
				</div>
				<DialogFooter>
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
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
