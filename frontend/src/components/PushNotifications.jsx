import React, { useState, useEffect } from 'react';

const PushNotifications = () => {
    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [permission, setPermission] = useState('default');

    useEffect(() => {
        checkNotificationSupport();
        checkSubscriptionStatus();
    }, []);

    const checkNotificationSupport = () => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            setPermission(Notification.permission);
        }
    };

    const checkSubscriptionStatus = async () => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            try {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();
                setIsSubscribed(!!subscription);
            } catch (error) {
                console.error('Error checking subscription status:', error);
            }
        }
    };

    const requestPermission = async () => {
        try {
            const result = await Notification.requestPermission();
            setPermission(result);
            return result === 'granted';
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    };

    const subscribeToNotifications = async () => {
        setLoading(true);
        try {
            // Request permission first
            const granted = await requestPermission();
            if (!granted) {
                alert('Notification permission is required to receive updates.');
                return;
            }

            // Register service worker if not already registered
            const registration = await navigator.serviceWorker.register('/sw.js');
            await navigator.serviceWorker.ready;

            // Subscribe to push notifications
            const response = await fetch('http://localhost:3000/api/notifications/vapid-public-key');
            const { publicKey } = await response.json();

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey)
            });

            // Send subscription to server
            await fetch('http://localhost:3000/api/notifications/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subscription: subscription.toJSON()
                })
            });

            setIsSubscribed(true);
            alert('Successfully subscribed to notifications! 🎉');
        } catch (error) {
            console.error('Error subscribing to notifications:', error);
            alert('Failed to subscribe to notifications. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const unsubscribeFromNotifications = async () => {
        setLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                await subscription.unsubscribe();

                // Notify server
                await fetch('http://localhost:3000/api/notifications/unsubscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        endpoint: subscription.endpoint
                    })
                });
            }

            setIsSubscribed(false);
            alert('Successfully unsubscribed from notifications.');
        } catch (error) {
            console.error('Error unsubscribing from notifications:', error);
            alert('Failed to unsubscribe from notifications. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const urlBase64ToUint8Array = (base64String) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const testNotification = async () => {
        if (!isSubscribed) {
            alert('Please subscribe to notifications first.');
            return;
        }

        try {
            await fetch('http://localhost:3000/api/notifications/test', {
                method: 'POST'
            });
            alert('Test notification sent! Check your notifications.');
        } catch (error) {
            console.error('Error sending test notification:', error);
            alert('Failed to send test notification.');
        }
    };

    if (!isSupported) {
        return (
            <div className="push-notifications p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <div className="text-4xl mb-4">🔔</div>
                    <h3 className="text-lg font-semibold mb-2">Notifications Not Supported</h3>
                    <p className="text-gray-600 text-sm">
                        Your browser doesn't support push notifications. Try using a modern browser like Chrome, Firefox, or Edge.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="push-notifications p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
            <div className="text-center mb-6">
                <div className="text-4xl mb-4">🔔</div>
                <h3 className="text-lg font-semibold mb-2">Push Notifications</h3>
                <p className="text-gray-600 text-sm">
                    Get notified about new food posts, comments, and updates from food partners you follow.
                </p>
            </div>

            <div className="space-y-4">
                {/* Permission Status */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Permission Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        permission === 'granted' ? 'bg-green-100 text-green-800' :
                        permission === 'denied' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                    }`}>
                        {permission === 'granted' ? 'Granted' :
                         permission === 'denied' ? 'Denied' :
                         'Not Asked'}
                    </span>
                </div>

                {/* Subscription Status */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Subscription Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isSubscribed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                        {isSubscribed ? 'Subscribed' : 'Not Subscribed'}
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    {!isSubscribed ? (
                        <button
                            onClick={subscribeToNotifications}
                            disabled={loading || permission === 'denied'}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Subscribing...' : 'Enable Notifications'}
                        </button>
                    ) : (
                        <div className="space-y-2">
                            <button
                                onClick={unsubscribeFromNotifications}
                                disabled={loading}
                                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Unsubscribing...' : 'Disable Notifications'}
                            </button>

                            <button
                                onClick={testNotification}
                                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                            >
                                Send Test Notification
                            </button>
                        </div>
                    )}
                </div>

                {/* Features List */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">What you'll get notified about:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                        <li className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                            New food posts from followed partners
                        </li>
                        <li className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                            Comments on your posts
                        </li>
                        <li className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                            Likes and saves on your content
                        </li>
                        <li className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                            Special offers and promotions
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PushNotifications;
