import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUserId } from '$lib/auth';
import db from '$lib/db';

export const POST: RequestHandler = async (event) => {
	try {
		const userId = await getUserId(event);
		if (!userId) {
			return json({ error: 'Not authenticated' }, { status: 401 });
		}

		const { name } = await event.request.json();

		if (!name || typeof name !== 'string' || name.trim() === '') {
			return json({ error: 'Name is required and cannot be empty' }, { status: 400 });
		}

		const trimmedName = name.trim();
		
		// Update user's name
		db.prepare('UPDATE users SET name = ? WHERE id = ?').run(trimmedName, userId);

		return json({ success: true });
	} catch (error: any) {
		console.error('Error updating name:', error);
		return json({ error: 'Server error' }, { status: 500 });
	}
};

