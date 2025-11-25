<script lang="ts">
	import { goto } from '$app/navigation';
	
	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);
	
	async function handleSubmit() {
		if (!email || !password) {
			error = 'Please fill in all fields';
			return;
		}
		
		loading = true;
		error = '';
		
		try {
			const res = await fetch('/api/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});
			
			const data = await res.json();
			
			if (res.ok) {
				goto('/progress');
			} else {
				error = data.error || 'Login failed';
			}
		} catch (e) {
			error = 'An error occurred. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="container">
	<h1>Log In</h1>
	<p class="subtitle">Welcome back to the 1 Million Meter Challenge</p>
	
	<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} autocomplete="on">
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
				autocomplete="current-password"
				bind:value={password}
				required
				placeholder="Enter your password"
			/>
		</div>
		
		{#if error}
			<div class="error">{error}</div>
		{/if}
		
		<button type="submit" class="btn btn-primary" disabled={loading}>
			{loading ? 'Logging in...' : 'Log In'}
		</button>
	</form>
	
	<div class="divider">
		<span>or</span>
	</div>
	
	<a href="/login/google" class="btn btn-google">
		<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
			<path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
			<path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
			<path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.348 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05"/>
			<path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
		</svg>
		Continue with Google
	</a>
	
	<p class="link">
		Don't have an account? <a href="/signup">Sign up</a>
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
		color: #333;
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
	
	.divider {
		display: flex;
		align-items: center;
		text-align: center;
		margin: 1.5rem 0;
	}
	
	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		border-bottom: 1px solid #ddd;
	}
	
	.divider span {
		padding: 0 1rem;
		color: #666;
		font-size: 0.875rem;
	}
	
	.btn-google {
		width: 100%;
		padding: 0.75rem;
		font-size: 1rem;
		border: 1px solid #ddd;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.2s;
		text-decoration: none;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		background: white;
		color: #333;
		font-weight: 500;
	}
	
	.btn-google:hover {
		background: #f5f5f5;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transform: translateY(-1px);
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
	
	:global([data-theme='dark']) input {
		background-color: #2a3a5a;
		border-color: #4a5d8a;
		color: #e0e8f5;
	}
	
	:global([data-theme='dark']) input:focus {
		border-color: #4a5d8a;
		box-shadow: 0 0 0 3px rgba(74, 93, 138, 0.3);
	}
	
	:global([data-theme='dark']) .link a {
		color: #a0b4d0;
	}
	
	:global([data-theme='dark']) .divider::before,
	:global([data-theme='dark']) .divider::after {
		border-bottom-color: #4a5d8a;
	}
	
	:global([data-theme='dark']) .divider span {
		color: #a0b4d0;
	}
	
	:global([data-theme='dark']) .btn-google {
		background: #2a3a5a;
		border-color: #4a5d8a;
		color: #e0e8f5;
	}
	
	:global([data-theme='dark']) .btn-google:hover {
		background: #3a4a6a;
	}
</style>

