import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { lucia } from '$lib/lucia';

export const POST: RequestHandler = async (event) => {
	const sessionId = event.cookies.get(lucia.sessionCookieName);
	if (!sessionId) {
		return json({ success: true });
	}

	await lucia.invalidateSession(sessionId);
	const sessionCookie = lucia.createBlankSessionCookie();
	event.cookies.set(sessionCookie.name, sessionCookie.value, {
		path: '.',
		...sessionCookie.attributes
	});

	return json({ success: true });
};

