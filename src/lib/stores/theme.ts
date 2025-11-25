import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
	if (!browser) return 'light';
	
	const stored = localStorage.getItem('theme') as Theme | null;
	if (stored === 'light' || stored === 'dark') {
		return stored;
	}
	
	// Check system preference
	if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
		return 'dark';
	}
	
	return 'light';
}

function createThemeStore() {
	const initialTheme = getInitialTheme();
	
	// Set initial theme on document
	if (browser) {
		document.documentElement.setAttribute('data-theme', initialTheme);
	}
	
	const { subscribe, set, update } = writable<Theme>(initialTheme);

	return {
		subscribe,
		set: (theme: Theme) => {
			if (browser) {
				localStorage.setItem('theme', theme);
				document.documentElement.setAttribute('data-theme', theme);
			}
			set(theme);
		},
		toggle: () => {
			update((current) => {
				const newTheme = current === 'light' ? 'dark' : 'light';
				if (browser) {
					localStorage.setItem('theme', newTheme);
					document.documentElement.setAttribute('data-theme', newTheme);
				}
				return newTheme;
			});
		}
	};
}

export const theme = createThemeStore();

