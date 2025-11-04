import React, { useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/user.context';

const AIFeatures = () => {
    const { user } = useContext(UserContext);
    const [activeTab, setActiveTab] = useState('recipes');
    const [query, setQuery] = useState('');
    const [foodData, setFoodData] = useState([]);
    const [foodType, setFoodType] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');

    const handleRecipeSuggestions = async () => {
        if (!query.trim()) {
            setError('Please enter a food type or ingredients');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post('/api/ai/recipe-suggestions', {
                query: query.trim()
            }, {
                withCredentials: true
            });

            setResults(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate suggestions');
        } finally {
            setLoading(false);
        }
    };

    const handleTrendAnalysis = async () => {
        if (foodData.length === 0) {
            setError('Please add some food items to analyze');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post('/api/ai/trend-analysis', {
                foodData
            }, {
                withCredentials: true
            });

            setResults(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to analyze trends');
        } finally {
            setLoading(false);
        }
    };

    const handleEditingSuggestions = async () => {
        if (!foodType.trim()) {
            setError('Please enter a food type');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post('/api/ai/editing-suggestions', {
                foodType: foodType.trim(),
                description: description.trim()
            }, {
                withCredentials: true
            });

            setResults(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate suggestions');
        } finally {
            setLoading(false);
        }
    };

    const addFoodItem = () => {
        if (!foodType.trim()) return;

        setFoodData([...foodData, {
            name: foodType,
            description: description,
            likeCount: Math.floor(Math.random() * 100),
            savesCount: Math.floor(Math.random() * 50)
        }]);

        setFoodType('');
        setDescription('');
    };

    const removeFoodItem = (index) => {
        setFoodData(foodData.filter((_, i) => i !== index));
    };

    if (!user) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">Please log in to access AI features.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">AI-Powered Features</h1>
                <p className="text-gray-600">Get intelligent suggestions to enhance your food content creation</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
                {[
                    { id: 'recipes', label: 'Recipe Ideas', icon: '🍳' },
                    { id: 'trends', label: 'Trend Analysis', icon: '📊' },
                    { id: 'editing', label: 'Video Editing', icon: '🎬' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                            activeTab === tab.id
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Recipe Suggestions Tab */}
            {activeTab === 'recipes' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-xl font-semibold mb-4">Generate Recipe Ideas</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    What ingredients or food type are you working with?
                                </label>
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="e.g., Italian pasta, vegan burgers, chocolate desserts..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <button
                                onClick={handleRecipeSuggestions}
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Generating...' : 'Generate Recipe Ideas'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Trend Analysis Tab */}
            {activeTab === 'trends' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-xl font-semibold mb-4">Food Trend Analysis</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Add food items to analyze trends
                                </label>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={foodType}
                                        onChange={(e) => setFoodType(e.target.value)}
                                        placeholder="Food name"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Description (optional)"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        onClick={addFoodItem}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            {foodData.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="font-medium">Added Items:</h3>
                                    {foodData.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                            <span>{item.name} - {item.description}</span>
                                            <button
                                                onClick={() => removeFoodItem(index)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={handleTrendAnalysis}
                                disabled={loading || foodData.length === 0}
                                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Analyzing...' : 'Analyze Trends'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Video Editing Tab */}
            {activeTab === 'editing' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-xl font-semibold mb-4">Video Editing Suggestions</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Food Type
                                </label>
                                <input
                                    type="text"
                                    value={foodType}
                                    onChange={(e) => setFoodType(e.target.value)}
                                    placeholder="e.g., Pizza, Burger, Salad..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe your dish or preparation method..."
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <button
                                onClick={handleEditingSuggestions}
                                disabled={loading}
                                className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Generating...' : 'Get Editing Tips'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Results Display */}
            {results && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Results</h2>
                        {results.aiGenerated !== undefined && (
                            <span className={`px-2 py-1 text-xs rounded-full ${
                                results.aiGenerated
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {results.aiGenerated ? 'AI Generated' : 'Fallback Data'}
                            </span>
                        )}
                    </div>

                    {results.message && (
                        <p className="text-gray-600 mb-4">{results.message}</p>
                    )}

                    {results.data && (
                        <div className="space-y-4">
                            {Array.isArray(results.data) ? (
                                results.data.map((item, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                                        {item.description && <p className="text-gray-700 mb-2">{item.description}</p>}
                                        {item.ingredients && (
                                            <div className="mb-2">
                                                <strong>Ingredients:</strong>
                                                <ul className="list-disc list-inside ml-4">
                                                    {item.ingredients.map((ing, i) => (
                                                        <li key={i}>{ing}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {item.cookingTime && <p><strong>Cooking Time:</strong> {item.cookingTime}</p>}
                                        {item.difficulty && <p><strong>Difficulty:</strong> {item.difficulty}</p>}
                                        {item.reelPotential && <p><strong>Reel Potential:</strong> {item.reelPotential}</p>}
                                    </div>
                                ))
                            ) : (
                                <div className="space-y-4">
                                    {results.data.top_trending && (
                                        <div>
                                            <h3 className="font-semibold mb-2">Top Trending Foods:</h3>
                                            <ul className="list-disc list-inside">
                                                {results.data.top_trending.map((food, i) => (
                                                    <li key={i}>{food}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {results.data.engagement_insights && (
                                        <div>
                                            <h3 className="font-semibold mb-2">Engagement Insights:</h3>
                                            <p>{results.data.engagement_insights}</p>
                                        </div>
                                    )}

                                    {results.data.recommendations && (
                                        <div>
                                            <h3 className="font-semibold mb-2">Recommendations:</h3>
                                            <ul className="list-disc list-inside">
                                                {results.data.recommendations.map((rec, i) => (
                                                    <li key={i}>{rec}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {results.data.angles && (
                                        <div>
                                            <h3 className="font-semibold mb-2">Camera Angles:</h3>
                                            <ul className="list-disc list-inside">
                                                {results.data.angles.map((angle, i) => (
                                                    <li key={i}>{angle}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {results.data.audio && (
                                        <div>
                                            <h3 className="font-semibold mb-2">Audio Suggestions:</h3>
                                            <ul className="list-disc list-inside">
                                                {results.data.audio.map((audio, i) => (
                                                    <li key={i}>{audio}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {results.data.timing && (
                                        <div>
                                            <h3 className="font-semibold mb-2">Timing Tips:</h3>
                                            <ul className="list-disc list-inside">
                                                {results.data.timing.map((tip, i) => (
                                                    <li key={i}>{tip}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AIFeatures;
