"use client";

import { api } from "@/lib/api-client";

/**
 * Web Push di browser: mendaftarkan perangkat ini supaya notifikasi website
 * muncul sebagai notifikasi sistem (Windows / Android / macOS, dan iPhone bila
 * website di-"Add to Home Screen"). Service worker ada di public/sw.js.
 */

export type PushState =
  | "unsupported" // browser tidak mendukung (atau bukan HTTPS / localhost)
  | "ios-needs-install" // iPhone/iPad: harus dibuka dari ikon Home Screen dulu
  | "denied" // user memblokir izin notifikasi
  | "off" // didukung tapi belum aktif di perangkat ini
  | "on";

const SW_URL = "/sw.js";

function isIos(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isStandalone(): boolean {
  return window.matchMedia?.("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
}

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    window.isSecureContext &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !window.isSecureContext) return null;
  try {
    return await navigator.serviceWorker.register(SW_URL, { scope: "/" });
  } catch {
    return null;
  }
}

export async function getPushState(): Promise<PushState> {
  if (typeof window === "undefined") return "unsupported";
  if (!pushSupported()) return isIos() && !isStandalone() ? "ios-needs-install" : "unsupported";
  if (Notification.permission === "denied") return "denied";
  const reg = await navigator.serviceWorker.getRegistration(SW_URL);
  const sub = await reg?.pushManager.getSubscription();
  return sub && Notification.permission === "granted" ? "on" : "off";
}

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

/** Minta izin, daftarkan push, kirim subscription ke server. Melempar Error berbahasa Indonesia bila gagal. */
export async function enablePush(): Promise<void> {
  if (!pushSupported()) {
    throw new Error(
      isIos()
        ? "Di iPhone/iPad: buka menu Share → Add to Home Screen, lalu buka website dari ikon tersebut."
        : "Browser ini tidak mendukung notifikasi push (butuh Chrome/Edge/Firefox dan alamat https).",
    );
  }
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Izin notifikasi ditolak. Aktifkan lewat ikon gembok di address bar → Notifications → Allow.");
  }
  const reg = (await registerServiceWorker()) ?? (await navigator.serviceWorker.ready);
  await navigator.serviceWorker.ready;

  const keyRes = await api.request<{ publicKey: string }>("GET", "push/public-key", undefined, undefined, { silent: true });
  const publicKey = keyRes.data?.publicKey;
  if (!publicKey) throw new Error("Server belum mengaktifkan notifikasi push.");

  let sub = await reg.pushManager.getSubscription();
  const serverKey = urlBase64ToUint8Array(publicKey);
  // Kunci server berubah → subscription lama tidak berlaku, buat ulang.
  if (sub && sub.options.applicationServerKey) {
    const current = new Uint8Array(sub.options.applicationServerKey);
    if (current.length !== serverKey.length || current.some((b, i) => b !== serverKey[i])) {
      await sub.unsubscribe();
      sub = null;
    }
  }
  sub ??= await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: serverKey });

  const json = sub.toJSON();
  await api.request("POST", "push/subscribe", { endpoint: json.endpoint, keys: json.keys }, undefined, { silent: true });
}

export async function disablePush(): Promise<void> {
  if (!pushSupported()) return;
  const reg = await navigator.serviceWorker.getRegistration(SW_URL);
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return;
  await api.request("POST", "push/unsubscribe", { endpoint: sub.endpoint }, undefined, { silent: true }).catch(() => undefined);
  await sub.unsubscribe();
}

/** Setelah login ulang di browser yang sama, pastikan subscription tercatat untuk user yang sekarang. */
export async function resyncPush(): Promise<void> {
  if (!pushSupported() || Notification.permission !== "granted") return;
  const reg = await navigator.serviceWorker.getRegistration(SW_URL);
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return;
  const json = sub.toJSON();
  await api.request("POST", "push/subscribe", { endpoint: json.endpoint, keys: json.keys }, undefined, { silent: true }).catch(() => undefined);
}

export async function sendTestPush(): Promise<string> {
  const res = await api.request<{ sent: number }>("POST", "push/test", {}, undefined, { silent: true });
  return (res as { message?: string }).message || (res.data?.sent ? "Terkirim" : "Belum ada perangkat aktif");
}
