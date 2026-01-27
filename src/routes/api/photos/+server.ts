import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import type { ImageItem } from "$lib";

const R2_BASE_URL = "https://r2.steve.photo";
const PAGE_SIZE = 15;

export const GET: RequestHandler = async ({ url, platform }) => {
  const db = platform?.env?.DB;
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);

  const result = await db
    .prepare("SELECT * FROM photos ORDER BY date DESC LIMIT ? OFFSET ?")
    .bind(PAGE_SIZE, offset)
    .all();

  const photos: ImageItem[] = result.results.map((row: Record<string, unknown>) => ({
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
  }));

  return json({ photos });
};
