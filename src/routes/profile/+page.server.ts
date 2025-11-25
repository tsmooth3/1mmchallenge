import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getUser } from '$lib/auth';

export const load: PageServerLoad = async (event) => {
	const user = await getUser(event);
	
	if (!user) {
		throw redirect(302, '/login');
	}
	
	return {
		user: {
			name: user.name,
			email: user.email,
			sport: user.sport
		}
	};
};

