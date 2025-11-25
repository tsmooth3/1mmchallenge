<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { PageData, ActionData } from './$types';
	import { formatEasternDateTime } from '$lib/timezone';
	
	let { data, form }: { data: PageData; form: ActionData } = $props();
	
	const MILES_TO_METERS = 1609.34;
	
	import { getEasternDate, getEasternTime } from '$lib/timezone';
	
	let unit = $state<'meters' | 'miles'>('meters');
	let meters = $state('');
	let miles = $state('');
	let date = $state(getEasternDate());
	let time = $state(getEasternTime());
	let success = $state(false);
	
	// Edit state
	let editingEntry = $state<number | null>(null);
	let editMeters = $state('');
	let editMiles = $state('');
	let editDate = $state('');
	let editTime = $state('');
	let editUnit = $state<'meters' | 'miles'>('meters');
	let deleteConfirm = $state<number | null>(null);
	let sport = $state(data.user?.sport || 'Other');
	
	function handleMetersInput() {
		if (meters) {
			const metersValue = parseFloat(meters);
			if (!isNaN(metersValue) && metersValue > 0) {
				miles = (metersValue / MILES_TO_METERS).toFixed(2);
			}
		} else {
			miles = '';
		}
	}
	
	function handleMilesInput() {
		if (miles) {
			const milesValue = parseFloat(miles);
			if (!isNaN(milesValue) && milesValue > 0) {
				meters = (milesValue * MILES_TO_METERS).toFixed(2);
			}
		} else {
			meters = '';
		}
	}
	
	$effect(() => {
		if (form?.success) {
			success = true;
			meters = '';
			miles = '';
			date = getEasternDate();
			time = getEasternTime();
			// Update sport if it was changed
			if (data.isFirstEntryOfYear) {
				data.user.sport = sport;
			}
			setTimeout(() => {
				success = false;
				// Reload to refresh the page state
				window.location.reload();
			}, 1500);
		}
	});
	
	function startEdit(entry: any) {
		editingEntry = entry.id;
		editMeters = entry.meters.toString();
		editMiles = (entry.meters / MILES_TO_METERS).toFixed(2);
		editUnit = 'meters';
		const displayTime = entry.entry_timestamp ? formatEasternDateTime(entry.entry_timestamp) : { date: entry.entry_date, time: entry.entry_time || '12:00' };
		editDate = displayTime.date;
		editTime = displayTime.time;
	}
	
	function cancelEdit() {
		editingEntry = null;
		editMeters = '';
		editMiles = '';
		editDate = '';
		editTime = '';
	}
	
	function handleEditMetersInput() {
		if (editMeters) {
			const metersValue = parseFloat(editMeters);
			if (!isNaN(metersValue) && metersValue > 0) {
				editMiles = (metersValue / MILES_TO_METERS).toFixed(2);
			}
		} else {
			editMiles = '';
		}
	}
	
	function handleEditMilesInput() {
		if (editMiles) {
			const milesValue = parseFloat(editMiles);
			if (!isNaN(milesValue) && milesValue > 0) {
				editMeters = (milesValue * MILES_TO_METERS).toFixed(2);
			}
		} else {
			editMeters = '';
		}
	}
	
	async function saveEdit() {
		if (!editingEntry || !editMeters || !editDate) return;
		
		try {
			const res = await fetch(`/api/entries/${editingEntry}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					meters: Math.round(parseFloat(editMeters)),
					date: editDate,
					time: editTime
				})
			});
			
			if (res.ok) {
				cancelEdit();
				// Reload the page to refresh data
				window.location.reload();
			} else {
				const data = await res.json();
				alert(data.error || 'Failed to update entry');
			}
		} catch (e) {
			alert('An error occurred. Please try again.');
		}
	}
	
	async function deleteEntry(entryId: number) {
		if (!confirm('Are you sure you want to delete this entry?')) return;
		
		try {
			const res = await fetch(`/api/entries/${entryId}`, {
				method: 'DELETE'
			});
			
			if (res.ok) {
				// Reload the page to refresh data
				window.location.reload();
			} else {
				const data = await res.json();
				alert(data.error || 'Failed to delete entry');
			}
		} catch (e) {
			alert('An error occurred. Please try again.');
		}
	}
	
</script>

<div class="container">
	<h1>Log Progress</h1>
	<p class="welcome">Welcome, {data.user.name}!</p>
	<p class="sport">Sport: {data.user.sport}</p>
	
    <div class="form-section">
		<h2>Log New Progress</h2>
		<form method="POST" use:enhance>
			<div class="form-group">
				<div class="unit-label">Unit</div>
				<div class="unit-selector">
					<label class="radio-label">
						<input
							type="radio"
							name="unit"
							value="meters"
							bind:group={unit}
						/>
						Meters
					</label>
					<label class="radio-label">
						<input
							type="radio"
							name="unit"
							value="miles"
							bind:group={unit}
						/>
						Miles
					</label>
				</div>
			</div>
			
			<div class="form-group">
				{#if unit === 'meters'}
					<label for="distance">Meters</label>
					<input
						type="number"
						id="distance"
						bind:value={meters}
						oninput={handleMetersInput}
						required
						min="1"
						step="1"
						placeholder="Enter meters"
					/>
					{#if meters}
						<div class="conversion-hint">
							≈ {parseFloat(miles || '0').toLocaleString(undefined, { maximumFractionDigits: 2 })} miles
						</div>
					{/if}
				{:else}
					<label for="distance">Miles</label>
					<input
						type="number"
						id="distance"
						bind:value={miles}
						oninput={handleMilesInput}
						required
						min="1"
						step="1"
						placeholder="Enter miles"
					/>
					{#if miles}
						<div class="conversion-hint">
							≈ {parseFloat(meters || '0').toLocaleString(undefined, { maximumFractionDigits: 0 })} meters
						</div>
					{/if}
				{/if}
				<!-- Hidden input to always submit meters -->
				<input type="hidden" name="meters" value={meters} />
			</div>
			
			<div class="form-group">
				<label for="date">Date</label>
				<input
					type="date"
					id="date"
					name="date"
					bind:value={date}
					required
				/>
			</div>
			
			<div class="form-group">
				<label for="time">Time (Eastern Time)</label>
				<input
					type="time"
					id="time"
					name="time"
					bind:value={time}
					required
				/>
			</div>
			
			{#if data.isFirstEntryOfYear}
				<div class="form-group sport-change-notice">
					<div class="sport-notice">
						🎉 This is your first entry for {new Date().getFullYear()}! You can change your sport for this year.
					</div>
					<label for="sport">Sport</label>
					<select id="sport" name="sport" bind:value={sport}>
						<option value="Cycling">Cycling</option>
						<option value="Rowing">Rowing</option>
						<option value="Rucking">Rucking</option>
						<option value="Running">Running</option>
						<option value="Skiing">Skiing</option>
						<option value="Swimming">Swimming</option>
						<option value="Other">Other</option>
					</select>
				</div>
			{/if}
			
			{#if form?.error}
				<div class="error">{form.error}</div>
			{/if}
			
			{#if success}
				<div class="success">Progress logged successfully!</div>
			{/if}
			
			<button type="submit" class="btn btn-primary">Log Progress</button>
		</form>
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
	
	
	
	<div class="recent-section">
		<h2>Recent Entries</h2>
		{#if data.entries.length > 0}
			<!-- Desktop table view -->
			<div class="table-container">
				<table>
					<thead>
						<tr>
							<th>Date</th>
							<th>Time (ET)</th>
							<th>Meters</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each data.entries as entry}
							{@const displayTime = entry.entry_timestamp ? formatEasternDateTime(entry.entry_timestamp) : { date: entry.entry_date, time: entry.entry_time || '—' }}
							{@const dateParts = displayTime.date.split('-')}
							{#if editingEntry === entry.id}
								<tr class="editing-row">
									<td colspan="4">
										<div class="edit-form">
											<h3>Edit Entry</h3>
											<div class="edit-form-grid">
												<div class="form-group">
													<div class="unit-label">Unit</div>
													<div class="unit-selector">
														<label class="radio-label">
															<input
																type="radio"
																name="edit-unit"
																value="meters"
																bind:group={editUnit}
															/>
															Meters
														</label>
														<label class="radio-label">
															<input
																type="radio"
																name="edit-unit"
																value="miles"
																bind:group={editUnit}
															/>
															Miles
														</label>
													</div>
												</div>
												
												<div class="form-group">
													{#if editUnit === 'meters'}
														<label for="edit-meters">Meters</label>
														<input
															type="number"
															id="edit-meters"
															bind:value={editMeters}
															oninput={handleEditMetersInput}
															required
															min="1"
															step="1"
														/>
														{#if editMeters}
															<div class="conversion-hint">
																≈ {parseFloat(editMiles || '0').toLocaleString(undefined, { maximumFractionDigits: 2 })} miles
															</div>
														{/if}
													{:else}
														<label for="edit-miles">Miles</label>
														<input
															type="number"
															id="edit-miles"
															bind:value={editMiles}
															oninput={handleEditMilesInput}
															required
															min="1"
															step="1"
														/>
														{#if editMiles}
															<div class="conversion-hint">
																≈ {parseFloat(editMeters || '0').toLocaleString(undefined, { maximumFractionDigits: 0 })} meters
															</div>
														{/if}
													{/if}
												</div>
												
												<div class="form-group">
													<label for="edit-date">Date</label>
													<input
														type="date"
														id="edit-date"
														bind:value={editDate}
														required
													/>
												</div>
												
												<div class="form-group">
													<label for="edit-time">Time (Eastern Time)</label>
													<input
														type="time"
														id="edit-time"
														bind:value={editTime}
														required
													/>
												</div>
											</div>
											<div class="edit-actions">
												<button onclick={saveEdit} class="btn btn-primary">Save</button>
												<button onclick={cancelEdit} class="btn btn-secondary">Cancel</button>
											</div>
										</div>
									</td>
								</tr>
							{:else}
								<tr>
									<td>{dateParts[1]}/{dateParts[2]}/{dateParts[0]}</td>
									<td>{displayTime.time}</td>
									<td>{entry.meters.toLocaleString()}m</td>
									<td class="actions-cell">
										<button onclick={() => startEdit(entry)} class="btn-edit">Edit</button>
										<button onclick={() => deleteEntry(entry.id)} class="btn-delete">Delete</button>
									</td>
								</tr>
							{/if}
						{/each}
					</tbody>
				</table>
			</div>
			
			<!-- Mobile card view -->
			<div class="card-container">
				{#each data.entries as entry}
					{@const displayTime = entry.entry_timestamp ? formatEasternDateTime(entry.entry_timestamp) : { date: entry.entry_date, time: entry.entry_time || '—' }}
					{@const dateParts = displayTime.date.split('-')}
					{#if editingEntry === entry.id}
						<div class="entry-card editing">
							<div class="edit-form">
								<h3>Edit Entry</h3>
								<div class="edit-form-grid">
									<div class="form-group">
										<div class="unit-label">Unit</div>
										<div class="unit-selector">
											<label class="radio-label">
												<input
													type="radio"
													name="edit-unit-mobile-{entry.id}"
													value="meters"
													bind:group={editUnit}
												/>
												Meters
											</label>
											<label class="radio-label">
												<input
													type="radio"
													name="edit-unit-mobile-{entry.id}"
													value="miles"
													bind:group={editUnit}
												/>
												Miles
											</label>
										</div>
									</div>
									
									<div class="form-group">
										{#if editUnit === 'meters'}
											<label for="edit-meters-mobile-{entry.id}">Meters</label>
											<input
												type="number"
												id="edit-meters-mobile-{entry.id}"
												bind:value={editMeters}
												oninput={handleEditMetersInput}
												required
												min="1"
												step="1"
											/>
											{#if editMeters}
												<div class="conversion-hint">
													≈ {parseFloat(editMiles || '0').toLocaleString(undefined, { maximumFractionDigits: 2 })} miles
												</div>
											{/if}
										{:else}
											<label for="edit-miles-mobile-{entry.id}">Miles</label>
											<input
												type="number"
												id="edit-miles-mobile-{entry.id}"
												bind:value={editMiles}
												oninput={handleEditMilesInput}
												required
												min="1"
												step="1"
											/>
											{#if editMiles}
												<div class="conversion-hint">
													≈ {parseFloat(editMeters || '0').toLocaleString(undefined, { maximumFractionDigits: 0 })} meters
												</div>
											{/if}
										{/if}
									</div>
									
									<div class="form-group">
										<label for="edit-date-mobile-{entry.id}">Date</label>
										<input
											type="date"
											id="edit-date-mobile-{entry.id}"
											bind:value={editDate}
											required
										/>
									</div>
									
									<div class="form-group">
										<label for="edit-time-mobile-{entry.id}">Time (Eastern Time)</label>
										<input
											type="time"
											id="edit-time-mobile-{entry.id}"
											bind:value={editTime}
											required
										/>
									</div>
								</div>
								<div class="edit-actions">
									<button onclick={saveEdit} class="btn btn-primary">Save</button>
									<button onclick={cancelEdit} class="btn btn-secondary">Cancel</button>
								</div>
							</div>
						</div>
					{:else}
						<div class="entry-card">
							<div class="entry-card-header">
								<div class="entry-date-time">
									<div class="entry-date">{dateParts[1]}/{dateParts[2]}/{dateParts[0]}</div>
									<div class="entry-time">{displayTime.time}</div>
								</div>
								<div class="entry-meters">{entry.meters.toLocaleString()}m</div>
							</div>
							<div class="entry-actions">
								<button onclick={() => startEdit(entry)} class="btn-edit">Edit</button>
								<button onclick={() => deleteEntry(entry.id)} class="btn-delete">Delete</button>
							</div>
						</div>
					{/if}
				{/each}
			</div>
		{:else}
			<p class="no-entries">No entries yet. Start logging your progress!</p>
		{/if}
	</div>
	
	<div class="actions">
		<a href="/" class="btn btn-secondary">Home</a>
	</div>
</div>

<style>
	.container {
		max-width: 900px;
		margin: 0 auto;
		padding: 1rem;
	}
	
	h1 {
		text-align: center;
		font-size: 1.75rem;
		margin-bottom: 0.5rem;
		color: #002868;
		font-weight: 700;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
	}
	
	.welcome {
		text-align: center;
		font-size: 1rem;
		color: #002868;
		margin-bottom: 0.25rem;
		font-weight: 500;
	}
	
	.sport {
		text-align: center;
		color: #B22234;
		margin-bottom: 1.5rem;
		font-weight: 500;
		font-size: 0.875rem;
	}
	
	.stats {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}
	
	@media (min-width: 768px) {
		.container {
			padding: 2rem;
		}
		
		h1 {
			font-size: 2.5rem;
		}
		
		.welcome {
			font-size: 1.25rem;
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
	}
	
	.stat-card {
		background: white;
		padding: 1.5rem;
		border-radius: 0.5rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}
	
	.stat-label {
		font-size: 0.875rem;
		color: #B22234;
		margin-bottom: 0.5rem;
		font-weight: 500;
	}
	
	.stat-value {
		font-size: 1.5rem;
		font-weight: 600;
		color: #002868;
		margin-bottom: 1rem;
	}
	
	.progress-bar-large {
		position: relative;
		width: 100%;
		height: 32px;
		background-color: #e0e0e0;
		border-radius: 16px;
		overflow: hidden;
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
		color: #ffffff;
		z-index: 1;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
	}
	
	.form-section,
	.recent-section {
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
	
	@media (min-width: 768px) {
		.form-section,
		.recent-section {
			padding: 2rem;
			margin-bottom: 2rem;
		}
		
		h2 {
			font-size: 1.5rem;
			margin-bottom: 1.5rem;
		}
	}
	
	.form-group {
		margin-bottom: 1.5rem;
	}
	
	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: #002868;
	}
	
	input {
		width: 100%;
		padding: 0.75rem;
		font-size: 1rem;
		border: 1px solid #ddd;
		border-radius: 0.5rem;
		box-sizing: border-box;
	}
	
	input:focus {
		outline: none;
		border-color: #002868;
		box-shadow: 0 0 0 3px rgba(0, 40, 104, 0.1);
	}
	
	select {
		width: 100%;
		padding: 0.75rem;
		font-size: 1rem;
		border: 1px solid #ddd;
		border-radius: 0.5rem;
		box-sizing: border-box;
		background: white;
		color: #002868;
	}
	
	select:focus {
		outline: none;
		border-color: #002868;
		box-shadow: 0 0 0 3px rgba(0, 40, 104, 0.1);
	}
	
	.sport-change-notice {
		background: #fff3cd;
		border: 2px solid #ffc107;
		border-radius: 0.5rem;
		padding: 1rem;
		margin-bottom: 1.5rem;
	}
	
	.sport-notice {
		background: #ffc107;
		color: #856404;
		padding: 0.75rem;
		border-radius: 0.5rem;
		margin-bottom: 1rem;
		font-weight: 600;
		text-align: center;
	}
	
	.unit-label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: #002868;
	}
	
	.unit-selector {
		display: flex;
		gap: 1rem;
	}
	
	.radio-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		font-weight: normal;
	}
	
	.radio-label input[type="radio"] {
		width: auto;
		margin: 0;
		cursor: pointer;
	}
	
	.conversion-hint {
		margin-top: 0.5rem;
		font-size: 0.875rem;
		color: #002868;
		font-style: italic;
	}
	
	.error {
		background-color: #ffebee;
		color: #c62828;
		padding: 0.75rem;
		border-radius: 0.5rem;
		margin-bottom: 1rem;
	}
	
	.success {
		background-color: #e8f5e9;
		color: #2e7d32;
		padding: 0.75rem;
		border-radius: 0.5rem;
		margin-bottom: 1rem;
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
	}
	
	.btn-primary {
		background: linear-gradient(135deg, #002868 0%, #1a4a8a 100%);
		color: white;
		width: 100%;
		border: 2px solid #B22234;
		font-weight: 600;
	}
	
	.btn-primary:hover {
		background: linear-gradient(135deg, #1a4a8a 0%, #002868 100%);
		box-shadow: 0 4px 8px rgba(0, 40, 104, 0.3);
		transform: translateY(-1px);
	}
	
	.btn-secondary {
		background: linear-gradient(135deg, #B22234 0%, #d32f2f 100%);
		color: white;
		border: 2px solid #002868;
		font-weight: 600;
	}
	
	.btn-secondary:hover {
		background: linear-gradient(135deg, #d32f2f 0%, #B22234 100%);
		box-shadow: 0 4px 8px rgba(178, 34, 52, 0.3);
		transform: translateY(-1px);
	}
	
	table {
		width: 100%;
		border-collapse: collapse;
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
		margin-bottom: 0.75rem;
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
	
	.entry-actions {
		display: flex;
		gap: 0.5rem;
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
	
	.actions-cell {
		display: flex;
		gap: 0.5rem;
	}
	
	@media (min-width: 768px) {
		.table-container {
			display: block;
		}
		
		.card-container {
			display: none;
		}
	}
	
	.btn-edit,
	.btn-delete {
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.2s;
	}
	
	.btn-edit {
		background-color: #002868;
		color: white;
	}
	
	.btn-edit:hover {
		background-color: #1a4a8a;
		transform: translateY(-1px);
	}
	
	.btn-delete {
		background-color: #B22234;
		color: white;
	}
	
	.btn-delete:hover {
		background-color: #8B1A1A;
		transform: translateY(-1px);
	}
	
	.editing-row {
		background-color: #f0f4ff;
	}
	
	.edit-form {
		padding: 1.5rem;
		background: white;
		border: 2px solid #002868;
		border-radius: 0.5rem;
		margin: 0.5rem 0;
	}
	
	.edit-form h3 {
		margin-top: 0;
		margin-bottom: 1rem;
		color: #002868;
		font-size: 1.25rem;
	}
	
	.edit-form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 1rem;
	}
	
	.edit-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
	}
	
	.edit-actions .btn {
		width: auto;
		padding: 0.5rem 1.5rem;
	}
	
	.actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}
	
	/* Dark mode styles */
	:global([data-theme='dark']) h1 {
		color: #e0e8f5;
	}
	
	:global([data-theme='dark']) .welcome {
		color: #e0e8f5;
	}
	
	:global([data-theme='dark']) .sport {
		color: #ff6b6b;
	}
	
	:global([data-theme='dark']) .stat-card {
		background: #1e2749;
		border: 1px solid #4a5d8a;
	}
	
	:global([data-theme='dark']) .stat-label {
		color: #ff6b6b;
	}
	
	:global([data-theme='dark']) .stat-value {
		color: #e0e8f5;
	}
	
	:global([data-theme='dark']) .progress-bar-large {
		background-color: #2a3a5a;
		border: 1px solid #4a5d8a;
	}
	
	:global([data-theme='dark']) .form-section,
	:global([data-theme='dark']) .recent-section {
		background: #1e2749;
		border-color: #4a5d8a;
	}
	
	:global([data-theme='dark']) h2 {
		color: #e0e8f5;
	}
	
	:global([data-theme='dark']) label {
		color: #e0e8f5;
	}
	
	:global([data-theme='dark']) input {
		background-color: #2a3a5a;
		border-color: #4a5d8a;
		color: #e0e8f5;
	}
	
	:global([data-theme='dark']) input:focus {
		border-color: #4a5d8a;
		box-shadow: 0 0 0 3px rgba(74, 93, 138, 0.3);
	}
	
	:global([data-theme='dark']) select {
		background-color: #2a3a5a;
		border-color: #4a5d8a;
		color: #e0e8f5;
	}
	
	:global([data-theme='dark']) select:focus {
		border-color: #4a5d8a;
		box-shadow: 0 0 0 3px rgba(74, 93, 138, 0.3);
	}
	
	:global([data-theme='dark']) .sport-change-notice {
		background: #3a2a1a;
		border-color: #ffc107;
	}
	
	:global([data-theme='dark']) .sport-notice {
		background: #ffc107;
		color: #000;
	}
	
	:global([data-theme='dark']) .conversion-hint {
		color: #a0b4d0;
	}
	
	:global([data-theme='dark']) thead {
		background: linear-gradient(90deg, #1a4a8a 0%, #2a5a9a 100%);
	}
	
	:global([data-theme='dark']) td {
		border-bottom-color: #2a3a5a;
		color: #e0e8f5;
	}
	
	:global([data-theme='dark']) tbody tr:hover {
		background-color: #2a3a5a;
	}
	
	:global([data-theme='dark']) .progress-bar {
		background-color: #2a3a5a;
		border-color: #4a5d8a;
	}
	
	:global([data-theme='dark']) .no-entries {
		color: #a0b4d0;
	}
	
	:global([data-theme='dark']) .editing-row {
		background-color: #2a3a5a;
	}
	
	:global([data-theme='dark']) .edit-form {
		background: #1e2749;
		border-color: #4a5d8a;
	}
	
	:global([data-theme='dark']) .edit-form h3 {
		color: #e0e8f5;
	}
	
	/* Dark mode entry card styles */
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

