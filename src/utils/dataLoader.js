export async function loadOffices() {
  const res = await fetch('/data/offices.json');
  return res.json();
}
