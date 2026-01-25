import type { Actions, PageServerLoad } from "./$types";
import { fail, redirect, isRedirect } from "@sveltejs/kit";

const R2_BASE_URL = "https://r2.steve.photo";

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	upload: async ({ request, platform, locals }) => {
		if (!locals.user?.authenticated) {
			return fail(401, { error: "Unauthorized" });
		}

		const db = platform?.env?.DB;
		const bucket = platform?.env?.PHOTOS;

		if (!db || !bucket) {
			return fail(500, { error: "Server configuration error" });
		}

		const formData = await request.formData();
		const file = formData.get("file") as File | null;
		const thumbnail = formData.get("thumbnail") as File | null;
		const title = formData.get("title") as string;
		const date = formData.get("date") as string;
		const camera = formData.get("camera") as string;
		const lens = formData.get("lens") as string;
		const aperture = formData.get("aperture") as string;
		const exposure = formData.get("exposure") as string;
		const focalLength = formData.get("focalLength") as string;
		const iso = formData.get("iso") as string;
		const make = formData.get("make") as string;

		if (!file || !title || !date) {
			return fail(400, { error: "File, title, and date are required" });
		}

		// Generate slug from title
		const slug = title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/(^-|-$)/g, "");

		// Check if slug already exists
		const existing = await db
			.prepare("SELECT id FROM photos WHERE slug = ?")
			.bind(slug)
			.first();
		if (existing) {
			return fail(400, { error: "A photo with this title already exists" });
		}

		// Get file extension
		const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
		const imageKey = `${slug}.${ext}`;
		const thumbKey = `${slug}-thumb.jpg`;

		try {
			// Upload original image to R2
			const fileBuffer = await file.arrayBuffer();
			await bucket.put(imageKey, fileBuffer, {
				httpMetadata: {
					contentType: file.type,
				},
			});

			// Upload thumbnail to R2
			if (thumbnail) {
				const thumbBuffer = await thumbnail.arrayBuffer();
				await bucket.put(thumbKey, thumbBuffer, {
					httpMetadata: {
						contentType: "image/jpeg",
					},
				});
			} else {
				// If no thumbnail provided, use original as thumbnail
				await bucket.put(thumbKey, fileBuffer, {
					httpMetadata: {
						contentType: file.type,
					},
				});
			}

			// Insert into database
			await db
				.prepare(
					`INSERT INTO photos (slug, title, date, image_key, thumb_key, camera, lens, aperture, exposure, focal_length, iso, make)
					 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				)
				.bind(
					slug,
					title,
					date,
					imageKey,
					thumbKey,
					camera || null,
					lens || null,
					aperture || null,
					exposure || null,
					focalLength || null,
					iso || null,
					make || null,
				)
				.run();

			throw redirect(302, `/photo/${slug}`);
		} catch (err) {
			if (isRedirect(err)) {
				throw err; // Re-throw redirects
			}
			const errorMessage = err instanceof Error ? err.message : String(err);
			console.error("Upload error:", errorMessage, err);
			return fail(500, { error: `Failed to upload photo: ${errorMessage}` });
		}
	},
};
