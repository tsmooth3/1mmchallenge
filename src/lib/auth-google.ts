import { Google } from 'arctic';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

// Lazy initialization to ensure env vars are loaded at runtime
let _googleAuth: Google | null = null;

function getGoogleAuth(): Google {
	if (_googleAuth) {
		return _googleAuth;
	}

	// Access env vars using SvelteKit's env module
	const clientId = env.GOOGLE_CLIENT_ID || '';
	const clientSecret = env.GOOGLE_CLIENT_SECRET || '';
	const redirectURI = dev
		? 'http://localhost:5173/login/google/callback'
		: `${env.PUBLIC_APP_URL || env.APP_URL || 'http://localhost:5173'}/login/google/callback`;

	if (!clientId || !clientSecret) {
		throw new Error('Google OAuth credentials not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env');
	}

	_googleAuth = new Google(clientId, clientSecret, redirectURI);
	return _googleAuth;
}

// Export a proxy that lazily initializes
export const googleAuth = new Proxy({} as Google, {
	get(target, prop) {
		const auth = getGoogleAuth();
		const value = (auth as any)[prop];
		if (typeof value === 'function') {
			return value.bind(auth);
		}
		return value;
	}
});

