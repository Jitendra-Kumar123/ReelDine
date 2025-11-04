// Service Worker for Push Notifications
const CACHE_NAME = 'reeldine-v1';
const urlsToCache = [
    '/',
    '/static/js/bundle.js',
    '/static/css/main.css',
    '/manifest.json'
];

// Install Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch Event - Serve from cache when offline
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            })
    );
});

// Push Event - Handle incoming push notifications
self.addEventListener('push', (event) => {
    let data = {};

    if (event.data) {
        data = event.data.json();
    }

    const options = {
        body: data.body || 'You have a new notification from ReelDine!',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: data.primaryKey || 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Details',
                icon: '/icon-192x192.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/icon-192x192.png'
            }
        ]
    };

    // Custom notification titles based on type
    let title = 'ReelDine';
    if (data.type) {
        switch (data.type) {
            case 'new_post':
                title = 'New Food Post! 🍽️';
                break;
            case 'comment':
                title = 'New Comment 💬';
                break;
            case 'like':
                title = 'Someone Liked Your Post ❤️';
                break;
            case 'follow':
                title = 'New Follower 👥';
                break;
            case 'promotion':
                title = 'Special Offer 🎉';
                break;
            default:
                title = 'ReelDine';
        }
    }

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification Click Event
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'explore') {
        // Open the app and navigate to relevant page
        event.waitUntil(
            clients.openWindow('/#/home') // Adjust route as needed
        );
    } else if (event.action === 'close') {
        // Just close the notification
        return;
    } else {
        // Default action - open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Background Sync (for offline actions)
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    // Implement background sync logic here
    // This could sync offline actions like likes, comments, etc.
    console.log('Background sync triggered');
}

// Periodic Background Sync (if supported)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'content-sync') {
        event.waitUntil(syncContent());
    }
});

async function syncContent() {
    // Implement periodic content sync
    console.log('Periodic content sync');
}

// Message Event - Handle messages from the main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
