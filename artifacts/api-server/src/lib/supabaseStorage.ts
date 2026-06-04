import { createClient } from "@supabase/supabase-js";

const BUCKET = "photos";

function getClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_SERVICE_KEY"];
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set");
  }
  return createClient(url, key);
}

/**
 * Upload a photo buffer to Supabase Storage.
 * Returns the public URL of the uploaded file.
 */
export async function uploadPhoto(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
): Promise<string> {
  const supabase = getClient();

  const path = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) throw new Error(`Supabase upload error: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Delete a photo from Supabase Storage by its public URL.
 */
export async function deletePhoto(publicUrl: string): Promise<void> {
  const supabase = getClient();
  const url = process.env["SUPABASE_URL"]!;

  const prefix = `${url}/storage/v1/object/public/${BUCKET}/`;
  if (!publicUrl.startsWith(prefix)) return;

  const path = publicUrl.slice(prefix.length);
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw new Error(`Supabase delete error: ${error.message}`);
}
