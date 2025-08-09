export async function fetchFeeds() {
  try {
    const res = await fetch("/rss"); // Calls the new Pages Function
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
