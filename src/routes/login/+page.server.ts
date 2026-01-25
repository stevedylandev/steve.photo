import type { Actions, PageServerLoad } from "./$types";
import { fail, redirect } from "@sveltejs/kit";
import { verifyPassword, createSession } from "$lib/auth";

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user?.authenticated) {
		throw redirect(302, "/admin");
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, platform, cookies }) => {
		const data = await request.formData();
		const password = data.get("password");

		if (!password || typeof password !== "string") {
			return fail(400, { error: "Password is required" });
		}

		const secret = platform?.env?.SESSION_SECRET;
		const passwordHash = platform?.env?.ADMIN_PASSWORD_HASH;

		if (!secret || !passwordHash) {
			return fail(500, { error: "Server configuration error" });
		}

		const isValid = await verifyPassword(password, passwordHash, secret);

		if (!isValid) {
			return fail(401, { error: "Invalid password" });
		}

		const session = await createSession(secret);

		cookies.set("session", session, {
			path: "/",
			httpOnly: true,
			secure: true,
			sameSite: "strict",
			maxAge: 60 * 60 * 24, // 24 hours
		});

		throw redirect(302, "/admin");
	},
};
