export async function onRequest(context) {
  const { request, env } = context;
  const db = env.dayoflove_db;

  const url = new URL(request.url);
  const page = url.searchParams.get("page") || "default";

  try {
    // ================= GET =================
    if (request.method === "GET") {
      const { results } = await db
        .prepare(
          "SELECT id, text, created_at FROM notes WHERE page=? ORDER BY id DESC"
        )
        .bind(page)
        .all();

      return json({ ok: true, notes: results });
    }

    // ================= POST =================
   if (request.method === "POST") {
  const body = await request.json();
  let text = (body.text || "");

  // Emoji dahil her şey UTF-8, burada sadece temizlik yapıyoruz
  text = text.replace(/\r\n/g, "\n").trim();

  // boşsa
  if (!text) return json({ ok: false, error: "empty_text" }, 400);

  // aşırı uzun spam önlemi (emoji de dahil)
  if (text.length > 400) return json({ ok: false, error: "too_long" }, 413);

  await db
    .prepare("INSERT INTO notes (page, text, created_at) VALUES (?, ?, datetime('now'))")
    .bind(page, text)
    .run();

  return json({ ok: true });
}


    // ================= DELETE =================
    if (request.method === "DELETE") {
      const id = url.searchParams.get("id");
      if (!id)
        return json({ ok: false, error: "missing_id" }, 400);

      await db
        .prepare("DELETE FROM notes WHERE id=? AND page=?")
        .bind(id, page)
        .run();

      return json({ ok: true });
    }

    return json({ ok: false, error: "method_not_allowed" }, 405);
  } catch (err) {
    return json(
      { ok: false, error: err.message || "server_error" },
      500
    );
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

