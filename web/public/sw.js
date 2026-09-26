/* Service worker CV IndoMurah — menerima Web Push dan menampilkannya sebagai
 * notifikasi sistem (Windows Action Center, notifikasi Android, macOS, dll),
 * juga saat tab website sedang ditutup. Payload dikirim oleh
 * api/src/modules/notification/push.service.ts: { title, body, url, tag, typeCode }.
 */

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'CV IndoMurah', body: event.data ? event.data.text() : '' };
  }
  const title = data.title || 'CV IndoMurah';
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/badge-96.png',
    tag: data.tag || undefined,
    renotify: !!data.tag,
    requireInteraction: data.typeCode === 'ALERT' || data.typeCode === 'STOCK',
    data: { url: data.url || '/dashboard' },
  };
  event.waitUntil(
    (async () => {
      await self.registration.showNotification(title, options);
      // Beri tahu tab yang terbuka agar lonceng notifikasi langsung diperbarui.
      const tabs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      tabs.forEach((c) => c.postMessage({ type: 'push-received', payload: data }));
    })(),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || '/dashboard', self.location.origin).href;
  event.waitUntil(
    (async () => {
      const tabs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const c of tabs) {
        if (new URL(c.url).origin === self.location.origin && 'focus' in c) {
          await c.focus();
          if ('navigate' in c) await c.navigate(target).catch(() => {});
          return;
        }
      }
      await self.clients.openWindow(target);
    })(),
  );
});
