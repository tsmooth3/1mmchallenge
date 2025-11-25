<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();
	
	function handleSignup() {
		goto('/signup');
	}
	
	function handleLogProgress() {
		goto('/progress');
	}
</script>

<div class="container">
	<h1>1 Million Meter Challenge</h1>
	<p class="subtitle">Track your progress towards 1 million meters!</p>
	
	<div class="leaderboard">
		<h2>Leaderboard - {new Date().getFullYear()} Progress</h2>
		
		<!-- Desktop table view -->
		<div class="table-container">
			<table>
				<thead>
					<tr>
						<th>Rank</th>
						<th>Name</th>
						<th>Sport</th>
						<th>Progress</th>
						<th>Total Meters</th>
						<th>Daily Avg</th>
						<th>Est. Completion</th>
					</tr>
				</thead>
				<tbody>
					{#each data.leaderboard as user, index}
						<tr class="clickable-row" onclick={() => window.location.href = `/user/${user.id}`}>
							<td class="rank">#{index + 1}</td>
							<td class="name">{user.name}</td>
							<td class="sport">{user.sport}</td>
							<td class="progress">
								<div class="progress-bar">
									<div class="progress-fill" style="width: {user.percentage}%"></div>
									<span class="progress-text">{user.percentage.toFixed(1)}%</span>
								</div>
							</td>
							<td class="meters">{user.totalMeters.toLocaleString()}m</td>
							<td class="avg">{user.dailyAverage.toLocaleString()}m/day</td>
							<td class="completion">
								{#if user.estimatedCompletion}
									{new Date(user.estimatedCompletion).toLocaleDateString()}
								{:else}
									—
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		
		<!-- Mobile card view -->
		<div class="card-container">
					{#each data.leaderboard as user, index}
				<a href="/user/{user.id}" class="leaderboard-card">
					<div class="card-header">
						<span class="card-rank">#{index + 1}</span>
						<div class="card-name-sport">
							<div class="card-name">{user.name}</div>
							<div class="card-sport">{user.sport}</div>
						</div>
					</div>
					<div class="card-progress">
						<div class="card-progress-label">Progress</div>
						<div class="progress-bar">
							<div class="progress-fill" style="width: {user.percentage}%"></div>
							<span class="progress-text">{user.percentage.toFixed(1)}%</span>
						</div>
					</div>
					<div class="card-stats">
						<div class="card-stat">
							<div class="card-stat-label">Total</div>
							<div class="card-stat-value">{user.totalMeters.toLocaleString()}m</div>
						</div>
						<div class="card-stat">
							<div class="card-stat-label">Daily Avg</div>
							<div class="card-stat-value">{user.dailyAverage.toLocaleString()}m/day</div>
						</div>
						<div class="card-stat">
							<div class="card-stat-label">Est. Completion</div>
							<div class="card-stat-value">
								{#if user.estimatedCompletion}
									{new Date(user.estimatedCompletion).toLocaleDateString()}
								{:else}
									—
								{/if}
							</div>
						</div>
					</div>
				</a>
			{/each}
		</div>
	</div>
</div>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 1rem;
	}
	
	h1 {
		text-align: center;
		font-size: 2rem;
		margin-bottom: 0.5rem;
		color: #002868;
		font-weight: 700;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
	}
	
	.subtitle {
		text-align: center;
		font-size: 1rem;
		color: #B22234;
		margin-bottom: 1.5rem;
		font-weight: 500;
	}
	
	@media (min-width: 768px) {
		.container {
			padding: 2rem;
		}
		
		h1 {
			font-size: 3rem;
		}
		
		.subtitle {
			font-size: 1.25rem;
		}
	}
	
	.leaderboard {
		background: white;
		border-radius: 0.5rem;
		box-shadow: 0 4px 12px rgba(0, 40, 104, 0.2);
		padding: 1rem;
		border: 2px solid #002868;
	}
	
	.leaderboard h2 {
		font-size: 1.5rem;
		margin-bottom: 1rem;
		color: #002868;
		text-align: center;
		font-weight: 700;
	}
	
	.table-container {
		display: none;
		overflow-x: auto;
	}
	
	.card-container {
		display: block;
	}
	
	.leaderboard-card {
		display: block;
		background: #f9f9f9;
		border: 1px solid #e0e8f5;
		border-radius: 0.5rem;
		padding: 1rem;
		margin-bottom: 1rem;
		text-decoration: none;
		color: inherit;
		transition: all 0.2s ease;
		cursor: pointer;
	}
	
	.leaderboard-card:hover {
		background: #e0e8f5;
		border-color: #002868;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 40, 104, 0.2);
	}
	
	.card-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}
	
	.card-rank {
		font-size: 1.5rem;
		font-weight: 700;
		color: #002868;
		min-width: 2.5rem;
		text-align: center;
	}
	
	.card-name-sport {
		flex: 1;
	}
	
	.card-name {
		font-size: 1.125rem;
		font-weight: 600;
		color: #002868;
		margin-bottom: 0.25rem;
	}
	
	.card-sport {
		font-size: 0.875rem;
		color: #B22234;
	}
	
	.card-progress {
		margin-bottom: 1rem;
	}
	
	.card-progress-label {
		font-size: 0.875rem;
		color: #666;
		margin-bottom: 0.5rem;
		font-weight: 500;
	}
	
	.card-stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}
	
	.card-stat {
		text-align: center;
	}
	
	.card-stat-label {
		font-size: 0.75rem;
		color: #666;
		margin-bottom: 0.25rem;
	}
	
	.card-stat-value {
		font-size: 0.875rem;
		font-weight: 600;
		color: #002868;
	}
	
	table {
		width: 100%;
		border-collapse: collapse;
	}
	
	@media (min-width: 768px) {
		.leaderboard {
			padding: 2rem;
		}
		
		.leaderboard h2 {
			font-size: 2rem;
			margin-bottom: 1.5rem;
		}
		
		.table-container {
			display: block;
		}
		
		.card-container {
			display: none;
		}
	}
	
	thead {
		background: linear-gradient(90deg, #002868 0%, #1a4a8a 100%);
	}
	
	th {
		padding: 1rem;
		text-align: left;
		font-weight: 600;
		color: #ffffff;
		border-bottom: 2px solid #B22234;
	}
	
	td {
		padding: 1rem;
		border-bottom: 1px solid #e0e8f5;
	}
	
	tbody tr:hover {
		background-color: #f0f4ff;
	}
	
	.clickable-row {
		cursor: pointer;
		transition: background-color 0.2s ease;
	}
	
	.clickable-row:hover {
		background-color: #e0e8f5 !important;
		transform: scale(1.01);
		box-shadow: 0 2px 8px rgba(0, 40, 104, 0.15);
	}
	
	.rank {
		font-weight: 600;
		color: #002868;
		text-align: center;
	}
	
	.name {
		font-weight: 500;
	}
	
	.progress {
		min-width: 200px;
	}
	
	.progress-bar {
		position: relative;
		width: 100%;
		height: 24px;
		background-color: #e0e8f5;
		border-radius: 12px;
		overflow: hidden;
		border: 1px solid #002868;
	}
	
	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #B22234 0%, #ff4444 100%);
		transition: width 0.3s ease;
	}
	
	.progress-text {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 0.75rem;
		font-weight: 600;
		color: #333;
		z-index: 1;
	}
	
	.meters {
		font-weight: 500;
	}
	
	.avg {
		color: #666;
	}
	
	.completion {
		color: #666;
	}
	
	/* Dark mode styles */
	:global([data-theme='dark']) .leaderboard {
		background: #1e2749;
		border-color: #4a5d8a;
	}
	
	:global([data-theme='dark']) h1 {
		color: #e0e8f5;
	}
	
	:global([data-theme='dark']) .subtitle {
		color: #ff6b6b;
	}
	
	:global([data-theme='dark']) .leaderboard h2 {
		color: #e0e8f5;
	}
	
	:global([data-theme='dark']) td {
		border-bottom-color: #2a3a5a;
		color: #e0e8f5;
	}
	
	:global([data-theme='dark']) tbody tr:hover {
		background-color: #2a3a5a;
	}
	
	:global([data-theme='dark']) .rank {
		color: #a0b4d0;
	}
	
	:global([data-theme='dark']) .progress-bar {
		background-color: #2a3a5a;
		border-color: #4a5d8a;
	}
	
	:global([data-theme='dark']) .progress-text {
		color: #ffffff;
	}
	
	:global([data-theme='dark']) .avg,
	:global([data-theme='dark']) .completion {
		color: #a0b4d0;
	}
	
	/* Dark mode card styles */
	:global([data-theme='dark']) .leaderboard-card {
		background: #2a3a5a;
		border-color: #4a5d8a;
	}
	
	:global([data-theme='dark']) .card-rank {
		color: #e0e8f5;
	}
	
	:global([data-theme='dark']) .card-name {
		color: #e0e8f5;
	}
	
	:global([data-theme='dark']) .card-sport {
		color: #ff6b6b;
	}
	
	:global([data-theme='dark']) .card-progress-label {
		color: #a0b4d0;
	}
	
	:global([data-theme='dark']) .card-stat-label {
		color: #a0b4d0;
	}
	
	:global([data-theme='dark']) .card-stat-value {
		color: #e0e8f5;
	}
	
	:global([data-theme='dark']) .clickable-row:hover {
		background-color: #2a3a5a !important;
	}
	
	:global([data-theme='dark']) .leaderboard-card:hover {
		background: #2a3a5a;
		border-color: #4a5d8a;
	}
</style>
