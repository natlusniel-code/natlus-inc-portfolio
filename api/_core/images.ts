import { q } from "./db.js";
import { HttpError } from "./errors.js";

const MAX_BYTES = 2_500_000; // ~2.4 MB
const ALLOWED = /^data:image\/(png|jpe?g|webp|gif);base64,/i;

export interface BlobRow {
  id: number;
  data: string;
  content_type: string;
}

export async function storeImage(dataUrl: string): Promise<{ url: string }> {
  if (typeof dataUrl !== "string" || !ALLOWED.test(dataUrl)) {
    throw new HttpError(400, "Please upload a PNG, JPEG, WebP or GIF image.");
  }
  const pure = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const approxBytes = Math.floor((pure.length * 3) / 4);
  if (approxBytes > MAX_BYTES) throw new HttpError(400, "Image is too large (max 2.4 MB).");
  const mime = dataUrl.match(/^data:image\/([a-zA-Z0-9.+-]+);/)?.[1] ?? "png";
  const rows = await q<{ id: number }>(
    `INSERT INTO image_blobs (data, content_type) VALUES ($1, $2) RETURNING id`,
    [pure, mime],
  );
  return { url: `/api/images/${rows[0].id}` };
}

export async function getImage(id: number): Promise<BlobRow | null> {
  const rows = await q<BlobRow>(`SELECT id, data, content_type FROM image_blobs WHERE id = $1`, [id]);
  return rows[0] ?? null;
}
