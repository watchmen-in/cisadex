export async function fetchFeeds() {
  try {
    const res = await fetch("/rss"); // Cloudflare Pages Function
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
