self.addEventListener('push', function (event) {
    console.log('[Service Worker] Push received:', event);
    if (!event.data) {
        console.warn('[Service Worker] Push received but no data!');
        return;
    }

    const data = event.data.json();
    console.log('[Service Worker] Push data:', data);

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: 'icon.png',
            badge: 'icon.png',
            vibrate: [200, 100, 200]
        })
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
    console.log('[Service Worker] Notification click received.');
    
    event.notification.close();
    
    // Open the app when notification is clicked
    event.waitUntil(
        clients.openWindow('/')
    );
});
