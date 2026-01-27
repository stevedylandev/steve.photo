<script lang="ts">
  import type { PageData } from "./$types";
  import ProgressiveImage from "$lib/components/ProgressiveImage.svelte";
  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>{data.photo.title} | steve.photo</title>
  <meta
    name="description"
    content="{data.photo.title} - Shot on {data.photo.make} {data.photo.camera}"
  />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="{data.photo.title} | steve.photo" />
  <meta property="og:url" content="https://steve.photo/photo/{data.photo.slug}" />
  <meta
    property="og:description"
    content="{data.photo.title} - Shot on {data.photo.make} {data.photo.camera}"
  />
  <meta property="og:image" content={data.photo.image} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{data.photo.title} | steve.photo" />
  <meta
    name="twitter:description"
    content="{data.photo.title} - Shot on {data.photo.make} {data.photo.camera}"
  />
  <meta name="twitter:image" content={data.photo.image} />
  <link rel="canonical" href="https://steve.photo/photo/{data.photo.slug}" />
</svelte:head>

<div class="bg-[#121113] min-h-screen text-white flex flex-col gap-4 pb-4">
  <div class="fixed bg-[#121113] w-full py-4 sm:px-8 px-4">
    <a href="/" class="text-sm hover:underline">steve.photo</a>
  </div>

  <div class="flex sm:flex-row flex-col gap-2 sm:px-8 px-4 pt-16">
    <div class="flex-6 min-w-0">
      <ProgressiveImage
        class="max-w-full h-auto block"
        src={data.photo.image}
        thumb={data.photo.thumb}
        alt={data.photo.title}
      />
    </div>
    <div class="flex flex-col p-4 flex-1 min-w-0 justify-between">
      <div class="flex flex-col gap-1 flex-1 min-w-0">
        <h2 class="text-lg">{data.photo.title.toUpperCase()}</h2>
        <h3 class="text-sm">{data.photo.make} {data.photo.camera}</h3>
        <div class="flex flex-col gap-2 text-neutral-400 font-thin text-xs mt-4">
          <p>{data.photo.focalLength}</p>
          <p>{data.photo.aperture}</p>
          <p>{data.photo.exposure}</p>
          <p>ISO {data.photo.iso}</p>
          <p>-</p>
          <p class="text-neutral-700 text-xs">{new Date(data.photo.date).toLocaleDateString()}</p>
        </div>
      </div>
      <a class="text-zinc-400 hover:text-white text-xs sm:pt-0 pt-24" href="/">Back to gallery</a>
    </div>
  </div>
</div>
