import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  // Verify auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !["admin", "staff"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const productId = formData.get("productId") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large. Max 10MB." },
      { status: 400 }
    );
  }

  // Generate unique filename
  const ext = file.name.split(".").pop() ?? "jpg";
  const timestamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  const filename = productId
    ? `${productId}/${timestamp}-${rand}.${ext}`
    : `misc/${timestamp}-${rand}.${ext}`;

  const admin = createAdminClient();

  // Upload to Supabase Storage
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await admin.storage
    .from("product-images")
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: `Upload failed: ${uploadError.message}` },
      { status: 500 }
    );
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = admin.storage.from("product-images").getPublicUrl(filename);

  // If productId provided, create product_images record
  let imageRecord = null;
  if (productId) {
    // Get current image count for position
    const { count } = await admin
      .from("product_images")
      .select("id", { count: "exact", head: true })
      .eq("product_id", productId);

    const position = (count ?? 0) + 1;
    const isPrimary = position === 1; // First image is primary

    const { data, error: insertError } = await admin
      .from("product_images")
      .insert({
        product_id: productId,
        url: publicUrl,
        alt_text: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
        position,
        is_primary: isPrimary,
      })
      .select("id, url, alt_text, position, is_primary")
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: `Failed to save image record: ${insertError.message}` },
        { status: 500 }
      );
    }

    imageRecord = data;
  }

  return NextResponse.json({
    url: publicUrl,
    image: imageRecord,
  });
}
