async function loadJson(name) {
  try {
    const url = `${import.meta.env.BASE_URL}data/${name}.json`;
    const res = await fetch(url);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function loadOffices() {
  return loadJson('offices');
}

export async function loadEntities() {
  const [offices, agencies, labs, isacs] = await Promise.all([
    loadJson('offices'),
    loadJson('agencies'),
    loadJson('labs'),
    loadJson('isacs')
  ]);

  function normalize(arr, entity) {
    return arr.map((d) => ({
      ...d,
      entity,
      name: d.name ?? d.office_name,
      lon: Number(d.lon ?? d.lng),
      lat: Number(d.lat)
    }));
  }

  return [
    ...normalize(offices, 'field_office'),
    ...normalize(agencies, 'agency'),
    ...normalize(labs, 'lab'),
    ...normalize(isacs, 'isac')
  ];
}
