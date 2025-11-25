import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getUserId, getUser } from '$lib/auth';

export const load: PageServerLoad = async (event) => {
	const user = await getUser(event);
	
	if (!user) {
		throw redirect(302, '/login');
	}
	
	// If user already has a sport other than 'Other', redirect to progress
	if (user.sport && user.sport !== 'Other') {
		throw redirect(302, '/progress');
	}
	
	return {
		currentSport: user.sport || 'Other'
	};
};

