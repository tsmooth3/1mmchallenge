<script lang="ts">
	import type { PageData } from './$types';
	import { formatEasternDateTime } from '$lib/timezone';
	import { goto } from '$app/navigation';
	
	let { data }: { data: PageData } = $props();
	
	function handleYearChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		const year = target.value;
		goto(`/user/${data.user?.id}?year=${year}`);
	}
</script>

<div class="container">
	{#if !data.user}
		<h1>User Not Found</h1>
		<p>The user you're looking for doesn't exist.</p>
		<a href="/" class="btn btn-secondary">Back to Leaderboard</a>
	{:else}
		<h1>{data.user.name}</h1>
		<p class="sport">Sport: {data.user.sport}</p>
		
		<div class="year-selector">
			<label for="year-select">View Year:</label>
			<select id="year-select" value={data.selectedYear} onchange={handleYearChange}>
				{#each data.availableYears as year}
					<option value={year} selected={year === data.selectedYear}>{year}</option>
				{/each}
			</select>
		</div>
		
		<div class="stats">
			<div class="stat-card">
				<div class="stat-label">Total Progress</div>
				<div class="stat-value">{data.totalMeters.toLocaleString()}m</div>
				<div class="progress-bar-large">
					<div class="progress-fill-large" style="width: {data.percentage}%"></div>
					<span class="progress-text-large">{data.percentage.toFixed(1)}%</span>
				</div>
			</div>
			
			<div class="stat-card">
				<div class="stat-label">Daily Average</div>
				<div class="stat-value">{data.dailyAverage.toLocaleString()}m/day</div>
			</div>
			
			<div class="stat-card">
				<div class="stat-label">Estimated Completion</div>
				<div class="stat-value">
					{#if data.estimatedCompletion}
						{new Date(data.estimatedCompletion).toLocaleDateString()}
					{:else}
						—
					{/if}
				</div>
			</div>
		</div>
		
		<div class="entries-section">
			<h2>Entries for {data.selectedYear}</h2>
			{#if data.entries.length > 0}
				<!-- Desktop table view -->
				<div class="table-container">
					<table>
						<thead>
							<tr>
								<th>Date</th>
								<th>Time (ET)</th>
								<th>Meters</th>
							</tr>
						</thead>
						<tbody>
							{#each data.entries as entry}
								{@const displayTime = entry.entry_timestamp ? formatEasternDateTime(entry.entry_timestamp) : { date: entry.entry_date, time: entry.entry_time || '—' }}
								{@const dateParts = displayTime.date.split('-')}
								<tr>
									<td>{dateParts[1]}/{dateParts[2]}/{dateParts[0]}</td>
									<td>{displayTime.time}</td>
									<td>{entry.meters.toLocaleString()}m</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				
				<!-- Mobile card view -->
				<div class="card-container">
					{#each data.entries as entry}
						{@const displayTime = entry.entry_timestamp ? formatEasternDateTime(entry.entry_timestamp) : { date: entry.entry_date, time: entry.entry_time || '—' }}
						{@const dateParts = displayTime.date.split('-')}
						<div class="entry-card">
							<div class="entry-card-header">
								<div class="entry-date-time">
									<div class="entry-date">{dateParts[1]}/{dateParts[2]}/{dateParts[0]}</div>
									<div class="entry-time">{displayTime.time}</div>
								</div>
								<div class="entry-meters">{entry.meters.toLocaleString()}m</div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p class="no-entries">No entries yet.</p>
			{/if}
		</div>
		
		<div class="actions">
			<a href="/" class="btn btn-secondary">Back to Leaderboard</a>
		</div>
	{/if}
</div>

<style>
	.container {
		max-width: 900px;
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
	
	.sport {
		text-align: center;
		color: #B22234;
		margin-bottom: 1rem;
		font-weight: 500;
		font-size: 0.875rem;
	}
	
	.year-selector {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}
	
	.year-selector label {
		font-weight: 500;
		color: #002868;
	}
	
	.year-selector select {
		padding: 0.5rem 1rem;
		font-size: 1rem;
		border: 2px solid #002868;
		border-radius: 0.5rem;
		background: white;
		color: #002868;
		cursor: pointer;
	}
	
	.year-selector select:focus {
		outline: none;
		box-shadow: 0 0 0 3px rgba(0, 40, 104, 0.1);
	}
	
	.stats {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}
	
	.stat-card {
		background: white;
		padding: 1.5rem;
		border-radius: 0.5rem;
		box-shadow: 0 2px 8px rgba(0, 40, 104, 0.1);
		border: 1px solid #e0e8f5;
		text-align: center;
	}
	
	.stat-label {
		font-size: 0.875rem;
		color: #B22234;
		margin-bottom: 0.5rem;
		font-weight: 500;
	}
	
	.stat-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: #002868;
		margin-bottom: 1rem;
	}
	
	.progress-bar-large {
		position: relative;
		width: 100%;
		height: 32px;
		background-color: #e0e8f5;
		border-radius: 16px;
		overflow: hidden;
		border: 1px solid #002868;
	}
	
	.progress-fill-large {
		height: 100%;
		background: linear-gradient(90deg, #B22234 0%, #ff4444 100%);
		transition: width 0.3s ease;
	}
	
	.progress-text-large {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 0.875rem;
		font-weight: 600;
		color: #333;
		z-index: 1;
	}
	
	.entries-section {
		background: white;
		padding: 1rem;
		border-radius: 0.5rem;
		box-shadow: 0 4px 12px rgba(0, 40, 104, 0.2);
		margin-bottom: 1.5rem;
		border: 2px solid #002868;
	}
	
	h2 {
		font-size: 1.25rem;
		margin-bottom: 1rem;
		color: #002868;
		font-weight: 700;
	}
	
	.table-container {
		display: none;
		overflow-x: auto;
	}
	
	.card-container {
		display: block;
	}
	
	.entry-card {
		background: #f9f9f9;
		border: 1px solid #e0e8f5;
		border-radius: 0.5rem;
		padding: 1rem;
		margin-bottom: 1rem;
	}
	
	.entry-card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.entry-date-time {
		flex: 1;
	}
	
	.entry-date {
		font-size: 1rem;
		font-weight: 600;
		color: #002868;
		margin-bottom: 0.25rem;
	}
	
	.entry-time {
		font-size: 0.875rem;
		color: #666;
	}
	
	.entry-meters {
		font-size: 1.125rem;
		font-weight: 600;
		color: #002868;
	}
	
	table {
		width: 100%;
		border-collapse: collapse;
	}
	
	thead {
		background: linear-gradient(90deg, #002868 0%, #1a4a8a 100%);
	}
	
	th {
		padding: 0.75rem;
		text-align: left;
		font-weight: 600;
		color: #ffffff;
		border-bottom: 2px solid #B22234;
	}
	
	td {
		padding: 0.75rem;
		border-bottom: 1px solid #e0e8f5;
	}
	
	tbody tr:hover {
		background-color: #f0f4ff;
	}
	
	.no-entries {
		text-align: center;
		color: #002868;
		padding: 2rem;
	}
	
	.actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}
	
	.btn {
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		border: none;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.2s;
		text-decoration: none;
		display: inline-block;
		font-weight: 600;
	}
	
	.btn-secondary {
		background: linear-gradient(135deg, #B22234 0%, #d32f2f 100%);
		color: white;
		border: 2px solid #002868;
	}
	
	.btn-secondary:hover {
		background: linear-gradient(135deg, #d32f2f 0%, #B22234 100%);
		box-shadow: 0 4px 8px rgba(178, 34, 52, 0.3);
		transform: translateY(-1px);
	}
	
	@media (min-width: 768px) {
		.container {
			padding: 2rem;
		}
		
		h1 {
			font-size: 2.5rem;
		}
		
		.sport {
			font-size: 1rem;
			margin-bottom: 2rem;
		}
		
		.stats {
			grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
			gap: 1.5rem;
			margin-bottom: 2rem;
		}
		
		.entries-section {
			padding: 2rem;
			margin-bottom: 2rem;
		}
		
		h2 {
			font-size: 1.5rem;
			margin-bottom: 1.5rem;
		}
		
		.table-container {
			display: block;
		}
		
		.card-container {
			display: none;
		}
	}
	
	/* Dark mode styles */
	:global([data-theme='dark']) h1 {
		color: #e0e8f5;
	}
	
	:global([data-theme='dark']) .sport {
		color: #ff6b6b;
	}
	
	:global([data-theme='dark']) .year-selector label {
		color: #e0e8f5;
	}
	
	:global([data-theme='dark']) .year-selector select {
		background-color: #2a3a5a;
		border-color: #4a5d8a;
		color: #e0e8f5;
	}
	
	:global([data-theme='dark']) .year-selector select:focus {
		box-shadow: 0 0 0 3px rgba(74, 93, 138, 0.3);
	}
	
	:global([data-theme='dark']) .stat-card {
		background: #1e2749;
		border-color: #4a5d8a;
	}
	
	:global([data-theme='dark']) .stat-label {
		color: #ff6b6b;
	}
	
	:global([data-theme='dark']) .stat-value {
		color: #e0e8f5;
	}
	
	:global([data-theme='dark']) .progress-bar-large {
		background-color: #2a3a5a;
		border-color: #4a5d8a;
	}
	
	:global([data-theme='dark']) .progress-text-large {
		color: #ffffff;
	}
	
	:global([data-theme='dark']) .entries-section {
		background: #1e2749;
		border-color: #4a5d8a;
	}
	
	:global([data-theme='dark']) h2 {
		color: #e0e8f5;
	}
	
	:global([data-theme='dark']) td {
		border-bottom-color: #2a3a5a;
		color: #e0e8f5;
	}
	
	:global([data-theme='dark']) tbody tr:hover {
		background-color: #2a3a5a;
	}
	
	:global([data-theme='dark']) .no-entries {
		color: #a0b4d0;
	}
	
	:global([data-theme='dark']) .entry-card {
		background: #2a3a5a;
		border-color: #4a5d8a;
	}
	
	:global([data-theme='dark']) .entry-date {
		color: #e0e8f5;
	}
	
	:global([data-theme='dark']) .entry-time {
		color: #a0b4d0;
	}
	
	:global([data-theme='dark']) .entry-meters {
		color: #e0e8f5;
	}
</style>

