import { Lucia } from 'lucia';
import { BetterSqlite3Adapter } from '@lucia-auth/adapter-sqlite';
import db from './db';
import { dev } from '$app/environment';

const adapter = new BetterSqlite3Adapter(db, {
	user: 'users',
	session: 'sessions'
});

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !dev
		}
	},
	getUserAttributes: (attributes) => {
		return {
			name: attributes.name,
			email: attributes.email,
			sport: attributes.sport,
			googleId: attributes.google_id
		};
	}
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: {
			name: string;
			email: string;
			sport: string;
			google_id: string | null;
		};
	}
}

