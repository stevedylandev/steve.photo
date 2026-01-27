<script lang="ts">
  import type { PageData } from "./$types";
  import ProgressiveImage from "$lib/components/ProgressiveImage.svelte";
  type ImageItem = PageData["photos"][number];
  let { data }: { data: PageData } = $props();
</script>

<div class="bg-[#121113] min-h-screen text-white">
  <div class="fixed bg-[#121113] w-full py-4 sm:px-8 px-4">
    <h1 class="text-sm">steve.photo</h1>
  </div>

  {#snippet figure(image: ImageItem)}
    <div class="flex sm:flex-row flex-col gap-2 sm:px-8 px-4 pt-2">
      <a href="/photo/{image.slug}" class="flex-2 min-w-0">
        <ProgressiveImage
          class="max-w-full h-auto block"
          src={image.image}
          thumb={image.thumb}
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

  <div class="flex flex-col gap-2 pt-12">
    {#each data.photos as image}
      {@render figure(image)}
    {/each}
  </div>
</div>
