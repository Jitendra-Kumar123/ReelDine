import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FollowingSystem = () => {
    const [following, setFollowing] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('following');

    useEffect(() => {
        fetchFollowingData();
    }, []);

    const fetchFollowingData = async () => {
        try {
            setLoading(true);
            const [followingRes, followersRes, suggestedRes] = await Promise.all([
                axios.get('http://localhost:3000/api/auth/following'),
                axios.get('http://localhost:3000/api/auth/followers'),
                axios.get('http://localhost:3000/api/auth/suggested-users')
            ]);

            setFollowing(followingRes.data.following || []);
            setFollowers(followersRes.data.followers || []);
            setSuggestedUsers(suggestedRes.data.suggestedUsers || []);
        } catch (error) {
            console.error('Error fetching following data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async (userId) => {
        try {
            await axios.post(`http://localhost:3000/api/auth/follow/${userId}`);
            fetchFollowingData(); // Refresh data
        } catch (error) {
            console.error('Error following user:', error);
        }
    };

    const handleUnfollow = async (userId) => {
        try {
            await axios.post(`http://localhost:3000/api/auth/unfollow/${userId}`);
            fetchFollowingData(); // Refresh data
        } catch (error) {
            console.error('Error unfollowing user:', error);
        }
    };

    const UserCard = ({ user, showFollowButton = true, isFollowing = false }) => (
        <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border">
            <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                    <h3 className="font-medium text-gray-900">{user.fullName}</h3>
                    <p className="text-sm text-gray-500">@{user.email?.split('@')[0]}</p>
                </div>
            </div>

            {showFollowButton && (
                <button
                    onClick={() => isFollowing ? handleUnfollow(user._id) : handleFollow(user._id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        isFollowing
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                    {isFollowing ? 'Following' : 'Follow'}
                </button>
            )}
        </div>
    );

    return (
        <div className="following-system max-w-2xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6">👥 Social Network</h2>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                {[
                    { id: 'following', label: 'Following', count: following.length },
                    { id: 'followers', label: 'Followers', count: followers.length },
                    { id: 'suggested', label: 'Discover', count: suggestedUsers.length }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                            activeTab === tab.id
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading...</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {activeTab === 'following' && (
                        <>
                            {following.length > 0 ? (
                                following.map((user) => (
                                    <UserCard
                                        key={user._id}
                                        user={user}
                                        isFollowing={true}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-4">👤</div>
                                    <p className="text-gray-500 mb-2">You're not following anyone yet</p>
                                    <p className="text-sm text-gray-400">Discover amazing food creators in the Discover tab!</p>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'followers' && (
                        <>
                            {followers.length > 0 ? (
                                followers.map((user) => (
                                    <UserCard
                                        key={user._id}
                                        user={user}
                                        showFollowButton={false}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-4">👥</div>
                                    <p className="text-gray-500 mb-2">No followers yet</p>
                                    <p className="text-sm text-gray-400">Share your food content to attract followers!</p>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'suggested' && (
                        <>
                            {suggestedUsers.length > 0 ? (
                                suggestedUsers.map((user) => (
                                    <UserCard
                                        key={user._id}
                                        user={user}
                                        isFollowing={false}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-4">🔍</div>
                                    <p className="text-gray-500 mb-2">No suggestions available</p>
                                    <p className="text-sm text-gray-400">Check back later for personalized recommendations!</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default FollowingSystem;
