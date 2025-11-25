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

		// Get current year
		const currentYear = new Date().getFullYear();
		
		// Start transaction
		db.exec('BEGIN TRANSACTION');
		
		try {
			// Delete all progress entries for the current year
			db.prepare(`
				DELETE FROM progress_entries 
				WHERE user_id = ? 
				AND strftime('%Y', entry_date) = ?
			`).run(userId, String(currentYear));
			
			// Update user's sport
			db.prepare('UPDATE users SET sport = ? WHERE id = ?').run(sport, userId);
			
			// Commit transaction
			db.exec('COMMIT');
			
			return json({ success: true });
		} catch (error: any) {
			// Rollback on error
			db.exec('ROLLBACK');
			throw error;
		}
	} catch (error: any) {
		console.error('Error updating sport:', error);
		return json({ error: 'Server error' }, { status: 500 });
	}
};

