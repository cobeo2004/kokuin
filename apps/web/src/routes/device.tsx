import { Button } from "@kokuin/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@kokuin/ui/components/card";
import { Input } from "@kokuin/ui/components/input";
import { Label } from "@kokuin/ui/components/label";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { client } from "@/utils/orpc";

export const Route = createFileRoute("/device")({
	component: RouteComponent,
});

function RouteComponent() {
	const { data: session, isPending } = authClient.useSession();
	const [userCode, setUserCode] = useState("");
	const [authorized, setAuthorized] = useState(false);

	const verify = useMutation({
		mutationFn: async (code: string) => {
			return client.deviceAuth.verify({ userCode: code });
		},
		onSuccess: () => {
			setAuthorized(true);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Invalid or expired code");
		},
	});

	if (isPending) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}

	if (authorized) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle>CLI Authorized</CardTitle>
						<CardDescription>
							Your CLI has been successfully authorized.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-center text-muted-foreground">
							You can close this page.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!session) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle>Sign in required</CardTitle>
						<CardDescription>
							You must be signed in to authorize the CLI.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col items-center gap-4">
						<p className="text-center text-muted-foreground text-sm">
							Please sign in with your Google account to continue.
						</p>
						<Button
							className="w-full"
							onClick={() =>
								authClient.signIn.social({
									provider: "google",
									callbackURL: "/device",
								})
							}
						>
							Sign in with Google
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Authorize CLI</CardTitle>
					<CardDescription>
						Enter the code shown in your terminal to authorize the CLI.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="user-code">Authorization Code</Label>
						<Input
							id="user-code"
							placeholder="XXXX-XXXX"
							value={userCode}
							onChange={(e) => setUserCode(e.target.value.toUpperCase())}
							maxLength={9}
						/>
					</div>
				</CardContent>
				<CardFooter>
					<Button
						className="w-full"
						disabled={userCode.length !== 9 || verify.isPending}
						onClick={() => verify.mutate(userCode)}
					>
						{verify.isPending ? "Verifying..." : "Authorize"}
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
