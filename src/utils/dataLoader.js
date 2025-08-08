export async function loadOffices() {
  const res = await fetch('/data/offices_v0.5.min.json');
  return res.json();
}
