"use server";

import { createClient } from "@/lib/supabase/server";

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

// --- Dashboard Chart Data ---

export interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

export interface OrderStatusCount {
  status: string;
  count: number;
}

export async function loadDashboardChartData(
  days: number = 30
): Promise<DailyRevenue[]> {
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data: orders } = await supabase
    .from("orders")
    .select("total, payment_status, created_at")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true });

  const dailyMap = new Map<string, { revenue: number; orders: number }>();
  for (const order of orders || []) {
    const day = order.created_at.slice(0, 10);
    const existing = dailyMap.get(day) || { revenue: 0, orders: 0 };
    existing.orders += 1;
    if (order.payment_status === "paid" || order.payment_status === "completed") {
      existing.revenue += order.total || 0;
    }
    dailyMap.set(day, existing);
  }

  // Fill in missing days with zeros
  const result: DailyRevenue[] = [];
  const current = new Date(since);
  const today = new Date();
  while (current <= today) {
    const key = current.toISOString().slice(0, 10);
    const data = dailyMap.get(key) || { revenue: 0, orders: 0 };
    result.push({ date: key, ...data });
    current.setDate(current.getDate() + 1);
  }

  return result;
}

export async function loadOrderStatusDistribution(): Promise<
  OrderStatusCount[]
> {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("status");

  const counts = new Map<string, number>();
  for (const order of orders || []) {
    counts.set(order.status, (counts.get(order.status) || 0) + 1);
  }

  return Array.from(counts.entries()).map(([status, count]) => ({
    status,
    count,
  }));
}

// --- Dashboard Activity Feed ---

export interface ActivityItem {
  type: "order" | "payment" | "status" | "stock" | "subscriber";
  description: string;
  timestamp: string;
}

export async function loadDashboardActivity(): Promise<ActivityItem[]> {
  const supabase = await createClient();
  const items: ActivityItem[] = [];

  // Recent orders (last 7 days)
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const { data: recentOrders } = await supabase
    .from("orders")
    .select("order_number, customer_email, status, payment_status, total, created_at")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false })
    .limit(15);

  for (const order of recentOrders || []) {
    items.push({
      type: "order",
      description: `New order #${order.order_number} from ${order.customer_email}`,
      timestamp: order.created_at,
    });

    if (order.payment_status === "paid" || order.payment_status === "completed") {
      items.push({
        type: "payment",
        description: `Payment received for #${order.order_number}`,
        timestamp: order.created_at,
      });
    }

    if (order.status === "shipped") {
      items.push({
        type: "status",
        description: `Order #${order.order_number} marked as shipped`,
        timestamp: order.created_at,
      });
    }
  }

  // Low stock alerts
  const { data: lowStock } = await supabase
    .from("products")
    .select("title, inventory_count")
    .lte("inventory_count", 5)
    .gt("inventory_count", -1)
    .eq("status", "active")
    .limit(3);

  for (const product of lowStock || []) {
    items.push({
      type: "stock",
      description: `${product.title} is low on stock (${product.inventory_count} left)`,
      timestamp: new Date().toISOString(),
    });
  }

  // Recent subscribers
  const { data: recentSubs } = await supabase
    .from("newsletter_subscribers")
    .select("email, created_at")
    .order("created_at", { ascending: false })
    .limit(3);

  for (const sub of recentSubs || []) {
    items.push({
      type: "subscriber",
      description: `${sub.email} subscribed to newsletter`,
      timestamp: sub.created_at,
    });
  }

  // Sort by timestamp and return top 8
  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return items.slice(0, 8);
}

// --- Dashboard Sparkline Data ---

export async function loadDashboardSparklines(): Promise<{
  orders: number[];
  revenue: number[];
  subscribers: number[];
}> {
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - 14);

  const { data: orders } = await supabase
    .from("orders")
    .select("total, payment_status, created_at")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true });

  // Aggregate by day
  const dailyOrders = new Map<string, number>();
  const dailyRevenue = new Map<string, number>();
  for (const order of orders || []) {
    const day = order.created_at.slice(0, 10);
    dailyOrders.set(day, (dailyOrders.get(day) || 0) + 1);
    if (order.payment_status === "paid" || order.payment_status === "completed") {
      dailyRevenue.set(day, (dailyRevenue.get(day) || 0) + (order.total || 0));
    }
  }

  // Fill 14 days
  const orderArr: number[] = [];
  const revenueArr: number[] = [];
  const current = new Date(since);
  const today = new Date();
  while (current <= today) {
    const key = current.toISOString().slice(0, 10);
    orderArr.push(dailyOrders.get(key) || 0);
    revenueArr.push(dailyRevenue.get(key) || 0);
    current.setDate(current.getDate() + 1);
  }

  // Subscribers: count by day over 14 days
  const { data: subs } = await supabase
    .from("newsletter_subscribers")
    .select("created_at")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true });

  const dailySubs = new Map<string, number>();
  for (const sub of subs || []) {
    const day = sub.created_at.slice(0, 10);
    dailySubs.set(day, (dailySubs.get(day) || 0) + 1);
  }

  const subArr: number[] = [];
  const current2 = new Date(since);
  while (current2 <= today) {
    const key = current2.toISOString().slice(0, 10);
    subArr.push(dailySubs.get(key) || 0);
    current2.setDate(current2.getDate() + 1);
  }

  return { orders: orderArr, revenue: revenueArr, subscribers: subArr };
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
