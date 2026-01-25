import type { Handle } from "@sveltejs/kit";
import { verifySession } from "$lib/auth";

export const handle: Handle = async ({ event, resolve }) => {
	const sessionCookie = event.cookies.get("session");
	const secret = event.platform?.env?.SESSION_SECRET;

	if (sessionCookie && secret) {
		const isValid = await verifySession(sessionCookie, secret);
		event.locals.user = isValid ? { authenticated: true } : null;
	} else {
		event.locals.user = null;
	}

	return resolve(event);
};
