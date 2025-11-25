import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import db from '$lib/db';
import { getUserId } from '$lib/auth';
import { combineEasternDateTime } from '$lib/timezone';

export const load: PageServerLoad = async (event) => {
	const userId = await getUserId(event);

	if (!userId) {
		throw redirect(302, '/login');
	}

	const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as
		| {
				id: string;
				name: string;
				email: string;
				sport: string;
				created_at: string;
		  }
		| undefined;

	if (!user) {
		throw redirect(302, '/signup');
	}

	// Check if this is the first entry for the current year
	const currentYear = new Date().getFullYear();
	const currentYearEntries = db
		.prepare("SELECT COUNT(*) as count FROM progress_entries WHERE user_id = ? AND strftime('%Y', entry_date) = ?")
		.get(userId, String(currentYear)) as { count: number };
	
	const isFirstEntryOfYear = currentYearEntries.count === 0;

	// Get progress entries
	const entries = db
		.prepare(
			'SELECT * FROM progress_entries WHERE user_id = ? ORDER BY entry_timestamp DESC, created_at DESC LIMIT 50'
		)
		.all(userId) as Array<{
		id: number;
		user_id: number;
		meters: number;
		entry_date: string;
		entry_time: string | null;
		entry_timestamp: string | null;
		created_at: string;
	}>;

	// Calculate total progress
	const progress = db
		.prepare('SELECT SUM(meters) as total FROM progress_entries WHERE user_id = ?')
		.get(userId) as { total: number | null };

	const totalMeters = progress.total || 0;
	const percentage = (totalMeters / 1000000) * 100;

	// Calculate daily average
	const stats = db
		.prepare(
			'SELECT COUNT(*) as count, MIN(entry_date) as first_date, MAX(entry_date) as last_date FROM progress_entries WHERE user_id = ?'
		)
		.get(userId) as {
		count: number;
		first_date: string | null;
		last_date: string | null;
	};

	let dailyAverage = 0;
	if (stats.count > 0 && stats.first_date && stats.last_date) {
		const firstDate = new Date(stats.first_date);
		const lastDate = new Date(stats.last_date);
		const daysDiff =
			Math.max(1, Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
		dailyAverage = totalMeters / daysDiff;
	}

	// Calculate estimated completion date
	let estimatedCompletion: string | null = null;
	if (dailyAverage > 0) {
		const remainingMeters = 1000000 - totalMeters;
		const daysRemaining = Math.ceil(remainingMeters / dailyAverage);
		const completionDate = new Date();
		completionDate.setDate(completionDate.getDate() + daysRemaining);
		estimatedCompletion = completionDate.toISOString().split('T')[0];
	}

	return {
		user,
		entries,
		totalMeters,
		percentage: Math.min(100, percentage),
		dailyAverage: Math.round(dailyAverage),
		estimatedCompletion,
		isFirstEntryOfYear
	};
};

export const actions: Actions = {
	default: async (event) => {
		const userId = await getUserId(event);

		if (!userId) {
			return { error: 'Not authenticated' };
		}

		const formData = await event.request.formData();
		const metersValue = formData.get('meters')?.toString() || '0';
		const meters = Math.round(parseFloat(metersValue));
		const entryDate = formData.get('date')?.toString();
		const entryTime = formData.get('time')?.toString() || '12:00';
		const newSport = formData.get('sport')?.toString();

		if (!meters || meters <= 0) {
			return { error: 'Please enter a valid number of meters (minimum 1)' };
		}

		if (!entryDate) {
			return { error: 'Please select a date' };
		}

		try {
			// Check if this is the first entry for the current year
			const entryYear = new Date(entryDate).getFullYear();
			const currentYearEntries = db
				.prepare("SELECT COUNT(*) as count FROM progress_entries WHERE user_id = ? AND strftime('%Y', entry_date) = ?")
				.get(userId, String(entryYear)) as { count: number };
			
			const isFirstEntryOfYear = currentYearEntries.count === 0;

			// If this is the first entry of the year and a new sport is provided, update the sport
			if (isFirstEntryOfYear && newSport) {
				db.prepare('UPDATE users SET sport = ? WHERE id = ?').run(newSport, userId);
			}

			// Combine date and time into a timestamp in Eastern Time
			const entryTimestamp = combineEasternDateTime(entryDate, entryTime);
			
			// Store the date, time, and timestamp
			db.prepare(
				'INSERT INTO progress_entries (user_id, meters, entry_date, entry_time, entry_timestamp) VALUES (?, ?, ?, ?, ?)'
			).run(userId, meters, entryDate, entryTime, entryTimestamp);

			return { success: true };
		} catch (error) {
			console.error('Error saving progress:', error);
			return { error: 'Failed to save progress' };
		}
	}
};

