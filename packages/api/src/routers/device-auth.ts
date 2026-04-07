import { randomBytes } from "node:crypto";

import prisma from "@kokuin/db";
import { ORPCError } from "@orpc/server";
import { z } from "zod";

import { protectedProcedure, publicProcedure } from "../index";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const DEVICE_CODE_LENGTH = 32;
const USER_CODE_SEGMENT_LENGTH = 4;
const ACCESS_TOKEN_LENGTH = 48;
const EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
const POLL_INTERVAL = 5; // seconds

function fillRandomBytes(buffer: Uint8Array): void {
	const crypto = globalThis.crypto;
	if (crypto?.getRandomValues) {
		crypto.getRandomValues(buffer);
		return;
	}
	const bytes = randomBytes(buffer.length);
	buffer.set(bytes);
}

function randomChars(length: number): string {
	const charsLength = CHARS.length;
	const maxByte = 256 - (256 % charsLength);
	let result = "";

	while (result.length < length) {
		const buffer = new Uint8Array((length - result.length) * 2);
		fillRandomBytes(buffer);
		for (const byte of buffer) {
			if (byte >= maxByte) continue;
			result += CHARS[byte % charsLength];
			if (result.length === length) break;
		}
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

export const deviceAuthRouter = {
	authorize: publicProcedure.handler(async () => {
		// Purge stale codes first
		await prisma.deviceAuthCode.deleteMany({
			where: { expiresAt: { lt: new Date() } },
		});

		const deviceCode = generateDeviceCode();
		const userCode = generateUserCode();
		const expiresAt = new Date(Date.now() + EXPIRY_MS);

		await prisma.deviceAuthCode.create({
			data: { deviceCode, userCode, expiresAt },
		});

		return { deviceCode, userCode, expiresAt, pollInterval: POLL_INTERVAL };
	}),

	verify: protectedProcedure
		.input(z.object({ userCode: z.string() }))
		.handler(async ({ input, context }) => {
			const entry = await prisma.deviceAuthCode.findFirst({
				where: {
					userCode: input.userCode,
					expiresAt: { gt: new Date() },
					accessToken: null,
				},
			});

			if (!entry) {
				throw new ORPCError("NOT_FOUND", {
					message: "Invalid or expired user code",
				});
			}

			const accessToken = randomChars(ACCESS_TOKEN_LENGTH);
			await prisma.deviceAuthCode.update({
				where: { id: entry.id },
				data: { userId: context.session.user.id, accessToken },
			});

			return { success: true };
		}),

	token: publicProcedure
		.input(z.object({ deviceCode: z.string() }))
		.handler(async ({ input }) => {
			const entry = await prisma.deviceAuthCode.findUnique({
				where: { deviceCode: input.deviceCode },
			});

			if (!entry) {
				throw new ORPCError("NOT_FOUND", { message: "Unknown device code" });
			}

			if (entry.expiresAt < new Date()) {
				await prisma.deviceAuthCode.delete({ where: { id: entry.id } });
				throw new ORPCError("GONE", { message: "expired" });
			}

			if (!entry.accessToken) {
				throw new ORPCError("PRECONDITION_FAILED", {
					message: "authorization_pending",
				});
			}

			const accessToken = entry.accessToken;
			const userId = entry.userId;
			// Extend expiry to 90 days — record becomes a persistent CLI session token
			await prisma.deviceAuthCode.update({
				where: { id: entry.id },
				data: { expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
			});

			return { accessToken, userId };
		}),
};
