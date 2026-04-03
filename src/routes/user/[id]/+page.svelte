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
	
	// Calculate monthly totals for the selected year
	const monthlyData = $derived.by(() => {
		const months = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, meters: 0 }));
		
		if (data.entries) {
			data.entries.forEach(entry => {
				// Split "2026-01-01" into [2026, 01, 01]
				const [year, month, day] = entry.entry_date.split('-').map(Number);
				// month is already 1-indexed from the string, so just use it
				if (year === data.selectedYear) {
					months[month - 1].meters += entry.meters;
				}
			});
		}
		
		return months;
	});

	// Calculate max value for scaling (dynamic per user/year)
	const maxMeters = $derived(Math.max(...monthlyData.map((m: { month: number; meters: number }) => m.meters), 1));
	
	// Function to round up to a nice number
	function roundUpToNiceNumber(value: number): number {
		if (value === 0) return 0;
		const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
		const normalized = value / magnitude;
		let nice;
		if (normalized <= 1) nice = 1;
		else if (normalized <= 2) nice = 2;
		else if (normalized <= 5) nice = 5;
		else nice = 10;
		return nice * magnitude;
	}
	
	// Function to format number with "k" suffix (rounded to nearest thousand)
	function formatWithK(value: number): string {
		if (value === 0) return '0';
		const rounded = Math.round(value / 1000);
		return `${rounded}k`;
	}
	
	// Calculate y-axis tick values with nice round numbers
	const yAxisData = $derived.by(() => {
		if (maxMeters === 0) return { ticks: [0], niceMax: 0 };
		
		// Round up the max to a nice number
		const niceMax = roundUpToNiceNumber(maxMeters);
		
		// Determine a nice interval (try to get 4-5 ticks)
		let interval = niceMax / 4;
		const magnitude = Math.pow(10, Math.floor(Math.log10(interval)));
		const normalized = interval / magnitude;
		let niceInterval;
		if (normalized <= 1) niceInterval = 1 * magnitude;
		else if (normalized <= 2) niceInterval = 2 * magnitude;
		else if (normalized <= 5) niceInterval = 5 * magnitude;
		else niceInterval = 10 * magnitude;
		
		// Generate ticks
		const ticks = [];
		for (let value = 0; value <= niceMax; value += niceInterval) {
			ticks.push(Math.round(value));
		}
		
		// Ensure we have at least the max value
		if (ticks[ticks.length - 1] < niceMax) {
			ticks.push(Math.round(niceMax));
		}
		
		return { ticks, niceMax };
	});
	
	const yAxisTicks = $derived(yAxisData.ticks);
	const niceMax = $derived(yAxisData.niceMax);
	
	// Month names
	const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	// Calculate weekly totals for the selected year
	const weeklyData = $derived.by(() => {
		const weeks = Array.from({ length: 52 }, (_, i) => ({ week: i + 1, meters: 0 }));
		if (data.entries) {
			data.entries.forEach(entry => {
				const [year, month, day] = entry.entry_date.split('-').map(Number);
				if (year === data.selectedYear) {
					// Get day of year to calculate the 1-52 week index
					const date = new Date(year, month - 1, day);
					const start = new Date(year, 0, 0);
					const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
					const oneDay = 1000 * 60 * 60 * 24;
					const dayOfYear = Math.floor(diff / oneDay);
					
					let week = Math.ceil(dayOfYear / 7);
					if (week > 52) week = 52; // Handle the 365th/366th day
					
					weeks[week - 1].meters += entry.meters;
				}
			});
		}
		return weeks;
	});

	// Calculate max value for scaling (dynamic per user/year)
	const maxWeeklyMeters = $derived(Math.max(...weeklyData.map((m: { week: number; meters: number }) => m.meters), 1));
	// Calculate y-axis tick values with nice round numbers
	const yAxisDataWeekly = $derived.by(() => {
		// maxWeeklyMeters is guaranteed to be at least 1 due to your Math.max(..., 1)
		const niceWeeklyMax = roundUpToNiceNumber(maxWeeklyMeters);
		
		let interval = niceWeeklyMax / 4;
		const magnitude = Math.pow(10, Math.floor(Math.log10(interval)));
		const normalized = interval / magnitude;
		let niceInterval;
		
		if (normalized <= 1) niceInterval = 1 * magnitude;
		else if (normalized <= 2) niceInterval = 2 * magnitude;
		else if (normalized <= 5) niceInterval = 5 * magnitude;
		else niceInterval = 10 * magnitude;
		
		const ticks: number[] = [];
		for (let value = 0; value <= niceWeeklyMax; value += niceInterval) {
			ticks.push(Math.round(value));
		}
		
		if (ticks[ticks.length - 1] < niceWeeklyMax) {
			ticks.push(Math.round(niceWeeklyMax));
		}
		
		return { ticks, niceWeeklyMax };
	});
	
	const yAxisTicksWeekly = $derived(yAxisDataWeekly.ticks);
	const niceMaxWeekly = $derived(yAxisDataWeekly.niceWeeklyMax);
	// Week names
	const weekNames = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12', 'W13', 'W14', 'W15', 'W16', 'W17', 'W18', 'W19', 'W20', 'W21', 'W22', 'W23', 'W24', 'W25', 'W26', 'W27', 'W28', 'W29', 'W30', 'W31', 'W32', 'W33', 'W34', 'W35', 'W36', 'W37', 'W38', 'W39', 'W40', 'W41', 'W42', 'W43', 'W44', 'W45', 'W46', 'W47', 'W48', 'W49', 'W50', 'W51', 'W52'];
	// Calculate weekly and monthly averages only for completed weeks and months
    // Get current calendar boundaries
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    // Calculate current week using your exact date logic
    const startOfCurrentYear = new Date(currentYear, 0, 0);
    const timeDiff = (currentDate.getTime() - startOfCurrentYear.getTime()) + ((startOfCurrentYear.getTimezoneOffset() - currentDate.getTimezoneOffset()) * 60 * 1000);
    const currentDayOfYear = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const currentWeek = Math.min(Math.ceil(currentDayOfYear / 7), 52);

    const monthlyStats = $derived.by(() => {
        if (data.selectedYear < currentYear) {
            // Past years: sum everything, divide by 12
            const total = monthlyData.reduce((acc, curr) => acc + curr.meters, 0);
            return { avg: Math.round(total / 12), count: 12 };
        } else if (data.selectedYear === currentYear) {
            // Current year: sum only fully completed months
            const count = Math.max(1, currentMonth - 1); // Math.max prevents dividing by 0 in January
            
            if (currentMonth === 1) {
                // If it's January, just return January's current average so it doesn't break
                return { avg: monthlyData[0].meters, count: 1 };
            }
            
            const total = monthlyData
                .filter(m => m.month < currentMonth)
                .reduce((acc, curr) => acc + curr.meters, 0);
                
            return { avg: Math.round(total / count), count };
        }
        return { avg: 0, count: 0 };
    });

    const weeklyStats = $derived.by(() => {
        if (data.selectedYear < currentYear) {
            // Past years: sum everything, divide by 52
            const total = weeklyData.reduce((acc, curr) => acc + curr.meters, 0);
            return { avg: Math.round(total / 52), count: 52 };
        } else if (data.selectedYear === currentYear) {
            // Current year: sum only fully completed weeks
            const count = Math.max(1, currentWeek - 1); 
            
            if (currentWeek === 1) {
                return { avg: weeklyData[0].meters, count: 1 };
            }
            
            const total = weeklyData
                .filter(w => w.week < currentWeek)
                .reduce((acc, curr) => acc + curr.meters, 0);
                
            return { avg: Math.round(total / count), count };
        }
        return { avg: 0, count: 0 };
    });

    const completedWeeks = $derived(weeklyStats.count);
    const completedMonths = $derived(monthlyStats.count);
    const weeklyAverage = $derived(weeklyStats.avg);
    const monthlyAverage = $derived(monthlyStats.avg);
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
				<div class="stat-label">Estimated Completion</div>
				<div class="stat-value">
					{#if data.estimatedCompletion}
						{new Date(data.estimatedCompletion).toLocaleDateString()}
					{:else}
						—
					{/if}
				</div>
			</div>

			<div class="stat-card">
				<div class="stat-label">Daily Average</div>
				<div class="stat-value">{data.dailyAverage.toLocaleString()}m/day</div>
			</div>
			<div class="stat-card">
				<div class="stat-label">Weekly Average</div>
				<div class="stat-label">Completed Weeks</div>
				<div class="stat-value">{completedWeeks > 0 ? (weeklyAverage.toLocaleString()) : '—'}m/week</div>
			</div>
			<div class="stat-card">
				<div class="stat-label">Monthly Average</div>
				<div class="stat-label">Completed Months</div>
				<div class="stat-value">{completedMonths > 0 ? (monthlyAverage.toLocaleString()) : '—'}m/month</div>
			</div>
		</div>
		
		
		
		<div class="chart-section">
			<h2>Monthly Progress for {data.selectedYear}</h2>
			<div class="chart-container">
				<div class="chart-wrapper">
					<div class="y-axis">
						{#each yAxisTicks.slice().reverse() as tick, i}
							{@const position = ((yAxisTicks.length - 1 - i) / (yAxisTicks.length - 1)) * 100}
							<div class="y-axis-tick" style="bottom: {position}%">
								<span class="y-axis-label">{formatWithK(tick)}</span>
							</div>
						{/each}
					</div>
					<div class="chart">
						{#each monthlyData as monthData, index}
							{@const height = niceMax > 0 ? (monthData.meters / niceMax) * 100 : 0}
							<div class="bar-wrapper">
								<div 
									class="bar" 
									style="height: {height}%"
									title="{monthNames[index]}: {monthData.meters.toLocaleString()}m"
								>
									<div class="bar-value" style="opacity: {monthData.meters > 0 ? 1 : 0}">
										{monthData.meters > 0 ? formatWithK(monthData.meters) : ''}
									</div>
								</div>
								<div class="bar-label">{monthNames[index]}</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<div class="chart-section">
			<h2>Weekly Progress for {data.selectedYear}</h2>
			<div class="chart-container">
				<div class="chart-wrapper">
					<div class="y-axis">
						{#each yAxisTicksWeekly.slice().reverse() as tick, i}
							{@const position = ((yAxisTicksWeekly.length - 1 - i) / (yAxisTicksWeekly.length - 1)) * 100}
							<div class="y-axis-tick" style="bottom: {position}%">
								<span class="y-axis-label">{formatWithK(tick)}</span>
							</div>
						{/each}
					</div>
					<div class="chart">
						{#each weeklyData as weekData, index}
							{@const height = niceMaxWeekly > 0 ? (weekData.meters / niceMaxWeekly) * 100 : 0}
							<div class="bar-wrapper">
								<div 
									class="bar" 
									style="height: {height}%"
									title="{weekNames[index]}: {weekData.meters.toLocaleString()}m"
								>
									<div class="bar-value" style="opacity: {weekData.meters > 0 ? 1 : 0}">
										{weekData.meters > 0 ? formatWithK(weekData.meters) : ''}
									</div>
								</div>
								<div class="bar-label">{weekNames[index]}</div>
							</div>
						{/each}
					</div>
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
								<th>Week</th>
								<th>Time (ET)</th>
								<th>Meters</th>
							</tr>
						</thead>
						<tbody>
							{#each data.entries as entry}
								{@const displayTime = entry.entry_timestamp ? formatEasternDateTime(entry.entry_timestamp) : { date: entry.entry_date, time: entry.entry_time || '—' }}
								{@const dateParts = displayTime.date.split('-')}
								{@const [year, month, day] = entry.entry_date.split('-').map(Number)}
								{@const date = new Date(year, month - 1, day)}
								{@const start = new Date(year, 0, 0)}
								{@const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000)}
								{@const oneDay = 1000 * 60 * 60 * 24}
								{@const dayOfYear = Math.floor(diff / oneDay)}
								{@const week = Math.ceil(dayOfYear / 7)}
								<tr>
									<td>{dateParts[1]}/{dateParts[2]}/{dateParts[0]}</td>
									<td>{weekNames[week - 1]}</td>
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
						{@const [year, month, day] = entry.entry_date.split('-').map(Number)}
						{@const date = new Date(year, month - 1, day)}
						{@const start = new Date(year, 0, 0)}
						{@const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000)}
						{@const oneDay = 1000 * 60 * 60 * 24}
						{@const dayOfYear = Math.floor(diff / oneDay)}
						{@const week = Math.ceil(dayOfYear / 7)}
						<div class="entry-card">
							<div class="entry-card-header">
								<div class="entry-date-time">
									<div class="entry-date">{dateParts[1]}/{dateParts[2]}/{dateParts[0]}</div>
									<div class="entry-time">{displayTime.time} {weekNames[week - 1]}</div>
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
	
	.chart-section {
		background: white;
		padding: 1.5rem;
		border-radius: 0.5rem;
		box-shadow: 0 4px 12px rgba(0, 40, 104, 0.2);
		margin-bottom: 1.5rem;
		border: 2px solid #002868;
	}
	
	.chart-container {
		overflow-x: auto;
		overflow-y: visible;
		padding: 1rem 0;
	}
	
	.chart-wrapper {
		display: flex;
		gap: 0;
		align-items: flex-end;
		overflow: visible;
		min-height: 300px;
	}
	
	.y-axis {
		position: relative;
		height: 300px;
		padding-bottom: 2rem;
		flex-shrink: 0;
		width: 1.5rem;
	}
	
	.y-axis-tick {
		position: absolute;
		display: flex;
		align-items: center;
		transform: translateY(50%);
	}
	
	.y-axis-tick::after {
		content: '';
		position: absolute;
		left: 100%;
		width: 0.5rem;
		height: 1px;
		background-color: #e0e8f5;
		margin-left: 0.5rem;
	}
	
	.y-axis-label {
		font-size: 0.75rem;
		color: #002868;
		font-weight: 500;
		white-space: nowrap;
	}
	
	.chart {
		flex: 1;
		display: flex;
		align-items: flex-end;
		justify-content: space-around;
		gap: 0.25rem;
		height: 300px;
		padding: 0 0.25rem;
		position: relative;
		overflow: visible;
	}
	
	.bar-wrapper {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-end;
		height: 300px;
		min-width: 0;
		max-width: 2.5rem;
		position: relative;
		overflow: visible;
	}
	
	.bar {
		width: 100%;
		min-height: 4px;
		background: linear-gradient(180deg, #B22234 0%, #ff4444 100%);
		border-radius: 4px 4px 0 0;
		transition: all 0.3s ease;
		cursor: pointer;
		position: relative;
		border: 1px solid #002868;
		border-bottom: none;
	}
	
	.bar-value {
		position: absolute;
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		margin-bottom: 0.25rem;
		font-size: 0.625rem;
		font-weight: 600;
		color: #002868;
		white-space: nowrap;
		pointer-events: none;
		text-align: center;
		line-height: 1.2;
	}
	
	.bar:hover {
		opacity: 0.8;
		transform: scaleY(1.05);
		transform-origin: bottom;
	}
	
	.bar-label {
		margin-top: 0.5rem;
		font-size: 0.75rem;
		font-weight: 600;
		color: #002868;
		text-align: center;
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
		
		.chart-section {
			padding: 2rem;
			margin-bottom: 2rem;
		}
		
		.chart-wrapper {
			gap: 0;
			min-height: 350px;
		}
		
		.y-axis {
			height: 350px;
		}
		
		.y-axis-label {
			font-size: 0.875rem;
		}
		
		.chart {
			height: 350px;
			gap: 0.5rem;
			padding: 0 0.5rem;
		}
		
		.bar-wrapper {
			height: 350px;
			min-width: 0;
			max-width: 3rem;
		}
		
		.bar-value {
			font-size: 0.75rem;
		}
		
		.bar-label {
			font-size: 0.875rem;
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
	
	:global([data-theme='dark']) .chart-section {
		background: #1e2749;
		border-color: #4a5d8a;
	}
	
	:global([data-theme='dark']) .bar-value {
		color: #e0e8f5;
	}
	
	:global([data-theme='dark']) .bar {
		border-color: #4a5d8a;
	}
	
	:global([data-theme='dark']) .bar-label {
		color: #e0e8f5;
	}
	
	:global([data-theme='dark']) .y-axis-tick::after {
		background-color: #2a3a5a;
	}
	
	:global([data-theme='dark']) .y-axis-label {
		color: #e0e8f5;
	}
</style>

