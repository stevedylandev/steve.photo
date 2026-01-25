<script lang="ts">
	import { enhance } from "$app/forms";
	import exifr from "exifr";

	let { data, form } = $props();

	let fileInput = $state<HTMLInputElement | null>(null);
	let selectedFile = $state<File | null>(null);
	let previewUrl = $state<string | null>(null);
	let thumbnailBlob = $state<Blob | null>(null);

	let title = $state("");
	let date = $state("");
	let camera = $state("");
	let lens = $state("");
	let aperture = $state("");
	let exposure = $state("");
	let focalLength = $state("");
	let iso = $state("");
	let make = $state("");

	let isLoading = $state(false);
	let editingId = $state<number | null>(null);
	let editingTitle = $state("");
	let deleteConfirmId = $state<number | null>(null);

	async function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		selectedFile = file;
		previewUrl = URL.createObjectURL(file);

		// Auto-populate title from filename
		const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
		title = nameWithoutExt.replace(/[-_]/g, " ");

		// Extract EXIF data
		try {
			const exif = await exifr.parse(file, {
				pick: [
					"DateTimeOriginal",
					"Model",
					"LensModel",
					"FNumber",
					"ExposureTime",
					"FocalLength",
					"ISO",
					"Make",
				],
			});

			if (exif) {
				if (exif.DateTimeOriginal) {
					const d = new Date(exif.DateTimeOriginal);
					date = d.toISOString().split("T")[0];
				}
				if (exif.Model) camera = exif.Model;
				if (exif.LensModel) lens = exif.LensModel;
				if (exif.FNumber) aperture = `f/${exif.FNumber}`;
				if (exif.ExposureTime) {
					exposure =
						exif.ExposureTime < 1 ? `1/${Math.round(1 / exif.ExposureTime)}s` : `${exif.ExposureTime}s`;
				}
				if (exif.FocalLength) focalLength = `${exif.FocalLength}mm`;
				if (exif.ISO) iso = String(exif.ISO);
				if (exif.Make) make = exif.Make;
			}
		} catch (err) {
			console.error("Failed to read EXIF data:", err);
		}

		// Generate thumbnail
		await generateThumbnail(file);
	}

	async function generateThumbnail(file: File): Promise<void> {
		return new Promise((resolve) => {
			const img = new Image();
			img.onload = () => {
				const maxSize = 400;
				let width = img.width;
				let height = img.height;

				if (width > height) {
					if (width > maxSize) {
						height = (height * maxSize) / width;
						width = maxSize;
					}
				} else {
					if (height > maxSize) {
						width = (width * maxSize) / height;
						height = maxSize;
					}
				}

				const canvas = document.createElement("canvas");
				canvas.width = width;
				canvas.height = height;

				const ctx = canvas.getContext("2d");
				if (ctx) {
					ctx.drawImage(img, 0, 0, width, height);
					canvas.toBlob(
						(blob) => {
							thumbnailBlob = blob;
							resolve();
						},
						"image/jpeg",
						0.8
					);
				} else {
					resolve();
				}
			};
			img.src = URL.createObjectURL(file);
		});
	}

	function handleSubmit() {
		isLoading = true;
	}

	function startEdit(photo: { id: number; title: string }) {
		editingId = photo.id;
		editingTitle = photo.title;
	}

	function cancelEdit() {
		editingId = null;
		editingTitle = "";
	}
</script>

<svelte:head>
	<title>Admin - Upload Photo</title>
</svelte:head>

