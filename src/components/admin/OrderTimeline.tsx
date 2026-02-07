"use client";

import {
  Clock,
  CreditCard,
  Truck,
  PackageCheck,
  XCircle,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  label: string;
  status: "completed" | "current" | "upcoming";
  timestamp?: string | null;
  icon: React.ComponentType<{ className?: string }>;
}

interface OrderTimelineProps {
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  paidAt: string | null;
}

const STATUS_ORDER = ["pending", "confirmed", "shipped", "delivered"];

function getTimelineEvents({
  orderStatus,
  paymentStatus,
  createdAt,
  paidAt,
}: OrderTimelineProps): TimelineEvent[] {
  const isCancelled = orderStatus === "cancelled";
  const statusIndex = STATUS_ORDER.indexOf(orderStatus);

  const events: TimelineEvent[] = [
    {
      label: "Order Placed",
      status: "completed",
      timestamp: createdAt,
      icon: Clock,
    },
    {
      label: paymentStatus === "paid" ? "Payment Received" : paymentStatus === "failed" ? "Payment Failed" : "Awaiting Payment",
      status: paymentStatus === "paid" ? "completed" : paymentStatus === "failed" ? "current" : statusIndex >= 1 ? "completed" : "current",
      timestamp: paidAt,
      icon: paymentStatus === "failed" ? AlertCircle : CreditCard,
    },
  ];

  if (isCancelled) {
    events.push({
      label: "Order Cancelled",
      status: "current",
      timestamp: null,
      icon: XCircle,
    });
    return events;
  }

  events.push(
    {
      label: "Shipped",
      status: statusIndex >= 2 ? "completed" : statusIndex === 2 ? "current" : "upcoming",
      timestamp: null,
      icon: Truck,
    },
    {
      label: "Delivered",
      status: statusIndex >= 3 ? "completed" : "upcoming",
      timestamp: null,
      icon: PackageCheck,
    }
  );

  // Fix: if confirmed but not yet shipped, mark confirmed as current
  if (statusIndex === 1) {
    events[2].status = "upcoming";
  }

  return events;
}

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrderTimeline(props: OrderTimelineProps) {
  const events = getTimelineEvents(props);

  return (
    <div className="space-y-0">
      {events.map((event, i) => {
        const Icon = event.icon;
        const isLast = i === events.length - 1;

        return (
          <div key={event.label} className="flex gap-3">
            {/* Timeline dot + connector */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  event.status === "completed" && "bg-emerald-100 text-emerald-600",
                  event.status === "current" && event.label.includes("Cancel") && "bg-red-100 text-red-600",
                  event.status === "current" && event.label.includes("Failed") && "bg-red-100 text-red-600",
                  event.status === "current" && !event.label.includes("Cancel") && !event.label.includes("Failed") && "bg-brand/10 text-brand ring-2 ring-brand/20",
                  event.status === "upcoming" && "bg-surface text-muted"
                )}
              >
                {event.status === "completed" ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "w-0.5 flex-1 min-h-6",
                    event.status === "completed" ? "bg-emerald-200" : "bg-border"
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className={cn("pb-6", isLast && "pb-0")}>
              <p
                className={cn(
                  "text-sm font-medium leading-8",
                  event.status === "upcoming" ? "text-muted" : "text-charcoal"
                )}
              >
                {event.label}
              </p>
              {event.timestamp && (
                <p className="text-xs text-muted">
                  {formatTimestamp(event.timestamp)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
