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

		const { sport } = await event.request.json();

		if (!sport) {
			return json({ error: 'Sport is required' }, { status: 400 });
		}

		// Update user's sport
		db.prepare('UPDATE users SET sport = ? WHERE id = ?').run(sport, userId);

		return json({ success: true });
	} catch (error: any) {
		console.error('Error updating profile:', error);
		return json({ error: 'Server error' }, { status: 500 });
	}
};

