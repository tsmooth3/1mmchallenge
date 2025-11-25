import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import db from '$lib/db';
import { getUserId } from '$lib/auth';
import { combineEasternDateTime } from '$lib/timezone';

export const PUT: RequestHandler = async (event) => {
	const userId = await getUserId(event);

	if (!userId) {
		return json({ error: 'Not authenticated' }, { status: 401 });
	}

	const entryId = parseInt(event.params.id || '0', 10);
	if (!entryId) {
		return json({ error: 'Invalid entry ID' }, { status: 400 });
	}

	// Verify the entry belongs to the user
	const entry = db
		.prepare('SELECT user_id FROM progress_entries WHERE id = ?')
		.get(entryId) as { user_id: string } | undefined;

	if (!entry) {
		return json({ error: 'Entry not found' }, { status: 404 });
	}

	if (entry.user_id !== userId) {
		return json({ error: 'Unauthorized' }, { status: 403 });
	}

	try {
		const { meters: metersValue, date, time } = await event.request.json();
		const meters = Math.round(parseFloat(metersValue));

		if (!meters || meters <= 0) {
			return json({ error: 'Please enter a valid number of meters (minimum 1)' }, { status: 400 });
		}

		if (!date) {
			return json({ error: 'Please select a date' }, { status: 400 });
		}

		const entryTime = time || '12:00';
		const entryTimestamp = combineEasternDateTime(date, entryTime);

		db.prepare(
			'UPDATE progress_entries SET meters = ?, entry_date = ?, entry_time = ?, entry_timestamp = ? WHERE id = ?'
		).run(meters, date, entryTime, entryTimestamp, entryId);

		return json({ success: true });
	} catch (error) {
		console.error('Error updating entry:', error);
		return json({ error: 'Failed to update entry' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async (event) => {
	const userId = await getUserId(event);

	if (!userId) {
		return json({ error: 'Not authenticated' }, { status: 401 });
	}

	const entryId = parseInt(event.params.id || '0', 10);
	if (!entryId) {
		return json({ error: 'Invalid entry ID' }, { status: 400 });
	}

	// Verify the entry belongs to the user
	const entry = db
		.prepare('SELECT user_id FROM progress_entries WHERE id = ?')
		.get(entryId) as { user_id: string } | undefined;

	if (!entry) {
		return json({ error: 'Entry not found' }, { status: 404 });
	}

	if (entry.user_id !== userId) {
		return json({ error: 'Unauthorized' }, { status: 403 });
	}

	try {
		db.prepare('DELETE FROM progress_entries WHERE id = ?').run(entryId);
		return json({ success: true });
	} catch (error) {
		console.error('Error deleting entry:', error);
		return json({ error: 'Failed to delete entry' }, { status: 500 });
	}
};

