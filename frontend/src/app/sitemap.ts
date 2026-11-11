import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

/** Public, indexable routes only. Dashboard and interview routes are excluded. */
const publicRoutes: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/features", priority: 0.8, changeFrequency: "monthly" },
  { path: "/how-it-works", priority: 0.8, changeFrequency: "monthly" },
  { path: "/pricing", priority: 0.9, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.4, changeFrequency: "yearly" },
  { path: "/ai-mock-interview", priority: 0.9, changeFrequency: "weekly" },
  { path: "/resume-based-interview", priority: 0.9, changeFrequency: "weekly" },
  { path: "/technical-interview", priority: 0.9, changeFrequency: "weekly" },
  { path: "/hr-interview", priority: 0.9, changeFrequency: "weekly" },
  { path: "/coding-interview", priority: 0.9, changeFrequency: "weekly" },
  { path: "/interview-for-freshers", priority: 0.8, changeFrequency: "weekly" },
  { path: "/interview-in-hindi", priority: 0.8, changeFrequency: "weekly" },
  { path: "/interview-in-hinglish", priority: 0.8, changeFrequency: "weekly" },
  { path: "/interview-questions", priority: 0.8, changeFrequency: "weekly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  // Fixed so the sitemap stays prerenderable under Cache Components.
  const lastModified = new Date("2026-11-10T00:00:00.000Z");

  return publicRoutes.map((route) => ({
    url: `${siteConfig.url}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
