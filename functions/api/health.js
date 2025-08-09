export const onRequestGet = async ({ env }) => {
  const { results } = await env.DB.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
  ).all();
  return new Response(JSON.stringify(results || []), {
    headers: { 'content-type': 'application/json' }
  });
};
