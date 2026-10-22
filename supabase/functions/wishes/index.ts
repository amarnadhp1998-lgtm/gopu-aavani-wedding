const siteOrigin = "https://amarnadhp1998-lgtm.github.io";
const corsHeaders = {
  "Access-Control-Allow-Origin": siteOrigin,
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "Vary": "Origin",
};

function respond(payload: unknown, status = 200, extraHeaders: HeadersInit = {}) {
  return new Response(JSON.stringify(payload), { status, headers: { ...corsHeaders, ...extraHeaders } });
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (request.headers.get("origin") !== siteOrigin) return respond({ error: "This origin is not allowed." }, 403);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return respond({ error: "Wishes are not configured yet." }, 503);

  if (request.method === "GET") {
    try {
      const requestedOffset = Number(new URL(request.url).searchParams.get("offset") || 0);
      if (!Number.isSafeInteger(requestedOffset) || requestedOffset < 0 || requestedOffset > 100000) return respond({ error: "Invalid page." }, 400);
      const result = await fetch(`${supabaseUrl}/rest/v1/wedding_wishes?select=id,name,message,created_at&status=eq.approved&order=created_at.desc&limit=100&offset=${requestedOffset}`, {
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, Prefer: "count=exact" },
      });
      if (!result.ok) return respond({ error: "Could not load the wishes." }, 502);
      const wishes = await result.json();
      const range = result.headers.get("content-range");
      const total = range ? Number(range.split("/").at(-1)) : wishes.length;
      return respond({ wishes, total: Number.isFinite(total) ? total : wishes.length, offset: requestedOffset });
    } catch {
      return respond({ error: "Could not load the wishes." }, 502);
    }
  }

  if (request.method !== "POST") return respond({ error: "Method not allowed." }, 405, { Allow: "GET, POST, OPTIONS" });
  let body: Record<string, unknown>;
  try {
    const reader = request.body?.getReader();
    if (!reader) return respond({ error: "Please send a valid wish." }, 400);
    const chunks: Uint8Array[] = [];
    let byteLength = 0;
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      byteLength += part.value.byteLength;
      if (byteLength > 6000) {
        await reader.cancel();
        return respond({ error: "That message is too large. Please shorten it." }, 413);
      }
      chunks.push(part.value);
    }
    const bytes = new Uint8Array(byteLength);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    body = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return respond({ error: "Please send a valid wish." }, 400);
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const submissionId = typeof body.submissionId === "string" ? body.submissionId : "";
  const turnstileToken = typeof body.turnstileToken === "string" ? body.turnstileToken : "";
  const consent = body.consent === true;
  const honeypot = typeof body.website === "string" ? body.website : "";
  if (honeypot) return respond({ error: "Please check the form and try again." }, 400);
  if (!name || name.length > 60 || !message || message.length > 500 || !consent || !/^[\da-f]{8}-[\da-f]{4}-[1-8][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(submissionId)) {
    return respond({ error: "Please check the name and message length, then try again." }, 400);
  }
  if (!turnstileToken) return respond({ error: "Please complete the security check." }, 400);

  const turnstileSecret = Deno.env.get("TURNSTILE_SECRET_KEY");
  if (!turnstileSecret) return respond({ error: "The security check is not configured yet." }, 503);
  try {
    const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: turnstileSecret, response: turnstileToken }),
    });
    const proof = await verification.json();
    if (!verification.ok || proof.success !== true || proof.hostname !== "amarnadhp1998-lgtm.github.io") {
      return respond({ error: "The security check expired. Please try again." }, 400);
    }
  } catch {
    return respond({ error: "The security check could not be verified. Please retry." }, 502);
  }

  try {
    const saved = await fetch(`${supabaseUrl}/rest/v1/wedding_wishes`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ submission_id: submissionId, name, message, status: "pending" }),
    });
    if (saved.status === 409) return respond({ saved: true, pendingReview: true }, 200);
    if (!saved.ok) return respond({ error: "We couldn’t save your wish just now. Please retry." }, 502);
    return respond({ saved: true, pendingReview: true }, 201);
  } catch {
    return respond({ error: "We couldn’t reach the wishes service. Please retry." }, 502);
  }
});
