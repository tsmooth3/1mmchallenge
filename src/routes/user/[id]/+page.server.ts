import type { PageServerLoad } from './$types';
import db from '$lib/db';

export const load: PageServerLoad = async (event) => {
	const userId = event.params.id;
	const yearParam = event.url.searchParams.get('year');
	const selectedYear = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();
	
	if (!userId) {
		return {
			user: null,
			entries: [],
			totalMeters: 0,
			percentage: 0,
			dailyAverage: 0,
			estimatedCompletion: null,
			selectedYear,
			availableYears: []
		};
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
		return {
			user: null,
			entries: [],
			totalMeters: 0,
			percentage: 0,
			dailyAverage: 0,
			estimatedCompletion: null,
			selectedYear,
			availableYears: []
		};
	}

	// Get available years from entries
	const yearRows = db
		.prepare(
			"SELECT DISTINCT strftime('%Y', entry_date) as year FROM progress_entries WHERE user_id = ? ORDER BY year DESC"
		)
		.all(userId) as Array<{ year: string }>;
	
	const availableYears = yearRows.map((row) => parseInt(row.year, 10));

	// Get progress entries for selected year
	const entries = db
		.prepare(
			"SELECT * FROM progress_entries WHERE user_id = ? AND strftime('%Y', entry_date) = ? ORDER BY entry_timestamp DESC, created_at DESC"
		)
		.all(userId, String(selectedYear)) as Array<{
		id: number;
		user_id: string;
		meters: number;
		entry_date: string;
		entry_time: string | null;
		entry_timestamp: string | null;
		created_at: string;
	}>;

	// Calculate total progress for selected year
	const progress = db
		.prepare("SELECT SUM(meters) as total FROM progress_entries WHERE user_id = ? AND strftime('%Y', entry_date) = ?")
		.get(userId, String(selectedYear)) as { total: number | null };

	const totalMeters = progress.total || 0;
	const percentage = (totalMeters / 1000000) * 100;

	// Calculate daily average for selected year
	const stats = db
		.prepare(
			"SELECT COUNT(*) as count, MIN(entry_date) as first_date, MAX(entry_date) as last_date FROM progress_entries WHERE user_id = ? AND strftime('%Y', entry_date) = ?"
		)
		.get(userId, String(selectedYear)) as {
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
		selectedYear,
		availableYears
	};
};

