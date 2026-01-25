import type { PageServerLoad } from "./$types";
import type { ImageItem } from "$lib/types";

// R2 public URL - update this after enabling public access on your bucket
const R2_BASE_URL = "https://r2.steve.photo";

export const load: PageServerLoad = async ({ platform }) => {
	const db = platform?.env?.DB;

	if (!db) {
		// Fallback for local dev without D1
		const data = await import("$lib/data.json");
		return { photos: data.default as ImageItem[] };
	}

	const result = await db
		.prepare("SELECT * FROM photos ORDER BY date DESC")
		.all();

	const photos: ImageItem[] = result.results.map(
		(row: Record<string, unknown>) => ({
			slug: row.slug as string,
			title: row.title as string,
			date: row.date as string,
			image: `${R2_BASE_URL}/${row.image_key}`,
			thumb: `${R2_BASE_URL}/${row.thumb_key}`,
			type: row.type as string,
			camera: row.camera as string,
			lens: row.lens as string,
			aperture: row.aperture as string,
			exposure: row.exposure as string,
			focalLength: row.focal_length as string,
			iso: row.iso as string,
			make: row.make as string,
			tags: JSON.parse((row.tags as string) || "[]"),
		}),
	);

	return { photos };
};
