import type { PageServerLoad } from './$types';
import { getUserId } from '$lib/auth';
import db from '$lib/db';

export const load: PageServerLoad = async (event) => {
	const userId = await getUserId(event);
	
	const users = db.prepare('SELECT * FROM users ORDER BY name').all() as Array<{
		id: string;
		name: string;
		email: string;
		sport: string;
		created_at: string;
	}>;

	const currentYear = new Date().getFullYear();
	
	const leaderboard = users.map((user) => {
		// Filter by current year
		const progress = db
			.prepare("SELECT SUM(meters) as total FROM progress_entries WHERE user_id = ? AND strftime('%Y', entry_date) = ?")
			.get(user.id, String(currentYear)) as { total: number | null };

		const totalMeters = progress.total || 0;
		const percentage = (totalMeters / 1000000) * 100;

		// Calculate daily average for current year
		const entries = db
			.prepare(
				"SELECT COUNT(*) as count, MIN(entry_date) as first_date, MAX(entry_date) as last_date FROM progress_entries WHERE user_id = ? AND strftime('%Y', entry_date) = ?"
			)
			.get(user.id, String(currentYear)) as { count: number; first_date: string | null; last_date: string | null };

		let dailyAverage = 0;
		if (entries.count > 0 && entries.first_date && entries.last_date) {
			const firstDate = new Date(entries.first_date);
			const lastDate = new Date(entries.last_date);
			const daysDiff = Math.max(1, Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
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
			...user,
			totalMeters,
			percentage: Math.min(100, percentage),
			dailyAverage: Math.round(dailyAverage),
			estimatedCompletion
		};
	});

	// Sort by total meters descending
	leaderboard.sort((a, b) => b.totalMeters - a.totalMeters);

	return {
		userId,
		leaderboard
	};
};

