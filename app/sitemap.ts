import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.clipsage.org",
      lastModified: new Date(),
    },

    // 🔹 Blog Posts
    {
      url: "https://www.clipsage.org/blog/how-to-search-inside-youtube-videos",
      lastModified: new Date(),
    },
    {
      url: "https://www.clipsage.org/blog/how-to-find-clips-from-podcasts",
      lastModified: new Date(),
    },
    {
      url: "https://www.clipsage.org/blog/content-repurposing-for-creators",
      lastModified: new Date(),
    },
    {
      url: "https://www.clipsage.org/blog/best-way-to-find-youtube-clips",
      lastModified: new Date(),
    },
    {
      url: "https://www.clipsage.org/blog/how-to-find-a-specific-quote-in-a-youtube-video",
      lastModified: new Date(),
    },
    {
      url: "https://www.clipsage.org/blog/best-way-to-find-quotes-in-long-youtube-videos",
      lastModified: new Date(),
    },
  ];
}