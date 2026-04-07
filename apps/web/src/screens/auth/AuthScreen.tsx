import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
} from "@kokuin/ui/components/card";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@kokuin/ui/components/tabs";
import { useState } from "react";
import { KokuinKanjiMark } from "@/components/brand/KokuinKanjiMark";
import { SignInView } from "@/views/auth/SignInView";
import { SignUpView } from "@/views/auth/SignUpView";

export function AuthScreen() {
	const [tab, setTab] = useState<"signin" | "signup">("signin");

	return (
		<div className="flex min-h-dvh items-center justify-center px-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-4 text-center">
					<KokuinKanjiMark variant="auth" className="mx-auto" />
					<CardDescription>
						刻印 (kokuin): Engraved in stillness. Retrieved in a flash.
					</CardDescription>
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
		</div>
	);
}
