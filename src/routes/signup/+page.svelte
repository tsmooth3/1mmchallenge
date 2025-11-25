<script lang="ts">
	import { goto } from '$app/navigation';
	
	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let sport = $state('');
	let error = $state('');
	let loading = $state(false);
	
	async function handleSubmit() {
		if (!name || !email || !password || !sport) {
			error = 'Please fill in all fields';
			return;
		}
		
		if (password.length < 6) {
			error = 'Password must be at least 6 characters';
			return;
		}
		
		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}
		
		loading = true;
		error = '';
		
		try {
			const res = await fetch('/api/signup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, password, sport })
			});
			
			const data = await res.json();
			
			if (res.ok) {
				goto('/progress');
			} else {
				error = data.error || 'Signup failed';
			}
		} catch (e) {
			error = 'An error occurred. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="container">
	<h1>Sign Up</h1>
	<p class="subtitle">Join the 1 Million Meter Challenge</p>
	
	<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} autocomplete="on">
		<div class="form-group">
			<label for="name">Name</label>
			<input
				type="text"
				id="name"
				name="name"
				autocomplete="name"
				bind:value={name}
				required
				placeholder="Your name"
			/>
		</div>
		
		<div class="form-group">
			<label for="email">Email</label>
			<input
				type="email"
				id="email"
				name="email"
				autocomplete="username"
				bind:value={email}
				required
				placeholder="your.email@example.com"
			/>
		</div>
		
		<div class="form-group">
			<label for="password">Password</label>
			<input
				type="password"
				id="password"
				name="password"
				autocomplete="new-password"
				bind:value={password}
				required
				minlength="6"
				placeholder="At least 6 characters"
			/>
		</div>
		
		<div class="form-group">
			<label for="confirmPassword">Confirm Password</label>
			<input
				type="password"
				id="confirmPassword"
				name="confirmPassword"
				autocomplete="new-password"
				bind:value={confirmPassword}
				required
				minlength="6"
				placeholder="Confirm your password"
			/>
		</div>
		
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
			{loading ? 'Signing up...' : 'Sign Up'}
		</button>
	</form>
	
	<p class="link">
		Already have an account? <a href="/login">Log in</a>
	</p>
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
	
	input,
	select {
		width: 100%;
		padding: 0.75rem;
		font-size: 1rem;
		border: 1px solid #ddd;
		border-radius: 0.5rem;
		box-sizing: border-box;
	}
	
	input:focus,
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
	
	.link {
		text-align: center;
		margin-top: 1rem;
	}
	
	.link a {
		color: #002868;
		text-decoration: none;
		font-weight: 500;
	}
	
	.link a:hover {
		text-decoration: underline;
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
	
	:global([data-theme='dark']) input,
	:global([data-theme='dark']) select {
		background-color: #2a3a5a;
		border-color: #4a5d8a;
		color: #e0e8f5;
	}
	
	:global([data-theme='dark']) input:focus,
	:global([data-theme='dark']) select:focus {
		border-color: #4a5d8a;
		box-shadow: 0 0 0 3px rgba(74, 93, 138, 0.3);
	}
	
	:global([data-theme='dark']) .link a {
		color: #a0b4d0;
	}
</style>

