import { authClient } from "@/lib/auth-client";

export const signInWithEmail = (email: string, password: string) =>
	authClient.signIn.email({ email, password });

export const signUpWithEmail = (
	name: string,
	email: string,
	password: string,
) =>
	authClient.signUp.email({
		name,
		email,
		password,
		callbackURL: "/dashboard",
	});

export const signInWithGoogle = () =>
	authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" });

export const signOut = () => authClient.signOut();
