<script lang="ts">
import type { PageData } from "./$types";
let { data }: { data: PageData } = $props();
</script>

<div class="bg-[#121113] min-h-screen text-white flex flex-col gap-4 pb-4">
	<div class="fixed bg-[#121113] w-full py-4 sm:px-8 px-4">
		<a href="/" class="text-sm hover:underline">steve.photo (go back)</a>
	</div>

	<div class="flex sm:flex-row flex-col gap-2 sm:px-8 px-4 pt-16">
		<div class="flex-6 min-w-0">
			<img class="max-w-full h-auto block" src={data.photo.image} alt={data.photo.title} />
		</div>
		<div class="flex flex-col gap-1 flex-1 min-w-0 p-4">
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
	</div>
</div>
