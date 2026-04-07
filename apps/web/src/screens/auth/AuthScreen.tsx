import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@kokuin/ui/components/card";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@kokuin/ui/components/tabs";
import { useState } from "react";
import { SignInView } from "@/views/auth/SignInView";
import { SignUpView } from "@/views/auth/SignUpView";

export function AuthScreen() {
	const [tab, setTab] = useState<"signin" | "signup">("signin");

	return (
		<Card className="w-full max-w-md">
			<CardHeader className="text-center">
				<CardTitle className="text-2xl">Kokuin</CardTitle>
				<CardDescription>Code review graph & OpenWolf platform</CardDescription>
			</CardHeader>
			<CardContent>
				<Tabs
					value={tab}
					onValueChange={(v) => setTab(v as "signin" | "signup")}
				>
					<TabsList className="mb-4 grid w-full grid-cols-2">
						<TabsTrigger value="signin">Sign in</TabsTrigger>
						<TabsTrigger value="signup">Sign up</TabsTrigger>
					</TabsList>
					<TabsContent value="signin">
						<SignInView onSwitchToSignUp={() => setTab("signup")} />
					</TabsContent>
					<TabsContent value="signup">
						<SignUpView onSwitchToSignIn={() => setTab("signin")} />
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}
