import { Button } from "@kokuin/ui/components/button";
import { Input } from "@kokuin/ui/components/input";
import { Label } from "@kokuin/ui/components/label";
import { Separator } from "@kokuin/ui/components/separator";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { signInWithEmail } from "@/services/auth.service";
import { GoogleOAuthButton } from "./GoogleOAuthButton";

interface SignInViewProps {
	onSwitchToSignUp: () => void;
}

export function SignInView({ onSwitchToSignUp }: SignInViewProps) {
	const navigate = useNavigate();

	const form = useForm({
		defaultValues: { email: "", password: "" },
		validators: {
			onSubmit: z.object({
				email: z.string().email("Invalid email address"),
				password: z.string().min(8, "Password must be at least 8 characters"),
			}),
		},
		onSubmit: async ({ value }) => {
			const result = await signInWithEmail(value.email, value.password);
			if (result.error) {
				toast.error(result.error.message || "Sign in failed");
				return;
			}
			navigate({ to: "/dashboard" });
		},
	});

	return (
		<div className="space-y-4">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
				className="space-y-3"
			>
				<form.Field name="email">
					{(field) => (
						<div className="space-y-1">
							<Label htmlFor="signin-email">Email</Label>
							<Input
								id="signin-email"
								name="email"
								type="email"
								autoComplete="email"
								placeholder="you@example.com"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
							/>
							{field.state.meta.errors.length > 0 && (
								<p className="text-destructive text-xs">
									{field.state.meta.errors[0]?.message}
								</p>
							)}
						</div>
					)}
				</form.Field>

				<form.Field name="password">
					{(field) => (
						<div className="space-y-1">
							<Label htmlFor="signin-password">Password</Label>
							<Input
								id="signin-password"
								name="password"
								type="password"
								autoComplete="current-password"
								placeholder="••••••••"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
							/>
							{field.state.meta.errors.length > 0 && (
								<p className="text-destructive text-xs">
									{field.state.meta.errors[0]?.message}
								</p>
							)}
						</div>
					)}
				</form.Field>

				<form.Subscribe
					selector={(s) => ({
						isSubmitting: s.isSubmitting,
						canSubmit: s.canSubmit,
					})}
				>
					{({ isSubmitting, canSubmit }) => (
						<Button
							type="submit"
							className="w-full"
							disabled={!canSubmit || isSubmitting}
						>
							{isSubmitting ? "Signing in…" : "Sign in"}
						</Button>
					)}
				</form.Subscribe>
			</form>

			<div className="flex items-center gap-2">
				<Separator className="flex-1" />
				<span className="text-muted-foreground text-xs">or</span>
				<Separator className="flex-1" />
			</div>

			<GoogleOAuthButton />

			<p className="text-center text-muted-foreground text-sm">
				Don't have an account?{" "}
				<button
					type="button"
					onClick={onSwitchToSignUp}
					className="text-foreground underline underline-offset-4 hover:text-primary"
				>
					Sign up
				</button>
			</p>
		</div>
	);
}
