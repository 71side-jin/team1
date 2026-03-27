export interface Env {
  DB: D1Database;
  FILES: R2Bucket;
}

type AnalyzeTextBody = {
  text: string;
  fileName?: string;
};

function buildCorsHeaders(origin: string | null): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
  };
}

function json(data: unknown, status = 200, origin: string | null = null): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: buildCorsHeaders(origin),
  });
}

function nowIso(): string {
  return new Date().toISOString();
}

function makeId(): string {
  return crypto.randomUUID();
}

function sanitizeFileName(fileName: string): string {
  return fileName
    .trim()
    .replace(/[^\w.\-가-힣() ]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function buildR2Key(mode: "text" | "image" | "video", id: string, fileName: string): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const safeName = sanitizeFileName(fileName || `${id}.bin`);
  return `${mode}/${yyyy}/${mm}/${dd}/${id}-${safeName}`;
}

async function insertAnalysis(params: {
  env: Env;
  id: string;
  mode: "text" | "image" | "video";
  fileName: string;
  fileSize: number;
  mimeType: string;
  r2Key: string;
  analyzedAt: string;
  result: string;
}): Promise<void> {
  const {
    env,
    id,
    mode,
    fileName,
    fileSize,
    mimeType,
    r2Key,
    analyzedAt,
    result,
  } = params;

  await env.DB.prepare(
    `INSERT INTO analyses
      (id, mode, file_name, file_size, mime_type, r2_key, analyzed_at, status, result)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      mode,
      fileName,
      fileSize,
      mimeType,
      r2Key,
      analyzedAt,
      "success",
      result
    )
    .run();
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: buildCorsHeaders(origin),
      });
    }

    if (request.method === "GET" && url.pathname === "/api/health") {
      return json({ ok: true }, 200, origin);
    }

    if (request.method === "POST" && url.pathname === "/api/analyze-media") {
      try {
        const form = await request.formData();
        const file = form.get("file");
        const mode = form.get("mode");

        if (!(file instanceof File)) {
          return json({ ok: false, message: "file is required" }, 400, origin);
        }

        if (mode !== "image" && mode !== "video") {
          return json({ ok: false, message: "mode must be image or video" }, 400, origin);
        }

        const id = makeId();
        const analyzedAt = nowIso();
        const fileName = sanitizeFileName(file.name || `${id}.bin`);
        const mimeType = file.type || "application/octet-stream";
        const r2Key = buildR2Key(mode, id, fileName);
        const result = "RESULT";

        await env.FILES.put(r2Key, await file.arrayBuffer(), {
          httpMetadata: {
            contentType: mimeType,
          },
          customMetadata: {
            originalName: fileName,
            mode,
            analyzedAt,
          },
        });

        await insertAnalysis({
          env,
          id,
          mode,
          fileName,
          fileSize: file.size,
          mimeType,
          r2Key,
          analyzedAt,
          result,
        });

        return json(
          {
            ok: true,
            id,
            mode,
            fileName,
            result,
          },
          200,
          origin
        );
      } catch (error) {
        console.error(error);
        return json({ ok: false, message: "media analyze failed" }, 500, origin);
      }
    }

    if (request.method === "POST" && url.pathname === "/api/analyze-text") {
      try {
        const body = (await request.json()) as AnalyzeTextBody;
        const text = (body.text || "").trim();

        if (!text) {
          return json({ ok: false, message: "text is required" }, 400, origin);
        }

        const id = makeId();
        const analyzedAt = nowIso();
        const fileName = sanitizeFileName(body.fileName || `${id}.txt`);
        const r2Key = buildR2Key("text", id, fileName);
        const fileSize = new TextEncoder().encode(text).length;
        const result = "RESULT";

        await env.FILES.put(r2Key, text, {
          httpMetadata: {
            contentType: "text/plain; charset=utf-8",
          },
          customMetadata: {
            originalName: fileName,
            mode: "text",
            analyzedAt,
          },
        });

        await insertAnalysis({
          env,
          id,
          mode: "text",
          fileName,
          fileSize,
          mimeType: "text/plain",
          r2Key,
          analyzedAt,
          result,
        });

        return json(
          {
            ok: true,
            id,
            mode: "text",
            fileName,
            result,
          },
          200,
          origin
        );
      } catch (error) {
        console.error(error);
        return json({ ok: false, message: "text analyze failed" }, 500, origin);
      }
    }

    return json({ ok: false, message: "Not Found" }, 404, origin);
  },
};