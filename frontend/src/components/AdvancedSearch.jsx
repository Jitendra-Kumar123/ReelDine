import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdvancedSearch = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        cuisine: '',
        ingredients: [],
        location: '',
        priceRange: '',
        rating: '',
        dietaryRestrictions: []
    });
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const cuisineTypes = [
        'Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese',
        'Thai', 'French', 'Mediterranean', 'American', 'Korean'
    ];

    const dietaryOptions = [
        'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free',
        'Nut-Free', 'Low-Carb', 'Keto', 'Halal', 'Kosher'
    ];

    const handleSearch = async () => {
        if (!searchQuery.trim() && Object.values(filters).every(v => !v || (Array.isArray(v) && v.length === 0))) {
            return;
        }

        try {
            setLoading(true);
            const searchParams = {
                q: searchQuery,
                ...filters,
                ingredients: filters.ingredients.join(','),
                dietaryRestrictions: filters.dietaryRestrictions.join(',')
            };

            const response = await axios.get('http://localhost:3000/api/food/search', {
                params: searchParams
            });

            setSearchResults(response.data.foods || []);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const toggleArrayFilter = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: prev[filterType].includes(value)
                ? prev[filterType].filter(item => item !== value)
                : [...prev[filterType], value]
        }));
    };

    const clearFilters = () => {
        setFilters({
            cuisine: '',
            ingredients: [],
            location: '',
            priceRange: '',
            rating: '',
            dietaryRestrictions: []
        });
        setSearchQuery('');
        setSearchResults([]);
    };

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (searchQuery || Object.values(filters).some(v => v && (!Array.isArray(v) || v.length > 0))) {
                handleSearch();
            }
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery, filters]);

    return (
        <div className="advanced-search max-w-4xl mx-auto p-4">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">🔍 Advanced Food Search</h2>

                {/* Search Bar */}
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="Search for food, restaurants, or ingredients..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 pl-12 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="absolute left-3 top-3.5 text-gray-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Filter Toggle */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                    <svg className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
                </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Cuisine Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine Type</label>
                            <select
                                value={filters.cuisine}
                                onChange={(e) => handleFilterChange('cuisine', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Cuisines</option>
                                {cuisineTypes.map(cuisine => (
                                    <option key={cuisine} value={cuisine}>{cuisine}</option>
                                ))}
                            </select>
                        </div>

                        {/* Location Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                            <input
                                type="text"
                                placeholder="City or neighborhood"
                                value={filters.location}
                                onChange={(e) => handleFilterChange('location', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Price Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                            <select
                                value={filters.priceRange}
                                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Any Price</option>
                                <option value="budget">$ - Budget friendly</option>
                                <option value="moderate">$$ - Moderate</option>
                                <option value="expensive">$$$ - Expensive</option>
                                <option value="luxury">$$$$ - Luxury</option>
                            </select>
                        </div>

                        {/* Rating Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                            <select
                                value={filters.rating}
                                onChange={(e) => handleFilterChange('rating', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Any Rating</option>
                                <option value="4">4+ Stars</option>
                                <option value="3">3+ Stars</option>
                                <option value="2">2+ Stars</option>
                            </select>
                        </div>

                        {/* Ingredients */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients</label>
                            <input
                                type="text"
                                placeholder="e.g., chicken, rice, tomato"
                                value={filters.ingredients.join(', ')}
                                onChange={(e) => handleFilterChange('ingredients', e.target.value.split(',').map(i => i.trim()).filter(i => i))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Clear Filters */}
                        <div className="flex items-end">
                            <button
                                onClick={clearFilters}
                                className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </div>

                    {/* Dietary Restrictions */}
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Restrictions</label>
                        <div className="flex flex-wrap gap-2">
                            {dietaryOptions.map(option => (
                                <button
                                    key={option}
                                    onClick={() => toggleArrayFilter('dietaryRestrictions', option)}
                                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                                        filters.dietaryRestrictions.includes(option)
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                                    }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Search Results */}
            {loading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Searching for delicious food...</p>
                </div>
            ) : (
                <div>
                    {searchResults.length > 0 && (
                        <div className="mb-4">
                            <p className="text-gray-600">Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {searchResults.length > 0 ? (
                            searchResults.map((food) => (
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
                        ) : searchQuery || Object.values(filters).some(v => v && (!Array.isArray(v) || v.length > 0)) ? (
                            <div className="col-span-full text-center py-8">
                                <div className="text-4xl mb-4">🔍</div>
                                <p className="text-gray-500 mb-2">No food found matching your criteria</p>
                                <p className="text-sm text-gray-400">Try adjusting your search terms or filters</p>
                            </div>
                        ) : (
                            <div className="col-span-full text-center py-8">
                                <div className="text-4xl mb-4">🍽️</div>
                                <p className="text-gray-500 mb-2">Start your food adventure!</p>
                                <p className="text-sm text-gray-400">Search for your favorite dishes or explore by cuisine</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedSearch;
