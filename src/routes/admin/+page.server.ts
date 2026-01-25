import type { Actions, PageServerLoad } from "./$types";
import { fail, redirect, isRedirect } from "@sveltejs/kit";

const R2_BASE_URL = "https://r2.steve.photo";

type PhotoRow = {
	id: number;
	slug: string;
	title: string;
	date: string;
	image_key: string;
	thumb_key: string;
};

export const load: PageServerLoad = async ({ platform }) => {
	const db = platform?.env?.DB;
	if (!db) {
		return { photos: [] };
	}

	const result = await db
		.prepare(
			"SELECT id, slug, title, date, image_key, thumb_key FROM photos ORDER BY date DESC",
		)
		.all<PhotoRow>();

	const photos = result.results.map((row: PhotoRow) => ({
		id: row.id,
		slug: row.slug,
		title: row.title,
		date: row.date,
		thumb: `${R2_BASE_URL}/${row.thumb_key}`,
	}));

	return { photos };
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

	edit: async ({ request, platform, locals }) => {
		if (!locals.user?.authenticated) {
			return fail(401, { error: "Unauthorized" });
		}

		const db = platform?.env?.DB;
		if (!db) {
			return fail(500, { error: "Server configuration error" });
		}

		const formData = await request.formData();
		const id = formData.get("id") as string;
		const title = formData.get("title") as string;

		if (!id || !title) {
			return fail(400, { error: "ID and title are required" });
		}

		try {
			await db
				.prepare("UPDATE photos SET title = ? WHERE id = ?")
				.bind(title, parseInt(id, 10))
				.run();

			return { success: true };
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : String(err);
			console.error("Edit error:", errorMessage);
			return fail(500, { error: `Failed to update photo: ${errorMessage}` });
		}
	},

	delete: async ({ request, platform, locals }) => {
		if (!locals.user?.authenticated) {
			return fail(401, { error: "Unauthorized" });
		}

		const db = platform?.env?.DB;
		const bucket = platform?.env?.PHOTOS;

		if (!db || !bucket) {
			return fail(500, { error: "Server configuration error" });
		}

		const formData = await request.formData();
		const id = formData.get("id") as string;

		if (!id) {
			return fail(400, { error: "ID is required" });
		}

		try {
			// Get photo details first to delete from R2
			const photo = await db
				.prepare("SELECT image_key, thumb_key FROM photos WHERE id = ?")
				.bind(parseInt(id, 10))
				.first<{ image_key: string; thumb_key: string }>();

			if (!photo) {
				return fail(404, { error: "Photo not found" });
			}

			// Delete from R2
			await bucket.delete(photo.image_key);
			await bucket.delete(photo.thumb_key);

			// Delete from database
			await db
				.prepare("DELETE FROM photos WHERE id = ?")
				.bind(parseInt(id, 10))
				.run();

			return { success: true };
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : String(err);
			console.error("Delete error:", errorMessage);
			return fail(500, { error: `Failed to delete photo: ${errorMessage}` });
		}
	},
};
