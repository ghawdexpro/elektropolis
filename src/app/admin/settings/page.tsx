"use client";

import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { FormField, inputStyles } from "@/components/admin/ui/FormField";
import { useToast } from "@/components/admin/ui/Toast";
import { SkeletonFormPage } from "@/components/admin/ui/Skeleton";

interface Settings {
  store_name: string;
  store_email: string;
  store_phone: string;
  store_address: string;
  currency: string;
}

const defaultSettings: Settings = {
  store_name: "ElektroPolis Malta",
  store_email: "",
  store_phone: "",
  store_address: "",
  currency: "EUR",
};

export default function SettingsPage() {
  const { toast } = useToast();
  const supabase = createClient();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const s = createClient();
    s.from("store_settings")
      .select("key, value")
      .then(({ data }) => {
        if (data) {
          const merged = { ...defaultSettings };
          for (const row of data) {
            const key = row.key as keyof Settings;
            if (key in merged) {
              merged[key] = (row.value as { v: string })?.v ?? String(row.value) ?? "";
            }
          }
          setSettings(merged);
        }
        setLoading(false);
      });
  }, []);

  const handleChange = (key: keyof Settings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);

    const entries = Object.entries(settings);
    for (const [key, value] of entries) {
      await supabase
        .from("store_settings")
        .upsert(
          { key, value: { v: value }, updated_at: new Date().toISOString() },
          { onConflict: "key" }
        );
    }

    toast({ type: "success", message: "Settings saved." });
    setSaving(false);
  };

  if (loading) {
    return <SkeletonFormPage />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your store configuration"
        actions={
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-hover transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Settings
          </button>
        }
      />

      {/* Store Information */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-5 text-base font-semibold text-charcoal">
          Store Information
        </h2>
        <div className="space-y-5">
          <FormField label="Store Name">
            <input
              type="text"
              value={settings.store_name}
              onChange={(e) => handleChange("store_name", e.target.value)}
              placeholder="ElektroPolis Malta"
              className={inputStyles}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField label="Email Address">
              <input
                type="email"
                value={settings.store_email}
                onChange={(e) => handleChange("store_email", e.target.value)}
                placeholder="info@elektropolis.mt"
                className={inputStyles}
              />
            </FormField>

            <FormField label="Phone Number">
              <input
                type="tel"
                value={settings.store_phone}
                onChange={(e) => handleChange("store_phone", e.target.value)}
                placeholder="+356 ..."
                className={inputStyles}
              />
            </FormField>
          </div>

          <FormField label="Address">
            <textarea
              value={settings.store_address}
              onChange={(e) => handleChange("store_address", e.target.value)}
              rows={3}
              placeholder="Store address..."
              className={inputStyles}
            />
          </FormField>

          <FormField label="Default Currency">
            <input
              type="text"
              value={settings.currency}
              onChange={(e) => handleChange("currency", e.target.value)}
              placeholder="EUR"
              className={inputStyles}
              maxLength={3}
            />
          </FormField>
        </div>
      </div>
    </div>
  );
}
