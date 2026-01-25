<script lang="ts">
import "./layout.css";
import favicon from "$lib/assets/favicon.svg";

let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<div class="bg-[#121113] min-h-screen w-full font-mono text-white">
  {@render children()}
</div>
