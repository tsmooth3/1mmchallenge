import type { LayoutServerLoad } from './$types';
import { getUser } from '$lib/auth';

export const load: LayoutServerLoad = async (event) => {
	const user = await getUser(event);
	
	return {
		userId: user?.id ?? null,
		user: user
			? {
					id: user.id,
					name: user.name,
					email: user.email,
					sport: user.sport
			  }
			: null
	};
};

