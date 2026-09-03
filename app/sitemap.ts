import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://darshanaoptical.com";

  const pages = [
    "",
    "/eye-testing",
    "/frames",
    "/lenses",
    "/progressive-lenses",
    "/frame-finder",
    "/lens-finder",
    "/offers",
    "/gallery",
    "/contact",
    "/book-eye-test",
  ];

  return pages.map((page) => ({
    url: `${base}${page}`,
    lastModified: new Date(),
    changeFrequency: page === "" ? "daily" : "weekly",
    priority: page === "" ? 1.0 : 0.8,
  }));
}
