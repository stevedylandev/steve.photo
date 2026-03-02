<script lang="ts">
  import { browser } from "$app/environment";
  import type { PageData } from "./$types";
  import ProgressiveImage from "$lib/components/ProgressiveImage.svelte";
  type ImageItem = PageData["photos"][number];
  let { data }: { data: PageData } = $props();

  let viewMode = $state<'feed' | 'grid'>('feed');
  let photos = $state<ImageItem[]>([]);
  let loading = $state(false);
  let hasMore = $derived(photos.length < data.total);

  if (browser) {
    const saved = localStorage.getItem('viewMode');
    if (saved === 'feed' || saved === 'grid') {
      viewMode = saved;
    }
  }

  function toggleViewMode() {
    viewMode = viewMode === 'feed' ? 'grid' : 'feed';
    if (browser) {
      localStorage.setItem('viewMode', viewMode);
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
    <button onclick={toggleViewMode} class="text-neutral-400 hover:text-white transition-colors" aria-label="Toggle view mode">
      {#if viewMode === 'feed'}
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
        </svg>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      {/if}
    </button>
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
