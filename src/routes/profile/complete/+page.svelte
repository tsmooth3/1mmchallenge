<script lang="ts">
	import { goto } from '$app/navigation';
	
	let sport = $state('');
	let error = $state('');
	let loading = $state(false);
	
	async function handleSubmit() {
		if (!sport) {
			error = 'Please select a sport';
			return;
		}
		
		loading = true;
		error = '';
		
		try {
			const res = await fetch('/api/profile/complete', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sport })
			});
			
			const data = await res.json();
			
			if (res.ok) {
				goto('/progress');
			} else {
				error = data.error || 'Failed to update profile';
			}
		} catch (e) {
			error = 'An error occurred. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="container">
	<h1>Complete Your Profile</h1>
	<p class="subtitle">Select your sport for the 1 Million Meter Challenge</p>
	
	<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
		<div class="form-group">
			<label for="sport">Sport</label>
			<select id="sport" bind:value={sport} required>
				<option value="">Select a sport</option>
				<option value="Cycling">Cycling</option>
				<option value="Rowing">Rowing</option>
				<option value="Rucking">Rucking</option>
				<option value="Running">Running</option>
				<option value="Skiing">Skiing</option>
				<option value="Swimming">Swimming</option>
				<option value="Other">Other</option>
			</select>
		</div>
		
		{#if error}
			<div class="error">{error}</div>
		{/if}
		
		<button type="submit" class="btn btn-primary" disabled={loading}>
			{loading ? 'Saving...' : 'Continue'}
		</button>
	</form>
</div>

<style>
	.container {
		max-width: 500px;
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
		color: #B22234;
		margin-bottom: 1.5rem;
		font-weight: 500;
		font-size: 0.875rem;
	}
	
	@media (min-width: 768px) {
		.container {
			padding: 2rem;
		}
		
		h1 {
			font-size: 2.5rem;
		}
		
		.subtitle {
			font-size: 1rem;
			margin-bottom: 2rem;
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
	
	select {
		width: 100%;
		padding: 0.75rem;
		font-size: 1rem;
		border: 1px solid #ddd;
		border-radius: 0.5rem;
		box-sizing: border-box;
	}
	
	select:focus {
		outline: none;
		border-color: #002868;
		box-shadow: 0 0 0 3px rgba(0, 40, 104, 0.1);
	}
	
	.error {
		background-color: #ffebee;
		color: #c62828;
		padding: 0.75rem;
		border-radius: 0.5rem;
		margin-bottom: 1rem;
	}
	
	.btn {
		width: 100%;
		padding: 0.75rem;
		font-size: 1rem;
		border: none;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.btn-primary {
		background: linear-gradient(135deg, #002868 0%, #1a4a8a 100%);
		color: white;
		border: 2px solid #B22234;
		font-weight: 600;
	}
	
	.btn-primary:hover:not(:disabled) {
		background: linear-gradient(135deg, #1a4a8a 0%, #002868 100%);
		box-shadow: 0 4px 8px rgba(0, 40, 104, 0.3);
		transform: translateY(-1px);
	}
	
	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	
	/* Dark mode styles */
	:global([data-theme='dark']) h1 {
		color: #e0e8f5;
	}
	
	:global([data-theme='dark']) .subtitle {
		color: #ff6b6b;
	}
	
	:global([data-theme='dark']) label {
		color: #e0e8f5;
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
</style>

