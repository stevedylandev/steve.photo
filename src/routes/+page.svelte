<script lang="ts">
import { browser } from "$app/environment";
import type { PageData } from "./$types";
import ProgressiveImage from "$lib/components/ProgressiveImage.svelte";
type ImageItem = PageData["photos"][number];
let { data }: { data: PageData } = $props();

let viewMode = $state<"feed" | "grid">("feed");
let photos = $state<ImageItem[]>([]);
let loading = $state(false);
let hasMore = $derived(photos.length < data.total);

if (browser) {
	const saved = localStorage.getItem("viewMode");
	if (saved === "feed" || saved === "grid") {
		viewMode = saved;
	}
}

function toggleViewMode() {
	viewMode = viewMode === "feed" ? "grid" : "feed";
	if (browser) {
		localStorage.setItem("viewMode", viewMode);
	}
}

$effect(() => {
	photos = data.photos;
});
let sentinel: HTMLDivElement;

async function loadMore() {
	if (loading || !hasMore) return;
	loading = true;

	try {
		const response = await fetch(`/api/photos?offset=${photos.length}`);
		const result = await response.json();
		if (result.photos.length > 0) {
			photos = [...photos, ...result.photos];
		}
	} catch (error) {
		console.error("Failed to load more photos:", error);
	} finally {
		loading = false;
	}
}

$effect(() => {
	if (!sentinel) return;

	const observer = new IntersectionObserver(
		(entries) => {
			if (entries[0].isIntersecting && hasMore && !loading) {
				loadMore();
			}
		},
		{ rootMargin: "200px" },
	);

	observer.observe(sentinel);

	return () => observer.disconnect();
});
</script>

<div class="bg-[#121113] min-h-screen text-white">
  <div class="fixed bg-[#121113] w-full py-4 sm:px-8 px-4 flex items-center justify-between z-10">
    <h1 class="text-sm">steve.photo</h1>
    <div class="flex items-center gap-4">
      <a href="https://stevedylan.dev" target="_blank" rel="noreferrer" class="text-neutral-400 hover:text-white transition-colors" aria-label="stevedylan.dev">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256">
          <path fill="currentColor" d="M164 80a28 28 0 1 0-28-28a28 28 0 0 0 28 28m0-40a12 12 0 1 1-12 12a12 12 0 0 1 12-12m90.88 155.92l-54.56-92.08A15.87 15.87 0 0 0 186.55 96a15.85 15.85 0 0 0-13.76 7.84L146.63 148l-44.84-76.1a16 16 0 0 0-27.58 0L1.11 195.94A8 8 0 0 0 8 208h240a8 8 0 0 0 6.88-12.08M88 80l23.57 40H64.43ZM22 192l33-56h66l18.74 31.8L154 192Zm150.57 0l-16.66-28.28L186.55 112L234 192Z"/>
        </svg>
      </a>
      <a href="/rss.xml" class="text-neutral-400 hover:text-white transition-colors" aria-label="RSS feed">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256">
          <path fill="currentColor" d="M106.91 149.09A71.53 71.53 0 0 1 128 200a8 8 0 0 1-16 0a56 56 0 0 0-56-56a8 8 0 0 1 0-16a71.53 71.53 0 0 1 50.91 21.09M56 80a8 8 0 0 0 0 16a104 104 0 0 1 104 104a8 8 0 0 0 16 0A120 120 0 0 0 56 80m118.79 1.21A166.9 166.9 0 0 0 56 32a8 8 0 0 0 0 16a151 151 0 0 1 107.48 44.52A151 151 0 0 1 208 200a8 8 0 0 0 16 0a166.9 166.9 0 0 0-49.21-118.79M60 184a12 12 0 1 0 12 12a12 12 0 0 0-12-12"/>
        </svg>
      </a>
      <button onclick={toggleViewMode} class="text-neutral-400 hover:text-white transition-colors" aria-label="Toggle view mode">
        {#if viewMode === 'feed'}
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256">
            <path fill="currentColor" d="M200 40H56a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m0 80h-64V56h64Zm-80-64v64H56V56Zm-64 80h64v64H56Zm144 64h-64v-64h64z"/>
          </svg>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256">
            <path fill="currentColor" d="M224 128a8 8 0 0 1-8 8H40a8 8 0 0 1 0-16h176a8 8 0 0 1 8 8M40 72h176a8 8 0 0 0 0-16H40a8 8 0 0 0 0 16m176 112H40a8 8 0 0 0 0 16h176a8 8 0 0 0 0-16"/>
          </svg>
        {/if}
      </button>
    </div>
  </div>

  {#snippet figure(image: ImageItem)}
    <div class="flex sm:flex-row flex-col gap-2 sm:px-8 px-4 pt-2">
      <a href="/photo/{image.slug}" class="flex-2 min-w-0">
        <ProgressiveImage
          class="max-w-full h-auto block"
          src={image.image}
          thumb={image.thumb}
          blurData={image.blurData}
          alt={image.title}
        />
      </a>
      <div class="flex flex-col gap-1 flex-1 min-w-0 p-4">
        <h2 class="text-lg">{image.title.toUpperCase()}</h2>
        <h3 class="text-sm">{image.make} {image.camera}</h3>
        <div class="flex flex-col gap-2 text-neutral-400 font-thin text-xs mt-4">
          <p>{image.focalLength}</p>
          <p>{image.aperture}</p>
          <p>{image.exposure}</p>
          <p>ISO {image.iso}</p>
          <p>-</p>
          <p class="text-neutral-700 text-xs">{new Date(image.date).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  {/snippet}

  {#if viewMode === 'feed'}
    <div class="flex flex-col gap-2 pt-12">
      {#each photos as image}
        {@render figure(image)}
      {/each}
    </div>
  {:else}
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-1 pt-12 sm:px-8 px-4">
      {#each photos as image}
        <a href="/photo/{image.slug}" class="grid-item block overflow-hidden aspect-[3/2]">
          <ProgressiveImage
            class="w-full h-full block"
            src={image.image}
            thumb={image.thumb}
            blurData={image.blurData}
            alt={image.title}
          />
        </a>
      {/each}
    </div>
  {/if}

  <div bind:this={sentinel} class="h-4"></div>

  {#if loading}
    <div class="flex justify-center py-8">
      <div class="text-neutral-400 text-sm">Loading...</div>
    </div>
  {/if}
</div>

<style>
  .grid-item :global(.progressive-container) {
    aspect-ratio: unset !important;
    height: 100%;
  }

  .grid-item :global(.progressive-image) {
    object-fit: cover;
  }
</style>
