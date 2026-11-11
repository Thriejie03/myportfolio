import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getPortfolioAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const imageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

const documentTypes = new Map([
  ["application/pdf", "pdf"],
  ["application/msword", "doc"],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx"],
]);
const videoTypes = new Map([
  ["video/mp4", "mp4"],
  ["video/webm", "webm"],
  ["video/quicktime", "mov"],
]);

const maximumImageOrDocumentSize = 5 * 1024 * 1024;
const maximumVideoSize = 500 * 1024 * 1024;

export async function POST(request: Request) {
  const supabase = await getPortfolioAdminClient();
  if (!supabase) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");
  const collection = formData.get("collection");
  if (!(file instanceof File) || !["projects", "certificates", "homepage", "hobbies"].includes(String(collection))) {
    return NextResponse.json({ error: "Choose a file and a valid content type." }, { status: 400 });
  }

  const imageExtension = imageTypes.get(file.type);
  const documentExtension = documentTypes.get(file.type);
  const videoExtension = videoTypes.get(file.type);

  if (file.size === 0 || file.size > (videoExtension ? maximumVideoSize : maximumImageOrDocumentSize)) {
    return NextResponse.json({
      error: videoExtension ? "Videos must be smaller than 500 MB." : "Files must be smaller than 5 MB.",
    }, { status: 400 });
  }

  if (imageExtension) {
    const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const isValidImage =
      (file.type === "image/jpeg" && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) ||
      (file.type === "image/png" && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) ||
      (file.type === "image/webp" &&
        String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
        String.fromCharCode(...bytes.slice(8, 12)) === "WEBP");
    if (!isValidImage) {
      return NextResponse.json({ error: "The file content does not match a supported image format." }, { status: 400 });
    }

    const path = `${collection}/${randomUUID()}.${imageExtension}`;
    const { error } = await supabase.storage
      .from("portfolio-media")
      .upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });

    if (error) {
      console.error("Unable to upload portfolio image:", error.message);
      return NextResponse.json({ error: "Unable to upload image. Check the Storage setup and try again." }, { status: 503 });
    }

    const { data } = supabase.storage.from("portfolio-media").getPublicUrl(path);
    return NextResponse.json({ imageUrl: data.publicUrl });
  }

  if (documentExtension) {
    const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());
    const isValidDocument =
      (file.type === "application/pdf" &&
        String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-") ||
      ((file.type === "application/msword" ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") &&
        // DOC: D0 CF 11 E0 A1 B1 1A E1 (OLE2) or ZIP (PK) for docx
        ((bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0) ||
          (bytes[0] === 0x50 && bytes[1] === 0x4b)));
    if (!isValidDocument) {
      return NextResponse.json({ error: "The file content does not match a supported document format." }, { status: 400 });
    }

    const safeCollection = String(collection);
    const path = `${safeCollection}/${randomUUID()}.${documentExtension}`;
    const { error } = await supabase.storage
      .from("portfolio-media")
      .upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });

    if (error) {
      console.error("Unable to upload portfolio document:", error.message);
      return NextResponse.json({ error: "Unable to upload document. Check the Storage setup and try again." }, { status: 503 });
    }

    const { data } = supabase.storage.from("portfolio-media").getPublicUrl(path);
    return NextResponse.json({ documentUrl: data.publicUrl });
  }

  if (videoExtension) {
    if (collection !== "projects") {
      return NextResponse.json({ error: "Video uploads are available for projects only." }, { status: 400 });
    }

    const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const isValidVideo =
      (file.type === "video/mp4" && bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) ||
      (file.type === "video/webm" && String.fromCharCode(...bytes.slice(0, 4)) === "\x1a\x45\xdf\xa3") ||
      (file.type === "video/quicktime" && bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70);
    if (!isValidVideo) {
      return NextResponse.json({ error: "The file content does not match a supported video format." }, { status: 400 });
    }

    const path = `${collection}/${randomUUID()}.${videoExtension}`;
    const { error } = await supabase.storage
      .from("portfolio-media")
      .upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });

    if (error) {
      console.error("Unable to upload portfolio video:", error.message);
      return NextResponse.json({ error: "Unable to upload video. If the file is too large for Supabase, use a hosted video link instead." }, { status: 503 });
    }

    const { data } = supabase.storage.from("portfolio-media").getPublicUrl(path);
    return NextResponse.json({ videoUrl: data.publicUrl });
  }

  return NextResponse.json({ error: "Upload a JPG, PNG, WebP image, PDF/Word document, MP4, WebM, or MOV video." }, { status: 400 });
}
