"use server";

import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

const ADMIN_PER_PAGE = 50;

// --- Admin Products ---

export interface AdminProduct {
  id: string;
  title: string;
  vendor: string | null;
  price: number;
  inventory_count: number;
  status: string;
  created_at: string;
  primaryImage: { url: string; alt_text: string | null } | null;
}

export async function loadAdminProducts(params: {
  page: number;
  q?: string;
  status?: string;
}): Promise<{ items: AdminProduct[]; hasMore: boolean }> {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      "id, title, vendor, price, inventory_count, status, created_at, product_images(url, alt_text, is_primary)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (params.q) {
    query = query.ilike("title", `%${params.q}%`);
  }
  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  const offset = (params.page - 1) * ADMIN_PER_PAGE;
  query = query.range(offset, offset + ADMIN_PER_PAGE - 1);

  const { data: products, count } = await query;
  const totalCount = count || 0;

  const items: AdminProduct[] = (products || []).map((p) => {
    const images = (p.product_images as { url: string; alt_text: string | null; is_primary: boolean }[]) || [];
    const primary = images.find((i) => i.is_primary) ?? images[0] ?? null;
    return {
      id: p.id,
      title: p.title,
      vendor: p.vendor,
      price: p.price,
      inventory_count: p.inventory_count,
      status: p.status,
      created_at: p.created_at,
      primaryImage: primary ? { url: primary.url, alt_text: primary.alt_text } : null,
    };
  });

  return {
    items,
    hasMore: offset + items.length < totalCount,
  };
}

// --- Admin Orders ---

export interface AdminOrder {
  id: string;
  order_number: string;
  customer_email: string;
  status: string;
  payment_status: string;
  total: number;
  created_at: string;
}

export async function loadAdminOrders(params: {
  page: number;
  q?: string;
  status?: string;
  payment?: string;
}): Promise<{ items: AdminOrder[]; hasMore: boolean }> {
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select(
      "id, order_number, customer_email, status, payment_status, total, created_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (params.status) {
    query = query.eq("status", params.status);
  }
  if (params.payment) {
    query = query.eq("payment_status", params.payment);
  }
  if (params.q) {
    query = query.or(
      `order_number.ilike.%${params.q}%,customer_email.ilike.%${params.q}%`
    );
  }

  const offset = (params.page - 1) * ADMIN_PER_PAGE;
  query = query.range(offset, offset + ADMIN_PER_PAGE - 1);

  const { data: orders, count } = await query;
  const totalCount = count || 0;

  return {
    items: (orders || []) as AdminOrder[],
    hasMore: offset + (orders?.length || 0) < totalCount,
  };
}

// --- Admin Customers ---

export interface AdminCustomer {
  email: string;
  name: string | null;
  phone: string | null;
  orderCount: number;
  totalSpent: number;
  lastOrder: string | null;
}

export async function loadAdminCustomers(params: {
  page: number;
}): Promise<{ items: AdminCustomer[]; hasMore: boolean }> {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select(
      "customer_email, shipping_address, customer_phone, total, created_at"
    )
    .order("created_at", { ascending: false });

  // Aggregate by email
  const customerMap = new Map<string, AdminCustomer>();
  for (const order of orders || []) {
    const email = order.customer_email;
    const addr = order.shipping_address as Record<string, string> | null;
    const existing = customerMap.get(email);

    if (existing) {
      existing.orderCount += 1;
      existing.totalSpent += order.total || 0;
      if (!existing.name && addr?.name) existing.name = addr.name;
      if (!existing.phone && order.customer_phone) existing.phone = order.customer_phone;
    } else {
      customerMap.set(email, {
        email,
        name: addr?.name || null,
        phone: order.customer_phone || null,
        orderCount: 1,
        totalSpent: order.total || 0,
        lastOrder: order.created_at,
      });
    }
  }

  const allCustomers = Array.from(customerMap.values()).sort(
    (a, b) => b.totalSpent - a.totalSpent
  );

  const offset = (params.page - 1) * ADMIN_PER_PAGE;
  const slice = allCustomers.slice(offset, offset + ADMIN_PER_PAGE);

  return {
    items: slice,
    hasMore: offset + slice.length < allCustomers.length,
  };
}
