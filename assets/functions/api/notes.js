
export async function onRequest(context) {
  const { request, env } = context;

  // CORS (tarayıcı kaprisleri)
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  const url = new URL(request.url);
  const page = (url.searchParams.get("page") || "default").slice(0, 64);

  const json = (obj, status = 200) =>
    new Response(JSON.stringify(obj), {
      status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
    });

  // GET: notları getir
  if (request.method === "GET") {
    const limit = Math.min(200, Math.max(1, Number(url.searchParams.get("limit") || 120)));
    const { results } = await env.DB
      .prepare(
        "SELECT id, text, created_at FROM notes WHERE page=? ORDER BY created_at DESC LIMIT ?"
      )
      .bind(page, limit)
      .all();

    return json({ ok: true, page, notes: results || [] });
  }

  // POST: not ekle
  if (request.method === "POST") {
    const body = await request.json().catch(() => null);
    const text = String(body?.text ?? "").trim();

    if (!text) return json({ ok: false, error: "empty" }, 400);
    if (text.length > 800) return json({ ok: false, error: "too_long" }, 400);

    const id = crypto.randomUUID();
    const created_at = Date.now();

    await env.DB
      .prepare("INSERT INTO notes (id, page, text, created_at) VALUES (?, ?, ?, ?)")
      .bind(id, page, text, created_at)
      .run();

    return json({ ok: true, id, created_at });
  }

  // DELETE: tek not sil
  if (request.method === "DELETE") {
    const id = (url.searchParams.get("id") || "").trim();
    if (!id) return json({ ok: false, error: "missing_id" }, 400);

    await env.DB
      .prepare("DELETE FROM notes WHERE page=? AND id=?")
      .bind(page, id)
      .run();

    return json({ ok: true });
  }

  return json({ ok: false, error: "method_not_al
::contentReference[oaicite:0]{index=0}
