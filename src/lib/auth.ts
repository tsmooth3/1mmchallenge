import type { RequestEvent } from '@sveltejs/kit';
import { lucia } from './lucia';

export async function getUserId(event: RequestEvent): Promise<string | null> {
	const sessionId = event.cookies.get(lucia.sessionCookieName);
	if (!sessionId) {
		return null;
	}

	const { session } = await lucia.validateSession(sessionId);
	return session?.userId ?? null;
}

export async function getUser(event: RequestEvent) {
	const sessionId = event.cookies.get(lucia.sessionCookieName);
	if (!sessionId) {
		return null;
	}

	const { user, session } = await lucia.validateSession(sessionId);
	if (!session || !user) {
		return null;
	}

	return user;
}

