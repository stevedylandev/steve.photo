<script lang="ts">
let {
	src,
	thumb,
	alt,
	blurData,
	class: className = "",
}: {
	src: string;
	thumb: string;
	alt: string;
	blurData?: string;
	class?: string;
} = $props();

let loaded = $state(false);
let thumbAspect = $state(0);
let thumbImg: HTMLImageElement;

function onThumbLoad() {
	if (thumbImg.naturalWidth && thumbImg.naturalHeight) {
		thumbAspect = thumbImg.naturalWidth / thumbImg.naturalHeight;
	}
}

$effect(() => {
	loaded = false;
	const img = new Image();
	img.onload = () => {
		loaded = true;
	};
	img.src = src;

	return () => {
		img.onload = null;
	};
});

let placeholderSrc = $derived(blurData || thumb);
</script>

<div
  class="progressive-container"
  style="max-width: 4000px; {thumbAspect ? `aspect-ratio: ${thumbAspect};` : ''}"
>
  <img
    bind:this={thumbImg}
    src={loaded ? src : placeholderSrc}
    {alt}
    class="{className} progressive-image"
    class:progressive-loading={!loaded}
    onload={onThumbLoad}
  />
</div>

<style>
  .progressive-container {
    width: 100%;
  }

  .progressive-container .progressive-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .progressive-image {
    transition: filter 0.6s ease-out;
  }

  .progressive-loading {
    filter: blur(20px);
  }
</style>
