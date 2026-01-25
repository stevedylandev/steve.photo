<script lang="ts">
	import { enhance } from "$app/forms";

	let { form } = $props();
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center p-4">
	<div class="w-full max-w-sm">
		<h1 class="text-2xl font-bold mb-8 text-center">Admin Login</h1>

		<form method="POST" use:enhance class="space-y-4">
			<div>
				<label for="password" class="block text-sm mb-2">Password</label>
				<input
					type="password"
					id="password"
					name="password"
					required
					class="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded focus:outline-none focus:border-zinc-500"
				/>
			</div>

			{#if form?.error}
				<p class="text-red-500 text-sm">{form.error}</p>
			{/if}

			<button
				type="submit"
				class="w-full py-2 bg-white text-black font-medium rounded hover:bg-zinc-200 transition-colors"
			>
				Sign In
			</button>
		</form>

		<p class="mt-6 text-center text-sm text-zinc-500">
			<a href="/" class="hover:text-white transition-colors">&larr; Back to gallery</a>
		</p>
	</div>
</div>
