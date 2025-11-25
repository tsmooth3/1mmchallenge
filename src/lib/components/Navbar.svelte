<script lang="ts">
	import { goto } from '$app/navigation';
	import { theme } from '$lib/stores/theme';
	
	type User = {
		id: number;
		name: string;
		email: string;
		sport: string;
	};
	
	type NavbarData = {
		userId: number | null;
		user: User | null;
	};
	
	let { data }: { data: NavbarData } = $props();
	
	async function handleLogout() {
		try {
			const response = await fetch('/api/logout', { 
				method: 'POST',
				credentials: 'include' // Ensure cookies are sent
			});
			if (response.ok) {
				window.location.href = '/';
			} else {
				// Even if the request fails, try to redirect
				window.location.href = '/';
			}
		} catch (error) {
			console.error('Logout error:', error);
			// Still redirect even on error
			window.location.href = '/';
		}
	}
	
	function toggleTheme() {
		theme.toggle();
	}
</script>

<nav class="navbar">
	<div class="nav-container">
		<div class="nav-brand">
			<a href="/">1MM Challenge</a>
		</div>
		
		<div class="nav-links">
			<button onclick={toggleTheme} class="btn-theme" title="Toggle dark mode">
				{#if $theme === 'dark'}
					☀️
				{:else}
					🌙
				{/if}
			</button>
			{#if data.user}
				<a href="/progress" class="btn-add-progress">+Add {data.user.sport}</a>
				<a href="/profile" class="user-info">
					<span class="user-name">{data.user.name}</span>
				</a>
				<button onclick={handleLogout} class="btn-logout">Logout</button>
			{:else}
				<a href="/login">Log In</a>
			{/if}
		</div>
	</div>
</nav>

<style>
	.navbar {
		background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		padding: 0;
		position: sticky;
		top: 0;
		z-index: 100;
		border-bottom: 2px solid rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
	}
	
	.nav-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 1rem 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.nav-brand a {
		font-size: 1.5rem;
		font-weight: 700;
		color: #ffffff;
		text-decoration: none;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
		white-space: nowrap;
		transition: all 0.3s ease;
	}
	
	.nav-brand a:hover {
		color: #60a5fa;
		text-shadow: 0 2px 12px rgba(96, 165, 250, 0.5);
		transform: translateY(-1px);
	}
	
	.nav-links {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}
	
	.nav-links a {
		color: #e0e8f5;
		text-decoration: none;
		font-weight: 500;
		transition: all 0.3s ease;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		white-space: nowrap;
		position: relative;
	}
	
	.nav-links a:hover {
		background: linear-gradient(135deg, rgba(96, 165, 250, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
		color: #60a5fa;
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}
	
	.btn-add-progress {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: linear-gradient(135deg, rgba(96, 165, 250, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%);
		border-radius: 0.5rem;
		border: 1px solid rgba(96, 165, 250, 0.3);
		backdrop-filter: blur(5px);
		color: #60a5fa;
		text-decoration: none;
		font-weight: 600;
		white-space: nowrap;
		transition: all 0.3s ease;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
	}
	
	.btn-add-progress:hover {
		background: linear-gradient(135deg, rgba(96, 165, 250, 0.25) 0%, rgba(59, 130, 246, 0.25) 100%);
		border-color: rgba(96, 165, 250, 0.5);
		color: #60a5fa;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);
	}
	
	.user-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: linear-gradient(135deg, rgba(96, 165, 250, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%);
		border-radius: 0.5rem;
		border: 1px solid rgba(96, 165, 250, 0.3);
		backdrop-filter: blur(5px);
		text-decoration: none;
		transition: all 0.3s ease;
		cursor: pointer;
	}
	
	.user-info:hover {
		background: linear-gradient(135deg, rgba(96, 165, 250, 0.25) 0%, rgba(59, 130, 246, 0.25) 100%);
		border-color: rgba(96, 165, 250, 0.5);
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}
	
	.user-name {
		font-weight: 600;
		color: #60a5fa;
		white-space: nowrap;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
	}
	
	.btn-logout {
		padding: 0.5rem 1rem;
		background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 0.5rem;
		cursor: pointer;
		font-weight: 600;
		transition: all 0.3s ease;
		white-space: nowrap;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
	}
	
	.btn-logout:hover {
		background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
		border-color: rgba(255, 255, 255, 0.4);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
	}
	
	.btn-theme {
		padding: 0.5rem;
		background: linear-gradient(135deg, rgba(96, 165, 250, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
		color: #60a5fa;
		border: 1px solid rgba(96, 165, 250, 0.3);
		border-radius: 0.5rem;
		cursor: pointer;
		font-size: 1.25rem;
		transition: all 0.3s ease;
		width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
	}
	
	.btn-theme:hover {
		background: linear-gradient(135deg, rgba(96, 165, 250, 0.3) 0%, rgba(59, 130, 246, 0.3) 100%);
		border-color: rgba(96, 165, 250, 0.5);
		transform: scale(1.1) rotate(15deg);
		box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);
	}
	
	@media (max-width: 768px) {
		.navbar {
			border-bottom-width: 1px;
		}
		
		.nav-container {
			padding: 0.5rem 0.75rem;
			gap: 0.5rem;
		}
		
		.nav-brand a {
			font-size: 1rem;
		}
		
		.nav-links {
			gap: 0.5rem;
			flex-wrap: nowrap;
		}
		
		.nav-links a {
			padding: 0.35rem 0.6rem;
			font-size: 0.8rem;
		}
		
		.btn-add-progress {
			padding: 0.35rem 0.6rem;
			font-size: 0.8rem;
		}
		
		.user-info {
			padding: 0.35rem 0.6rem;
			gap: 0.35rem;
		}
		
		.user-name {
			font-size: 0.8rem;
		}
		
		.btn-logout {
			padding: 0.35rem 0.6rem;
			font-size: 0.8rem;
			border-width: 1px;
		}
		
		.btn-theme {
			width: 1.75rem;
			height: 1.75rem;
			font-size: 0.9rem;
			padding: 0.25rem;
		}
	}
	
	@media (max-width: 480px) {
		.nav-container {
			padding: 0.4rem 0.5rem;
		}
		
		.nav-brand a {
			font-size: 0.9rem;
		}
		
		.nav-links {
			gap: 0.35rem;
		}
		
		.nav-links a {
			padding: 0.3rem 0.5rem;
			font-size: 0.75rem;
		}
		
		.btn-add-progress {
			padding: 0.3rem 0.5rem;
			font-size: 0.75rem;
		}
		
		.user-info {
			padding: 0.3rem 0.5rem;
			gap: 0.3rem;
		}
		
		.user-name {
			font-size: 0.75rem;
		}
		
		.btn-logout {
			padding: 0.3rem 0.5rem;
			font-size: 0.75rem;
		}
		
		.btn-theme {
			width: 1.6rem;
			height: 1.6rem;
			font-size: 0.8rem;
		}
	}
</style>

