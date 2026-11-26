import { arr, at, httpUrl, obj, str } from "../json.js";
import type { NewsItem } from "../types.js";

function item(raw: unknown): NewsItem | null {
  const article = obj(raw);
  const headline = str(article.headline);
  const url = httpUrl(at(article, "links", "web", "href"));
  if (!headline || !url) return null;
  const image = obj(arr(article.images)[0]);
  const imageUrl = httpUrl(image.url);
  return {
    id: str(article.id) ?? url,
    headline,
    description: str(article.description),
    published: str(article.published),
    url,
    image: imageUrl ? { url: imageUrl, alt: str(image.alt) ?? str(image.caption) ?? "" } : null,
    byline: str(article.byline),
  };
}

export function normalizeNews(raw: unknown): NewsItem[] {
  const seen = new Set<string>();
  return arr(obj(raw).articles)
    .map(item)
    .filter((news): news is NewsItem => {
      if (!news || seen.has(news.url)) return false;
      seen.add(news.url);
      return true;
    });
}
