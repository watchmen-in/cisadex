export async function loadOffices() {
  try {
    const res = await fetch('/data/offices.json');
    if (!res.ok) {
      return [];
    }
    return await res.json();
  } catch (err) {
    return [];
  }
}
