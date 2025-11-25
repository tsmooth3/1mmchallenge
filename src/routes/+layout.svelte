<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import Navbar from '$lib/components/Navbar.svelte';
	import type { LayoutData } from './$types';
	import { theme } from '$lib/stores/theme';
	import { onMount } from 'svelte';

	let { children, data }: { children: any; data: LayoutData } = $props();
	
	onMount(() => {
		// Ensure theme is applied on mount
		theme.subscribe((value) => {
			document.documentElement.setAttribute('data-theme', value);
		});
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="app">
	<Navbar data={data} />
	<main class="main-content">
		{@render children()}
	</main>
</div>

<style>
	:global(*) {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}

	:global(body) {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
			sans-serif;
		line-height: 1.6;
		color: #002868;
		background: linear-gradient(180deg, #ffffff 0%, #f0f4ff 100%);
		background-attachment: fixed;
		transition: background 0.3s ease, color 0.3s ease;
	}
	
	:global([data-theme='dark'] body) {
		color: #e0e8f5;
		background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
	}

	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
	
	.main-content {
		flex: 1;
	}
</style>
