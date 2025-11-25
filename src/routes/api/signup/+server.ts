import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import db from '$lib/db';
import { lucia } from '$lib/lucia';
import bcrypt from 'bcryptjs';
import { generateId } from 'lucia';

export const POST: RequestHandler = async (event) => {
	try {
		const { name, email, password, sport } = await event.request.json();

		if (!name || !email || !password || !sport) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		if (password.length < 6) {
			return json({ error: 'Password must be at least 6 characters' }, { status: 400 });
		}

		// Check if user already exists
		const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as
			| { id: string }
			| undefined;

		if (existing) {
			return json({ error: 'Email already registered' }, { status: 400 });
		}

		// Hash password
		const passwordHash = await bcrypt.hash(password, 10);

		// Generate user ID
		const userId = generateId(15);

		// Create new user
		db.prepare('INSERT INTO users (id, name, email, sport, password_hash) VALUES (?, ?, ?, ?, ?)').run(
			userId,
			name,
			email,
			sport,
			passwordHash
		);

		// Create session with Lucia
		const session = await lucia.createSession(userId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		return json({ success: true, userId });
	} catch (error: any) {
		if (error.message?.includes('UNIQUE constraint')) {
			return json({ error: 'Email already registered' }, { status: 400 });
		}
		return json({ error: 'Server error' }, { status: 500 });
	}
};

