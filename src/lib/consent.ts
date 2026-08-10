// Consent-Verwaltung (DSGVO / TDDDG)
// Marketing-Pixel (Meta, TikTok, Google) laden erst nach ausdrücklicher Zustimmung.

const STORAGE_KEY = "ap_consent_v1";
const EVENT = "ap-consent-change";

export interface ConsentState {
  /** Technisch notwendige Cookies – immer true. */
  necessary: true;
  /** Marketing/Analyse: Meta, TikTok, Google. */
  marketing: boolean;
  /** Zeitstempel der Entscheidung (ISO). */
  decidedAt: string;
}

let cache: ConsentState | null | undefined;

export function getConsent(): ConsentState | null {
  if (cache !== undefined) return cache;
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as ConsentState) : null;
  } catch {
    cache = null;
  }
  return cache;
}

export function hasDecided(): boolean {
  return getConsent() !== null;
}

export function hasMarketingConsent(): boolean {
  return getConsent()?.marketing === true;
}

export function setConsent(marketing: boolean): void {
  const state: ConsentState = { necessary: true, marketing, decidedAt: new Date().toISOString() };
  cache = state;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* Speicher nicht verfügbar – Entscheidung gilt für diese Sitzung */
  }
  applyConsentToVendors(marketing);
  window.dispatchEvent(new CustomEvent(EVENT, { detail: state }));
}

export function resetConsent(): void {
  cache = null;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: null }));
}

export function onConsentChange(handler: (state: ConsentState | null) => void): () => void {
  const listener = (e: Event) => handler((e as CustomEvent<ConsentState | null>).detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}

/** Google Consent Mode v2 + Meta/TikTok Consent-APIs synchronisieren. */
export function applyConsentToVendors(marketing: boolean): void {
  if (typeof window === "undefined") return;
  const granted = marketing ? "granted" : "denied";
  try {
    window.gtag?.("consent", "update", {
      ad_storage: granted,
      ad_user_data: granted,
      ad_personalization: granted,
      analytics_storage: granted,
      functionality_storage: granted,
      personalization_storage: granted,
      security_storage: "granted",
    });
  } catch {
    /* ignore */
  }
  try {
    window.fbq?.("consent", marketing ? "grant" : "revoke");
  } catch {
    /* ignore */
  }
  try {
    const ttq = window.ttq as unknown as Record<string, ((...a: unknown[]) => void) | undefined>;
    if (marketing) ttq?.grantConsent?.();
    else ttq?.revokeConsent?.();
  } catch {
    /* ignore */
  }
}
