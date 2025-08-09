export async function fetchFeeds() {
  try {
    const res = await fetch("/rss");
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
