import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { guard } from "@/lib/api";
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX = 5 * 1024 * 1024;
// Returns a short-lived signed URL; the browser uploads straight to persistent object storage.
export const POST = (req: Request) => guard(async () => {
  const { contentType, size } = await req.json();
  if (!EXT[contentType]) return NextResponse.json({ error: "Only JPG, PNG or WebP images are allowed" }, { status: 400 });
  if (!Number.isInteger(size) || size <= 0 || size > MAX) return NextResponse.json({ error: "Image must be under 5 MB" }, { status: 400 });
  const { STORAGE_BUCKET: Bucket, STORAGE_ENDPOINT, STORAGE_REGION, STORAGE_ACCESS_KEY, STORAGE_SECRET_KEY, STORAGE_PUBLIC_URL } = process.env;
  if (!Bucket || !STORAGE_ACCESS_KEY || !STORAGE_SECRET_KEY || !STORAGE_PUBLIC_URL)
    return NextResponse.json({ error: "Image storage is not configured. See README > Image storage." }, { status: 503 });
  const s3 = new S3Client({ region: STORAGE_REGION || "auto", endpoint: STORAGE_ENDPOINT || undefined, credentials: { accessKeyId: STORAGE_ACCESS_KEY, secretAccessKey: STORAGE_SECRET_KEY } });
  const Key = `products/${randomUUID()}.${EXT[contentType]}`;
  const uploadUrl = await getSignedUrl(s3, new PutObjectCommand({ Bucket, Key, ContentType: contentType, ContentLength: size }), { expiresIn: 60 });
  return NextResponse.json({ uploadUrl, publicUrl: `${STORAGE_PUBLIC_URL.replace(/\/$/, "")}/${Key}` });
});
