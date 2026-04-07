import { cn } from "@kokuin/ui/lib/utils";
import type { HTMLAttributes } from "react";

const variantClass: Record<MarkVariant, string> = {
	sidebar: "h-10",
	auth: "h-14",
	compact: "h-7",
};

type MarkVariant = "sidebar" | "auth" | "compact";

interface KokuinKanjiMarkProps extends HTMLAttributes<HTMLDivElement> {
	// Usage rules: sidebar for app shell, auth for sign-in/sign-up header,
	// compact for tight spaces (menus/buttons) where the full mark still fits.
	variant?: MarkVariant;
	decorative?: boolean;
}

export function KokuinKanjiMark({
	variant = "sidebar",
	decorative = false,
	className,
	...props
}: KokuinKanjiMarkProps) {
	return (
		<div className={cn("w-fit", variantClass[variant], className)} {...props}>
			<img
				src="/kokuin-kanji.svg"
				alt={decorative ? "" : "黒印 (Kokuin)"}
				className="h-full w-auto select-none"
				loading="eager"
				decoding="async"
			/>
		</div>
	);
}
