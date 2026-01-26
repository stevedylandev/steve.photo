import type { PageServerLoad } from "./$types";
import type { ImageItem } from "$lib";

// R2 public URL - update this after enabling public access on your bucket
const R2_BASE_URL = "https://r2.steve.photo";

export const load: PageServerLoad = async ({ platform }) => {
  const db = platform?.env?.DB;

  const result = await db.prepare("SELECT * FROM photos ORDER BY date DESC").all();

  const photos: ImageItem[] = result.results.map((row: Record<string, unknown>) => ({
    slug: row.slug,
    title: row.title,
    date: row.date,
    image: `${R2_BASE_URL}/${row.image_key}`,
    thumb: `${R2_BASE_URL}/${row.thumb_key}`,
    type: row.type,
    camera: row.camera,
    lens: row.lens,
    aperture: row.aperture,
    exposure: row.exposure,
    focalLength: row.focal_length,
    iso: row.iso,
    make: row.make,
  }));

  return { photos };
};
