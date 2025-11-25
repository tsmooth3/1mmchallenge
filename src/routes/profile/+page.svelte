<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();
	
	let name = $state(data.user.name);
	let sport = $state(data.user.sport);
	let error = $state('');
	let success = $state('');
	let loading = $state(false);
	let nameLoading = $state(false);
	let showSportConfirm = $state(false);
	let showDeleteConfirm = $state(false);
	let deleteConfirmText = $state('');
	
	async function handleNameUpdate() {
		if (!name || name.trim() === '') {
			error = 'Name cannot be empty';
			return;
		}
		
		if (name === data.user.name) {
			return; // No change
		}
		
		nameLoading = true;
		error = '';
		success = '';
		
		try {
			const res = await fetch('/api/profile/name', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: name.trim() })
			});
			
			const result = await res.json();
			
			if (res.ok) {
				success = 'Name updated successfully';
				data.user.name = name.trim();
				// Reload page after a moment to refresh data
				setTimeout(() => {
					window.location.reload();
				}, 1500);
			} else {
				error = result.error || 'Failed to update name';
			}
		} catch (e) {
			error = 'An error occurred. Please try again.';
		} finally {
			nameLoading = false;
		}
	}
	
	async function handleSportChange() {
		if (!sport || sport === data.user.sport) {
			error = 'Please select a different sport';
			return;
		}
		
		showSportConfirm = true;
	}
	
	async function confirmSportChange() {
		loading = true;
		error = '';
		success = '';
		
		try {
			const res = await fetch('/api/profile/sport', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sport })
			});
			
			const result = await res.json();
			
			if (res.ok) {
				success = 'Sport updated successfully. All entries for this year have been deleted.';
				showSportConfirm = false;
				// Update the displayed sport
				data.user.sport = sport;
				// Reload page after a moment to refresh data
				setTimeout(() => {
					window.location.reload();
				}, 1500);
			} else {
				error = result.error || 'Failed to update sport';
				showSportConfirm = false;
			}
		} catch (e) {
			error = 'An error occurred. Please try again.';
			showSportConfirm = false;
		} finally {
			loading = false;
		}
	}
	
	function handleDeleteAccount() {
		showDeleteConfirm = true;
		deleteConfirmText = '';
	}
	
	async function confirmDeleteAccount() {
		if (deleteConfirmText !== 'DELETE') {
			error = 'Please type DELETE to confirm';
			return;
		}
		
		loading = true;
		error = '';
		
		try {
			const res = await fetch('/api/profile/delete', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include' // Ensure cookies are sent
			});
			
			if (res.ok) {
				// Force a full page reload to clear auth state and redirect to home
				window.location.href = '/';
			} else {
				const result = await res.json();
				error = result.error || 'Failed to delete account';
				showDeleteConfirm = false;
				loading = false;
			}
		} catch (e) {
			error = 'An error occurred. Please try again.';
			showDeleteConfirm = false;
			loading = false;
		}
	}
</script>

