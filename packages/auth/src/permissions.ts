import { createAccessControl } from "better-auth/plugins/access";

const statements = {
	project: ["create", "read", "update", "delete"],
	member: ["create", "read", "update", "delete"],
	graph: ["build", "query", "push"],
	organization: ["create", "read", "update", "delete"],
} as const;

export const ac = createAccessControl(statements);

export const owner = ac.newRole({
	project: ["create", "read", "update", "delete"],
	member: ["create", "read", "update", "delete"],
	graph: ["build", "query", "push"],
	organization: ["create", "read", "update", "delete"],
});

export const admin = ac.newRole({
	project: ["create", "read", "update", "delete"],
	member: ["create", "read", "update", "delete"],
	graph: ["build", "query", "push"],
	organization: ["read"],
});

export const member = ac.newRole({
	project: ["read"],
	member: ["read"],
	graph: ["build", "query", "push"],
	organization: ["read"],
});
