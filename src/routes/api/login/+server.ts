import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import db from '$lib/db';
import { lucia } from '$lib/lucia';
import bcrypt from 'bcryptjs';

export const POST: RequestHandler = async (event) => {
	try {
		const { email, password } = await event.request.json();

		if (!email || !password) {
			return json({ error: 'Missing email or password' }, { status: 400 });
		}

		// Find user by email
		const user = db
			.prepare('SELECT id, password_hash FROM users WHERE email = ?')
			.get(email) as { id: string; password_hash: string | null } | undefined;

		if (!user) {
			return json({ error: 'Invalid email or password' }, { status: 401 });
		}

		// Check if user has a password (for existing users without passwords)
		if (!user.password_hash) {
			return json({ error: 'Please sign up with a password first' }, { status: 401 });
		}

		// Verify password
		const isValid = await bcrypt.compare(password, user.password_hash);

		if (!isValid) {
			return json({ error: 'Invalid email or password' }, { status: 401 });
		}

		// Create session with Lucia
		const session = await lucia.createSession(user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		return json({ success: true, userId: user.id });
	} catch (error: any) {
		return json({ error: 'Server error' }, { status: 500 });
	}
};