<div class="min-h-screen p-4 md:p-8">
	<div class="max-w-4xl mx-auto">
		<div class="flex items-center justify-between mb-8">
			<h1 class="text-2xl font-bold">Admin</h1>
			<a
				href="/api/logout"
				class="text-sm text-zinc-400 hover:text-white transition-colors"
			>
				Logout
			</a>
		</div>

		<!-- Upload Section -->
		<section>
			<h2 class="text-xl font-semibold mb-4">Upload New Photo</h2>

			<form
				method="POST"
				action="?/upload"
				enctype="multipart/form-data"
				use:enhance={({ formData }) => {
					handleSubmit();
					if (thumbnailBlob) {
						formData.append("thumbnail", thumbnailBlob, "thumbnail.jpg");
					}
					return async ({ update }) => {
						isLoading = false;
						await update();
					};
				}}
				class="space-y-6"
			>
				<div>
					<label for="file" class="block text-sm mb-2">Image</label>
					<input
						type="file"
						id="file"
						name="file"
						accept="image/jpeg,image/png,image/webp"
						required
						bind:this={fileInput}
						onchange={handleFileSelect}
						class="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded focus:outline-none focus:border-zinc-500 file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:bg-zinc-700 file:text-white file:cursor-pointer"
					/>
				</div>

				{#if previewUrl}
					<div class="relative">
						<img
							src={previewUrl}
							alt="Preview"
							class="w-full max-h-64 object-contain rounded bg-zinc-900"
						/>
					</div>
				{/if}

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="title" class="block text-sm mb-2">Title *</label>
						<input
							type="text"
							id="title"
							name="title"
							required
							bind:value={title}
							class="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded focus:outline-none focus:border-zinc-500"
						/>
					</div>

					<div>
						<label for="date" class="block text-sm mb-2">Date *</label>
						<input
							type="date"
							id="date"
							name="date"
							required
							bind:value={date}
							class="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded focus:outline-none focus:border-zinc-500"
						/>
					</div>
				</div>

				<div class="border-t border-zinc-800 pt-6">
					<h3 class="text-lg font-medium mb-4">EXIF Data</h3>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label for="make" class="block text-sm mb-2">Make</label>
							<input
								type="text"
								id="make"
								name="make"
								bind:value={make}
								class="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded focus:outline-none focus:border-zinc-500"
							/>
						</div>

						<div>
							<label for="camera" class="block text-sm mb-2">Camera</label>
							<input
								type="text"
								id="camera"
								name="camera"
								bind:value={camera}
								class="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded focus:outline-none focus:border-zinc-500"
							/>
						</div>

						<div>
							<label for="lens" class="block text-sm mb-2">Lens</label>
							<input
								type="text"
								id="lens"
								name="lens"
								bind:value={lens}
								class="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded focus:outline-none focus:border-zinc-500"
							/>
						</div>

						<div>
							<label for="aperture" class="block text-sm mb-2">Aperture</label>
							<input
								type="text"
								id="aperture"
								name="aperture"
								bind:value={aperture}
								class="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded focus:outline-none focus:border-zinc-500"
							/>
						</div>

						<div>
							<label for="exposure" class="block text-sm mb-2">Exposure</label>
							<input
								type="text"
								id="exposure"
								name="exposure"
								bind:value={exposure}
								class="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded focus:outline-none focus:border-zinc-500"
							/>
						</div>

						<div>
							<label for="focalLength" class="block text-sm mb-2">Focal Length</label>
							<input
								type="text"
								id="focalLength"
								name="focalLength"
								bind:value={focalLength}
								class="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded focus:outline-none focus:border-zinc-500"
							/>
						</div>

						<div>
							<label for="iso" class="block text-sm mb-2">ISO</label>
							<input
								type="text"
								id="iso"
								name="iso"
								bind:value={iso}
								class="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded focus:outline-none focus:border-zinc-500"
							/>
						</div>
					</div>
				</div>

				{#if form?.error}
					<p class="text-red-500 text-sm">{form.error}</p>
				{/if}

				<button
					type="submit"
					disabled={isLoading || !selectedFile}
					class="w-full py-3 bg-white text-black font-medium rounded hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isLoading ? "Uploading..." : "Upload Photo"}
				</button>
			</form>
		</section>


		<!-- Existing Photos Section -->
		{#if data.photos.length > 0}
			<section class="mb-12">
				<h2 class="text-xl font-semibold mb-4">Photos ({data.photos.length})</h2>
				<div class="space-y-2">
					{#each data.photos as photo (photo.id)}
						<div class="flex items-center gap-4 p-3 bg-zinc-900 rounded-lg">
							<a href="/photo/{photo.slug}" class="shrink-0">
								<img
									src={photo.thumb}
									alt={photo.title}
									class="w-16 h-16 object-cover rounded"
								/>
							</a>

							<div class="flex-1 min-w-0">
								{#if editingId === photo.id}
									<form
										method="POST"
										action="?/edit"
										use:enhance={() => {
											return async ({ update }) => {
												editingId = null;
												await update();
											};
										}}
										class="flex items-center gap-2"
									>
										<input type="hidden" name="id" value={photo.id} />
										<input
											type="text"
											name="title"
											bind:value={editingTitle}
											class="flex-1 px-3 py-1 bg-zinc-800 border border-zinc-600 rounded text-sm focus:outline-none focus:border-zinc-500"
										/>
										<button
											type="submit"
											class="px-3 py-1 bg-white text-black text-sm rounded hover:bg-zinc-200"
										>
											Save
										</button>
										<button
											type="button"
											onclick={cancelEdit}
											class="px-3 py-1 text-sm text-zinc-400 hover:text-white"
										>
											Cancel
										</button>
									</form>
								{:else}
									<a href="/photo/{photo.slug}" class="block">
										<p class="font-medium truncate">{photo.title}</p>
										<p class="text-sm text-zinc-500">{photo.date}</p>
									</a>
								{/if}
							</div>

							{#if editingId !== photo.id}
								<div class="flex items-center gap-2 shrink-0">
									<button
										type="button"
										onclick={() => startEdit(photo)}
										class="px-3 py-1 text-sm text-zinc-400 hover:text-white transition-colors"
									>
										Edit
									</button>

									{#if deleteConfirmId === photo.id}
										<form
											method="POST"
											action="?/delete"
											use:enhance={() => {
												return async ({ update }) => {
													deleteConfirmId = null;
													await update();
												};
											}}
											class="flex items-center gap-1"
										>
											<input type="hidden" name="id" value={photo.id} />
											<button
												type="submit"
												class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
											>
												Confirm
											</button>
											<button
												type="button"
												onclick={() => deleteConfirmId = null}
												class="px-3 py-1 text-sm text-zinc-400 hover:text-white"
											>
												Cancel
											</button>
										</form>
									{:else}
										<button
											type="button"
											onclick={() => deleteConfirmId = photo.id}
											class="px-3 py-1 text-sm text-red-400 hover:text-red-300 transition-colors"
										>
											Delete
										</button>
									{/if}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</section>
		{/if}


		<p class="mt-8 text-center text-sm text-zinc-500">
			<a href="/" class="hover:text-white transition-colors">&larr; Back to gallery</a>
		</p>
	</div>
</div>
