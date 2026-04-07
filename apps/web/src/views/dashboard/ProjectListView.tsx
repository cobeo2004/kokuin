import { Badge } from "@kokuin/ui/components/badge";
import { Button } from "@kokuin/ui/components/button";
import { Skeleton } from "@kokuin/ui/components/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@kokuin/ui/components/table";
import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

interface Project {
	id: string;
	name: string;
	githubRepoUrl: string;
	defaultBranch: string;
	createdAt: Date | string;
	role: string;
}

interface ProjectListViewProps {
	projects: Project[];
	isPending: boolean;
	isOrgAdmin: boolean;
	onCreateProject: () => void;
}

export function ProjectListView({
	projects,
	isPending,
	isOrgAdmin,
	onCreateProject,
}: ProjectListViewProps) {
	if (isPending) {
		return (
			<div className="space-y-2">
				{[...Array(3)].map((_item, i) => (
					<Skeleton key={i} className="h-12 w-full" />
				))}
			</div>
		);
	}

	if (projects.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-16 text-center">
				<p className="mb-4 text-muted-foreground">No projects yet.</p>
				{isOrgAdmin && (
					<Button variant="outline" onClick={onCreateProject}>
						Create your first project
					</Button>
				)}
			</div>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Name</TableHead>
					<TableHead className="hidden sm:table-cell">Repository</TableHead>
					<TableHead className="hidden sm:table-cell">Branch</TableHead>
					<TableHead>Role</TableHead>
					<TableHead className="text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{projects.map((project) => (
					<TableRow key={project.id}>
						<TableCell className="font-medium">{project.name}</TableCell>
						<TableCell className="hidden sm:table-cell">
							<a
								href={project.githubRepoUrl}
								target="_blank"
								rel="noreferrer"
								className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
							>
								{project.githubRepoUrl.replace("https://", "")}
								<ExternalLink className="h-3 w-3" />
							</a>
						</TableCell>
						<TableCell className="hidden sm:table-cell">
							<code className="rounded bg-secondary px-1.5 py-0.5 text-xs">
								{project.defaultBranch}
							</code>
						</TableCell>
						<TableCell>
							<Badge
								variant={project.role === "admin" ? "default" : "secondary"}
							>
								{project.role}
							</Badge>
						</TableCell>
						<TableCell className="text-right">
							<Link
								to="/projects/$projectId"
								params={{ projectId: project.id }}
							>
								<Button size="sm" variant="outline">
									View
								</Button>
							</Link>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
