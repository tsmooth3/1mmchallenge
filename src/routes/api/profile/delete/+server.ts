import { json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUserId } from '$lib/auth';
import { lucia } from '$lib/lucia';
import db from '$lib/db';

export const POST: RequestHandler = async (event) => {
	try {
		const userId = await getUserId(event);
		if (!userId) {
			return json({ error: 'Not authenticated' }, { status: 401 });
		}

		// Get session ID before deleting user
		const sessionId = event.cookies.get(lucia.sessionCookieName);

		// Start transaction
		db.exec('BEGIN TRANSACTION');
		
		let transactionCommitted = false;
		
		try {
			// Delete all progress entries for the user
			db.prepare('DELETE FROM progress_entries WHERE user_id = ?').run(userId);
			
			// Delete all sessions for the user (Lucia will handle this via CASCADE, but we'll do it explicitly)
			db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
			
			// Delete the user (this will cascade delete sessions due to foreign key)
			db.prepare('DELETE FROM users WHERE id = ?').run(userId);
			
			// Commit transaction
			db.exec('COMMIT');
			transactionCommitted = true;
			
			// Invalidate and clear the session cookie (after commit, so errors here don't affect the deletion)
			if (sessionId) {
				try {
					await lucia.invalidateSession(sessionId);
				} catch (sessionError) {
					// Session might already be deleted, that's okay
					console.warn('Session invalidation warning (non-critical):', sessionError);
				}
			}
			
			// Clear the session cookie using Lucia's blank session cookie
			const blankSessionCookie = lucia.createBlankSessionCookie();
			event.cookies.set(blankSessionCookie.name, blankSessionCookie.value, {
				path: '.',
				...blankSessionCookie.attributes
			});
			
			return json({ success: true });
		} catch (error: any) {
			// Only rollback if transaction hasn't been committed
			if (!transactionCommitted) {
				try {
					db.exec('ROLLBACK');
				} catch (rollbackError) {
					console.error('Error during rollback:', rollbackError);
				}
			}
			throw error;
		}
	} catch (error: any) {
		console.error('Error deleting account:', error);
		return json({ error: 'Server error' }, { status: 500 });
	}
};

