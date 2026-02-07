import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "full_name, email, phone, address_line1, address_line2, city, postal_code, country"
    )
    .eq("id", user.id)
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to load profile" },
      { status: 500 }
    );
  }

  return NextResponse.json({ profile });
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();

  const updates: Record<string, string | null> = {};

  // Only allow specific fields to be updated
  const allowedFields = [
    "full_name",
    "phone",
    "address_line1",
    "address_line2",
    "city",
    "postal_code",
    "country",
  ];

  for (const field of allowedFields) {
    if (field in body) {
      updates[field] = body[field]?.trim() || null;
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }

  // Also sync name and phone to auth.users metadata
  if (updates.full_name !== undefined || updates.phone !== undefined) {
    const metaUpdates: Record<string, string | null> = {};
    if (updates.full_name !== undefined)
      metaUpdates.full_name = updates.full_name;
    if (updates.phone !== undefined) metaUpdates.phone = updates.phone;

    await supabase.auth.updateUser({ data: metaUpdates });
  }

  return NextResponse.json({ success: true });
}
