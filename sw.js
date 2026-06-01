const CACHE_NAME = 'life-agent-v2';
const ASSETS = ['./index.html', './manifest.json'];

// Notification schedule
const NOTIFS = [
  { id: 'morning', hour: 7,  min: 0,  title: '🌅 Good morning, Yogitha!', body: 'Tick your morning routine → check today\'s urgent tasks → 1 DSA problem.' },
  { id: 'midday',  hour: 12, min: 0,  title: '📨 Midday check-in',        body: 'Check emails → update application status → any new hackathons?' },
  { id: 'evening', hour: 20, min: 0,  title: '🌙 Evening review',          body: 'Plan tomorrow\'s 3 priorities → tick DSA done → wind down by 9pm.' },
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});

// Schedule all notifications
function scheduleNotif(n) {
  const now = new Date();
  let next = new Date();
  next.setHours(n.hour, n.min, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  const delay = next - now;
  setTimeout(() => {
    self.registration.showNotification(n.title, {
      body: n.body,
      icon: './icon.svg',
      badge: './icon.svg',
      tag: 'la-' + n.id,
      requireInteraction: true,
      vibrate: [200, 100, 200],
      actions: [
        { action: 'open',    title: '📱 Open app' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    });
    scheduleNotif(n); // reschedule for next day
  }, delay);
}

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'START_NOTIFS') {
    NOTIFS.forEach(n => scheduleNotif(n));
  }
  if (e.data && e.data.type === 'TEST') {
    self.registration.showNotification('🔔 Life Agent works!', {
      body: 'Notifications are ON. You will get reminders at 7am, 12pm & 8pm every day.',
      requireInteraction: true,
      vibrate: [200, 100, 200],
    });
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action !== 'dismiss') {
    e.waitUntil(clients.openWindow('./index.html'));
  }
});
