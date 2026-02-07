"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/admin/ui/Toast";
import { formatPrice } from "@/lib/utils";
import type { AdminOrder } from "@/app/admin/actions";

interface Props {
  children: React.ReactNode;
  onNewOrder?: (order: AdminOrder) => void;
}

export function RealtimeOrdersWrapper({ children, onNewOrder }: Props) {
  const { toast } = useToast();
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const supabase = createClient();
  const onNewOrderRef = useRef(onNewOrder);
  onNewOrderRef.current = onNewOrder;

  useEffect(() => {
    const channel = supabase
      .channel("admin-orders-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const row = payload.new as {
            id: string;
            order_number: string;
            customer_email: string;
            status: string;
            payment_status: string;
            total: number;
            created_at: string;
          };

          const newOrder: AdminOrder = {
            id: row.id,
            order_number: row.order_number,
            customer_email: row.customer_email,
            status: row.status,
            payment_status: row.payment_status,
            total: row.total,
            created_at: row.created_at,
          };

          // Flash the new order ID for glow effect
          setNewOrderIds((prev) => new Set(prev).add(row.id));
          setTimeout(() => {
            setNewOrderIds((prev) => {
              const next = new Set(prev);
              next.delete(row.id);
              return next;
            });
          }, 3000);

          toast({
            type: "success",
            message: `New order #${row.order_number} — ${formatPrice(row.total)}`,
          });

          onNewOrderRef.current?.(newOrder);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, toast]);

  return (
    <div data-new-order-ids={JSON.stringify([...newOrderIds])}>
      {newOrderIds.size > 0 && (
        <style>{`
          ${[...newOrderIds]
            .map(
              (id) =>
                `tr[data-order-id="${id}"] { animation: glow-pulse 2s ease-out; }`
            )
            .join("\n")}
          @keyframes glow-pulse {
            0% { background-color: rgba(255, 88, 13, 0.12); }
            100% { background-color: transparent; }
          }
        `}</style>
      )}
      {children}
    </div>
  );
}
