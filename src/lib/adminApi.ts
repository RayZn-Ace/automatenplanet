import { supabase } from "@/integrations/supabase/client";

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analytics-dashboard`;

export async function adminApi<T>(params: Record<string, string>): Promise<T> {
  const sess = (await supabase.auth.getSession()).data.session;
  if (!sess) throw new Error("Nicht eingeloggt");
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${FN_URL}?${qs}`, {
    headers: { Authorization: `Bearer ${sess.access_token}` },
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export const euro = (cents: number) =>
  (cents / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

export const nf = new Intl.NumberFormat("de-DE");

export const RANGE_PRESETS = [
  { id: "1d", label: "Heute", days: 1 },
  { id: "7d", label: "7 Tage", days: 7 },
  { id: "30d", label: "30 Tage", days: 30 },
  { id: "90d", label: "90 Tage", days: 90 },
];

export function rangeToIso(rangeId: string) {
  const preset = RANGE_PRESETS.find((r) => r.id === rangeId) ?? RANGE_PRESETS[1];
  const now = new Date();
  const start = new Date(now);
  if (rangeId === "1d") start.setHours(0, 0, 0, 0);
  else start.setDate(start.getDate() - preset.days);
  return { from: start.toISOString(), to: now.toISOString() };
}

export function formatDuration(ms: number | null) {
  if (ms == null) return "—";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}
