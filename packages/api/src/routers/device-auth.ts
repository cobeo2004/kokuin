import { ORPCError } from "@orpc/server";
import { z } from "zod";

import { protectedProcedure, publicProcedure } from "../index";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const DEVICE_CODE_LENGTH = 32;
const USER_CODE_SEGMENT_LENGTH = 4;
const EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
const POLL_INTERVAL = 5; // seconds

interface DeviceCodeEntry {
	deviceCode: string;
	userCode: string;
	expiresAt: Date;
	userId?: string;
	accessToken?: string;
}

const deviceCodeStore = new Map<string, DeviceCodeEntry>();

function randomChars(length: number): string {
	let result = "";
	for (let i = 0; i < length; i++) {
		result += CHARS[Math.floor(Math.random() * CHARS.length)];
	}
	return result;
}

function generateDeviceCode(): string {
	return randomChars(DEVICE_CODE_LENGTH);
}

function generateUserCode(): string {
	const a = randomChars(USER_CODE_SEGMENT_LENGTH);
	const b = randomChars(USER_CODE_SEGMENT_LENGTH);
	return `${a}-${b}`;
}

function cleanExpired(): void {
	const now = new Date();
	for (const [key, entry] of deviceCodeStore.entries()) {
		if (entry.expiresAt < now) {
			deviceCodeStore.delete(key);
		}
	}
}

export const deviceAuthRouter = {
	authorize: publicProcedure.handler(() => {
		cleanExpired();
		const deviceCode = generateDeviceCode();
		const userCode = generateUserCode();
		const expiresAt = new Date(Date.now() + EXPIRY_MS);

		deviceCodeStore.set(deviceCode, { deviceCode, userCode, expiresAt });

		return {
			deviceCode,
			userCode,
			expiresAt,
			pollInterval: POLL_INTERVAL,
		};
	}),

	verify: protectedProcedure
		.input(z.object({ userCode: z.string() }))
		.handler(({ input, context }) => {
			cleanExpired();
			const now = new Date();
			let found: DeviceCodeEntry | undefined;

			for (const entry of deviceCodeStore.values()) {
				if (entry.userCode === input.userCode && entry.expiresAt > now) {
					found = entry;
					break;
				}
			}

			if (!found) {
				throw new ORPCError("NOT_FOUND", {
					message: "Invalid or expired user code",
				});
			}

			const accessToken = randomChars(48);
			found.userId = context.session.user.id;
			found.accessToken = accessToken;

			return { success: true };
		}),

	token: publicProcedure
		.input(z.object({ deviceCode: z.string() }))
		.handler(({ input }) => {
			const entry = deviceCodeStore.get(input.deviceCode);

			if (!entry) {
				throw new ORPCError("NOT_FOUND", {
					message: "Unknown device code",
				});
			}

			if (entry.expiresAt < new Date()) {
				deviceCodeStore.delete(input.deviceCode);
				throw new ORPCError("GONE", {
					message: "expired",
				});
			}

			if (!entry.accessToken) {
				throw new ORPCError("PRECONDITION_FAILED", {
					message: "authorization_pending",
				});
			}

			const accessToken = entry.accessToken;
			deviceCodeStore.delete(input.deviceCode);

			return { accessToken };
		}),
};
