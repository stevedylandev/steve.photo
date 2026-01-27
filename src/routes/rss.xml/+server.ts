import { Feed } from "feed";
import { getPhotos } from "$lib/feed";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ platform }) => {
  const feed = new Feed({
    title: "steve.photo",
    description: "Personal photography portolio of Steve Simkins",
    id: "https://steve.photo",
    link: "https://steve.photo/",
    language: "en",
    favicon: "https://steve.photo/favicon.ico",
    copyright: `Copyright ${new Date().getFullYear().toString()}, Steve Simkins`,
    feedLinks: {
      rss: "https://steve.photo/rss.xml",
    },
    author: {
      name: "Steve Simkins",
      email: "contact@stevedylan.dev",
      link: "https://stevedylan.dev",
    },
    ttl: 60,
  });

  const photos = await getPhotos(platform);

  for (const photo of photos) {
    feed.addItem({
      title: photo.title,
      id: `https://steve.photo/photo/${photo.slug}`,
      link: `https://steve.photo/photo/${photo.slug}`,
      date: new Date(photo.date),
      image: photo.image,
      author: [
        {
          name: "Steve Simkins",
          email: "contact@stevedylan.dev",
          link: "https://stevedylan.dev",
        },
      ],
      content: `<img src="${photo.image}" alt="${photo.title}" /><p>Camera: ${photo.camera} | Lens: ${photo.lens} | ${photo.aperture} | ${photo.exposure} | ISO ${photo.iso}</p>`,
    });
  }

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
