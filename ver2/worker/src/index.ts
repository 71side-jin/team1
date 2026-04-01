export interface Env {
  DB: D1Database;
  FILES: R2Bucket;
}

type AnalyzeTextBody = {
  text: string;
  fileName?: string;
  selectedMode?: string;
  page?: string;
};

type ModelType = "multimodal" | "text" | "image" | "video";
type StorageMode = "text" | "image" | "video";
type SelectedMode = "mode1" | "mode2" | "mode3" | "mode4";

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

function buildR2Key(mode: StorageMode, id: string, fileName: string): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const safeName = sanitizeFileName(fileName || `${id}.bin`);
  return `${mode}/${yyyy}/${mm}/${dd}/${id}-${safeName}`;
}

function normalizeSelectedMode(value: string | null | undefined): SelectedMode {
  if (value === "mode1" || value === "mode2" || value === "mode3" || value === "mode4") {
    return value;
  }
  return "mode1";
}

function resolveModelType(
  page: string | null | undefined,
  fallback: "text" | "image" | "video"
): ModelType {
  if (page === "multiModal") {
    return "multimodal";
  }
  return fallback;
}

function buildModelName(modelType: ModelType, selectedMode: SelectedMode): string {
  return `${modelType}-${selectedMode}`;
}

async function insertAnalysis(params: {
  env: Env;
  id: string;
  analyzedAt: string;
  fileName: string;
  mimeType: string;
  modelType: ModelType;
  modelName: string;
  r2Key: string;
  status: "success" | "failed";
  result: string;
}): Promise<void> {
  const {
    env,
    id,
    analyzedAt,
    fileName,
    mimeType,
    modelType,
    modelName,
    r2Key,
    status,
    result,
  } = params;

  await env.DB.prepare(
    `INSERT INTO analyses
      (id, analyzed_at, file_name, mime_type, model_type, model_name, r2_key, status, result)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      analyzedAt,
      fileName,
      mimeType,
      modelType,
      modelName,
      r2Key,
      status,
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
        const page = form.get("page")?.toString();
        const selectedMode = normalizeSelectedMode(form.get("selectedMode")?.toString());

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

        const modelType = resolveModelType(page, mode);
        const modelName = buildModelName(modelType, selectedMode);
        const result = "RESULT";

        await env.FILES.put(r2Key, await file.arrayBuffer(), {
          httpMetadata: {
            contentType: mimeType,
          },
          customMetadata: {
            originalName: fileName,
            mode,
            page: page ?? "",
            selectedMode,
            analyzedAt,
          },
        });

        await insertAnalysis({
          env,
          id,
          analyzedAt,
          fileName,
          mimeType,
          modelType,
          modelName,
          r2Key,
          status: "success",
          result,
        });

        return json(
          {
            ok: true,
            id,
            modelType,
            modelName,
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
        const selectedMode = normalizeSelectedMode(body.selectedMode);
        const page = body.page;

        if (!text) {
          return json({ ok: false, message: "text is required" }, 400, origin);
        }

        const id = makeId();
        const analyzedAt = nowIso();
        const fileName = sanitizeFileName(body.fileName || `${id}.txt`);
        const mimeType = "text/plain";
        const r2Key = buildR2Key("text", id, fileName);

        const modelType = resolveModelType(page, "text");
        const modelName = buildModelName(modelType, selectedMode);
        const result = "RESULT";

        await env.FILES.put(r2Key, text, {
          httpMetadata: {
            contentType: "text/plain; charset=utf-8",
          },
          customMetadata: {
            originalName: fileName,
            mode: "text",
            page: page ?? "",
            selectedMode,
            analyzedAt,
          },
        });

        await insertAnalysis({
          env,
          id,
          analyzedAt,
          fileName,
          mimeType,
          modelType,
          modelName,
          r2Key,
          status: "success",
          result,
        });

        return json(
          {
            ok: true,
            id,
            modelType,
            modelName,
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