import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LocationBasedDiscovery = () => {
    const [location, setLocation] = useState(null);
    const [nearbyFoods, setNearbyFoods] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [radius, setRadius] = useState(10); // km

    useEffect(() => {
        getCurrentLocation();
    }, []);

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by this browser.');
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });
                fetchNearbyFoods(latitude, longitude, radius);
                setLoading(false);
            },
            (error) => {
                setError('Unable to retrieve your location.');
                setLoading(false);
                console.error('Geolocation error:', error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );
    };

    const fetchNearbyFoods = async (lat, lng, radiusKm) => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:3000/api/food/nearby`, {
                params: {
                    lat,
                    lng,
                    radius: radiusKm
                }
            });
            setNearbyFoods(response.data.foods || []);
        } catch (error) {
            console.error('Error fetching nearby foods:', error);
            setError('Failed to load nearby foods.');
        } finally {
            setLoading(false);
        }
    };

    const handleRadiusChange = (newRadius) => {
        setRadius(newRadius);
        if (location) {
            fetchNearbyFoods(location.latitude, location.longitude, newRadius);
        }
    };

    return (
        <div className="location-discovery p-4">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">🍽️ Discover Food Near You</h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                        <button
                            onClick={getCurrentLocation}
                            className="ml-2 underline hover:no-underline"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {location && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        📍 Location detected: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </div>
                )}

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search Radius: {radius} km
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="50"
                        value={radius}
                        onChange={(e) => handleRadiusChange(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1km</span>
                        <span>50km</span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Finding delicious food near you...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {nearbyFoods.length > 0 ? (
                        nearbyFoods.map((food) => (
                            <div key={food._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="aspect-video bg-gray-200 relative">
                                    {food.video ? (
                                        <video
                                            src={`http://localhost:3000/videos/${food.video}`}
                                            className="w-full h-full object-cover"
                                            muted
                                            onMouseEnter={(e) => e.target.play()}
                                            onMouseLeave={(e) => e.target.pause()}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                                        {food.distance ? `${food.distance.toFixed(1)}km` : ''}
                                    </div>
                                </div>

                                <div className="p-4">
                                    <h3 className="font-semibold text-lg mb-1">{food.name}</h3>
                                    <p className="text-gray-600 text-sm mb-2">{food.description}</p>

                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <span>❤️ {food.likeCount || 0}</span>
                                        <span>💬 {food.commentsCount || 0}</span>
                                        <span>🔖 {food.savesCount || 0}</span>
                                    </div>

                                    {food.foodPartner && (
                                        <div className="mt-2 text-xs text-gray-400">
                                            by {food.foodPartner.name}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-8">
                            <div className="text-4xl mb-4">🍽️</div>
                            <p className="text-gray-500">No food found in your area. Try increasing the search radius!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LocationBasedDiscovery;
