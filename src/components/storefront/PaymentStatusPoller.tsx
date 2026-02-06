"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

interface PaymentStatusPollerProps {
  orderId: string;
  initialStatus: string;
}

export default function PaymentStatusPoller({
  orderId,
  initialStatus,
}: PaymentStatusPollerProps) {
  const [status, setStatus] = useState(initialStatus);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Don't poll if already in a terminal state
    if (status === "paid" || status === "failed" || status === "refunded") {
      return;
    }

    const poll = async () => {
      try {
        const res = await fetch(
          `/api/checkout/status?orderId=${encodeURIComponent(orderId)}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data.paymentStatus && data.paymentStatus !== status) {
          setStatus(data.paymentStatus);
          // Stop polling on terminal states
          if (
            data.paymentStatus === "paid" ||
            data.paymentStatus === "failed" ||
            data.paymentStatus === "refunded"
          ) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }
        }
      } catch {
        // Silently ignore polling errors
      }
    };

    // Poll immediately, then every 3 seconds
    poll();
    intervalRef.current = setInterval(poll, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [orderId, status]);

  if (status === "paid") {
    return (
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" strokeWidth={1.5} />
        <div>
          <p className="text-[14px] font-semibold text-green-800">
            Payment confirmed
          </p>
          <p className="text-[13px] text-green-600">
            Your payment has been received successfully.
          </p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" strokeWidth={1.5} />
        <div>
          <p className="text-[14px] font-semibold text-red-800">
            Payment failed
          </p>
          <p className="text-[13px] text-red-600">
            There was an issue with your payment. Please contact us at
            info@elektropolis.mt for assistance.
          </p>
        </div>
      </div>
    );
  }

  // Pending / processing
  return (
    <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
      <Loader2 className="w-5 h-5 text-amber-600 flex-shrink-0 animate-spin" strokeWidth={1.5} />
      <div>
        <p className="text-[14px] font-semibold text-amber-800">
          Processing payment...
        </p>
        <p className="text-[13px] text-amber-600">
          We&apos;re confirming your payment. This usually takes a few moments.
        </p>
      </div>
    </div>
  );
}
