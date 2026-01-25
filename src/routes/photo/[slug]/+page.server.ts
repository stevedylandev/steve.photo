import type { PageServerLoad } from "./$types";
import type { ImageItem } from "$lib/types";
import { error } from "@sveltejs/kit";

const R2_BASE_URL = "https://r2.steve.photo";

export const load: PageServerLoad = async ({ platform, params }) => {
	const db = platform?.env?.DB;

	const result = await db
		.prepare("SELECT * FROM photos WHERE slug = ?")
		.bind(params.slug)
		.first();

	if (!result) {
		throw error(404, "Photo not found");
	}

	const photo: ImageItem = {
		slug: result.slug as string,
		title: result.title as string,
		date: result.date as string,
		image: `${R2_BASE_URL}/${result.image_key}`,
		thumb: `${R2_BASE_URL}/${result.thumb_key}`,
		type: result.type as string,
		camera: result.camera as string,
		lens: result.lens as string,
		aperture: result.aperture as string,
		exposure: result.exposure as string,
		focalLength: result.focal_length as string,
		iso: result.iso as string,
		make: result.make as string,
		tags: [],
	};

	return { photo };
};
