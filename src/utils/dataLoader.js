export async function loadOffices() {
  try {
    const url = `${import.meta.env.BASE_URL}data/offices.json`;
    const res = await fetch(url);
    if (!res.ok) {
      return [];
    }
    return await res.json();
  } catch (err) {
    return [];
  }
}
