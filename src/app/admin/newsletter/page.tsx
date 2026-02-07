"use client";

import { useState, useEffect } from "react";
import { Loader2, Mail, Download, Search, X } from "lucide-react";
import { SkeletonTable } from "@/components/admin/ui/Skeleton";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Badge } from "@/components/admin/ui/Badge";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { useToast } from "@/components/admin/ui/Toast";

interface Subscriber {
  id: string;
  email: string;
  status: string;
  subscribed_at: string;
}

export default function NewsletterPage() {
  const { toast } = useToast();
  const supabase = createClient();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadSubscribers = async () => {
    setLoading(true);
    const s = createClient();
    let query = s
      .from("newsletter_subscribers")
      .select("*")
      .order("subscribed_at", { ascending: false });

    if (search.trim()) {
      query = query.ilike("email", `%${search}%`);
    }

    const { data } = await query;
    setSubscribers((data as Subscriber[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadSubscribers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleStatus = async (subscriber: Subscriber) => {
    const newStatus =
      subscriber.status === "active" ? "unsubscribed" : "active";

    const { error } = await supabase
      .from("newsletter_subscribers")
      .update({ status: newStatus })
      .eq("id", subscriber.id);

    if (error) {
      toast({ type: "error", message: "Failed to update status." });
    } else {
      setSubscribers((prev) =>
        prev.map((s) =>
          s.id === subscriber.id ? { ...s, status: newStatus } : s
        )
      );
      toast({
        type: "success",
        message: `${subscriber.email} ${newStatus === "active" ? "resubscribed" : "unsubscribed"}.`,
      });
    }
  };

  const handleExportCSV = () => {
    const activeSubscribers = subscribers.filter(
      (s) => s.status === "active"
    );
    const csv = [
      "Email,Status,Subscribed At",
      ...activeSubscribers.map(
        (s) =>
          `${s.email},${s.status},${new Date(s.subscribed_at).toISOString()}`
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      type: "success",
      message: `Exported ${activeSubscribers.length} subscribers.`,
    });
  };

  const activeCount = subscribers.filter((s) => s.status === "active").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Newsletter"
        subtitle={`${activeCount} active subscriber${activeCount !== 1 ? "s" : ""}`}
        actions={
          <button
            onClick={handleExportCSV}
            disabled={subscribers.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-charcoal hover:bg-card transition-colors disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        }
      />

      {/* Search */}
      <div className="rounded-xl border border-border bg-card p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadSubscribers();
          }}
          className="flex gap-3"
        >
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email..."
              className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-8 text-sm transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-3.5 w-3.5 text-muted hover:text-charcoal transition-colors" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="rounded-lg bg-charcoal px-4 py-2 text-sm font-medium text-white hover:bg-charcoal/90 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Subscribers table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {loading ? (
          <SkeletonTable rows={6} columns={4} />
        ) : subscribers.length === 0 ? (
          <EmptyState
            icon={Mail}
            title="No subscribers found"
            description={
              search
                ? "Try a different search term."
                : "Subscribers will appear here when they sign up."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface/30">
                  <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                    Email
                  </th>
                  <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                    Status
                  </th>
                  <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                    Subscribed
                  </th>
                  <th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subscribers.map((sub) => (
                  <tr
                    key={sub.id}
                    className="transition-colors hover:bg-surface/30"
                  >
                    <td className="px-5 py-3 font-medium text-charcoal">
                      {sub.email}
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        variant={sub.status === "active" ? "active" : "archived"}
                        label={sub.status === "active" ? "Active" : "Unsubscribed"}
                      />
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {new Date(sub.subscribed_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleToggleStatus(sub)}
                        className="text-sm font-medium text-brand hover:text-brand-hover transition-colors"
                      >
                        {sub.status === "active" ? "Unsubscribe" : "Resubscribe"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