<div class="container">
	<h1>User Preferences</h1>
	
	<div class="section">
		<h2>Account Information</h2>
		<div class="info-group">
			<div class="info-label">Email</div>
			<div class="info-value">{data.user.email}</div>
		</div>
		<div class="info-group">
			<div class="info-label">Current Sport</div>
			<div class="info-value">{data.user.sport}</div>
		</div>
	</div>
	
	<div class="section">
		<h2>Update Display Name</h2>
		<div class="form-group">
			<label for="name">Display Name</label>
			<input
				type="text"
				id="name"
				bind:value={name}
				placeholder="Your display name"
				disabled={nameLoading}
			/>
		</div>
		<button 
			type="button" 
			class="btn btn-primary" 
			onclick={handleNameUpdate}
			disabled={nameLoading || !name || name.trim() === '' || name.trim() === data.user.name}
		>
			{nameLoading ? 'Updating...' : 'Update Name'}
		</button>
	</div>
	
	<div class="section">
		<h2>Change Sport</h2>
		<p class="warning">
			⚠️ Warning: Changing your sport will delete all progress entries for the current year.
		</p>
		
		{#if !showSportConfirm}
			<div class="form-group">
				<label for="sport">New Sport</label>
				<select id="sport" bind:value={sport}>
					<option value="Cycling">Cycling</option>
					<option value="Rowing">Rowing</option>
					<option value="Rucking">Rucking</option>
					<option value="Running">Running</option>
					<option value="Skiing">Skiing</option>
					<option value="Swimming">Swimming</option>
					<option value="Other">Other</option>
				</select>
			</div>
			
			<button 
				type="button" 
				class="btn btn-warning" 
				onclick={handleSportChange}
				disabled={loading || sport === data.user.sport}
			>
				Change Sport
			</button>
		{:else}
			<div class="confirm-dialog">
				<p class="confirm-message">
					Are you sure you want to change your sport to <strong>{sport}</strong>?
				</p>
				<p class="confirm-warning">
					This will permanently delete all your progress entries for {new Date().getFullYear()}.
				</p>
				<div class="confirm-buttons">
					<button 
						type="button" 
						class="btn btn-danger" 
						onclick={confirmSportChange}
						disabled={loading}
					>
						{loading ? 'Updating...' : 'Yes, Change Sport'}
					</button>
					<button 
						type="button" 
						class="btn btn-secondary" 
						onclick={() => { showSportConfirm = false; error = ''; }}
						disabled={loading}
					>
						Cancel
					</button>
				</div>
			</div>
		{/if}
	</div>
	
	<div class="section danger-zone">
		<h2>Danger Zone</h2>
		
		{#if !showDeleteConfirm}
			<p class="warning">
				⚠️ Permanently delete your account and all associated data.
			</p>
			<button 
				type="button" 
				class="btn btn-danger" 
				onclick={handleDeleteAccount}
				disabled={loading}
			>
				Delete My Account
			</button>
		{:else}
			<div class="confirm-dialog">
				<p class="confirm-message">
					This action cannot be undone. This will permanently delete your account, 
					all progress entries, and all associated data.
				</p>
				<p class="confirm-warning">
					Type <strong>DELETE</strong> to confirm:
				</p>
				<div class="form-group">
					<input
						type="text"
						bind:value={deleteConfirmText}
						placeholder="Type DELETE to confirm"
						disabled={loading}
					/>
				</div>
				<div class="confirm-buttons">
					<button 
						type="button" 
						class="btn btn-danger" 
						onclick={confirmDeleteAccount}
						disabled={loading || deleteConfirmText !== 'DELETE'}
					>
						{loading ? 'Deleting...' : 'Delete My Account'}
					</button>
					<button 
						type="button" 
						class="btn btn-secondary" 
						onclick={() => { showDeleteConfirm = false; deleteConfirmText = ''; error = ''; }}
						disabled={loading}
					>
						Cancel
					</button>
				</div>
			</div>
		{/if}
	</div>
	
	{#if error}
		<div class="error">{error}</div>
	{/if}
	
	{#if success}
		<div class="success">{success}</div>
	{/if}
</div>

<style>
	.container {
		max-width: 600px;
		margin: 0 auto;
		padding: 1rem;
	}
	
	h1 {
		text-align: center;
		font-size: 2rem;
		margin-bottom: 2rem;
		color: #002868;
		font-weight: 700;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
	}
	
	h2 {
		font-size: 1.5rem;
		margin-bottom: 1rem;
		color: #002868;
		font-weight: 600;
	}
	
	.section {
		background: white;
		border: 2px solid #ddd;
		border-radius: 0.5rem;
		padding: 1.5rem;
		margin-bottom: 2rem;
	}
	
	.danger-zone {
		border-color: #B22234;
		background: #fff5f5;
	}
	
	.info-group {
		margin-bottom: 1rem;
	}
	
	.info-label {
		display: block;
		font-weight: 500;
		color: #666;
		margin-bottom: 0.25rem;
		font-size: 0.875rem;
	}
	
	.info-value {
		font-size: 1rem;
		color: #002868;
		font-weight: 500;
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
	
	select,
	input {
		width: 100%;
		padding: 0.75rem;
		font-size: 1rem;
		border: 1px solid #ddd;
		border-radius: 0.5rem;
		box-sizing: border-box;
	}
	
	select:focus,
	input:focus {
		outline: none;
		border-color: #002868;
		box-shadow: 0 0 0 3px rgba(0, 40, 104, 0.1);
	}
	
	.warning {
		background-color: #fff3cd;
		border: 1px solid #ffc107;
		color: #856404;
		padding: 0.75rem;
		border-radius: 0.5rem;
		margin-bottom: 1rem;
	}
	
	.confirm-dialog {
		background: #f8f9fa;
		border: 2px solid #002868;
		border-radius: 0.5rem;
		padding: 1.5rem;
	}
	
	.confirm-message {
		margin-bottom: 1rem;
		color: #002868;
		font-weight: 500;
	}
	
	.confirm-warning {
		color: #B22234;
		font-weight: 600;
		margin-bottom: 1rem;
	}
	
	.confirm-buttons {
		display: flex;
		gap: 1rem;
		margin-top: 1rem;
	}
	
	.btn {
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		border: none;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.2s;
		font-weight: 600;
	}
	
	.btn-primary {
		background: linear-gradient(135deg, #002868 0%, #1a4a8a 100%);
		color: white;
		border: 2px solid #B22234;
	}
	
	.btn-primary:hover:not(:disabled) {
		background: linear-gradient(135deg, #1a4a8a 0%, #002868 100%);
		box-shadow: 0 4px 8px rgba(0, 40, 104, 0.3);
		transform: translateY(-1px);
	}
	
	.btn-warning {
		background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
		color: #000;
		border: 2px solid #ff9800;
	}
	
	.btn-warning:hover:not(:disabled) {
		background: linear-gradient(135deg, #ff9800 0%, #ffc107 100%);
		box-shadow: 0 4px 8px rgba(255, 152, 0, 0.3);
		transform: translateY(-1px);
	}
	
	.btn-danger {
		background: linear-gradient(135deg, #B22234 0%, #dc3545 100%);
		color: white;
		border: 2px solid #B22234;
	}
	
	.btn-danger:hover:not(:disabled) {
		background: linear-gradient(135deg, #dc3545 0%, #B22234 100%);
		box-shadow: 0 4px 8px rgba(178, 34, 52, 0.3);
		transform: translateY(-1px);
	}
	
	.btn-secondary {
		background: #6c757d;
		color: white;
		border: 2px solid #6c757d;
	}
	
	.btn-secondary:hover:not(:disabled) {
		background: #5a6268;
		box-shadow: 0 4px 8px rgba(108, 117, 125, 0.3);
	}
	
	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
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
	
	@media (min-width: 768px) {
		.container {
			padding: 2rem;
		}
		
		h1 {
			font-size: 2.5rem;
		}
	}
	
	/* Dark mode styles */
	:global([data-theme='dark']) h1,
	:global([data-theme='dark']) h2 {
		color: #e0e8f5;
	}
	
	:global([data-theme='dark']) .section {
		background: #2a3a5a;
		border-color: #4a5d8a;
	}
	
	:global([data-theme='dark']) .danger-zone {
		background: #3a1a1a;
		border-color: #B22234;
	}
	
	:global([data-theme='dark']) label {
		color: #e0e8f5;
	}
	
	:global([data-theme='dark']) .info-label {
		color: #a0b4d0;
	}
	
	:global([data-theme='dark']) .info-value {
		color: #e0e8f5;
	}
	
	:global([data-theme='dark']) select,
	:global([data-theme='dark']) input {
		background-color: #2a3a5a;
		border-color: #4a5d8a;
		color: #e0e8f5;
	}
	
	:global([data-theme='dark']) select:focus,
	:global([data-theme='dark']) input:focus {
		border-color: #4a5d8a;
		box-shadow: 0 0 0 3px rgba(74, 93, 138, 0.3);
	}
	
	:global([data-theme='dark']) .confirm-dialog {
		background: #1a2a3a;
		border-color: #4a5d8a;
	}
	
	:global([data-theme='dark']) .confirm-message {
		color: #e0e8f5;
	}
</style>

