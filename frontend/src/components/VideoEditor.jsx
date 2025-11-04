import React, { useState, useRef, useEffect } from 'react';

const VideoEditor = ({ videoSrc, onSave, onCancel }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [trimStart, setTrimStart] = useState(0);
    const [trimEnd, setTrimEnd] = useState(0);
    const [filters, setFilters] = useState({
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
        hue: 0
    });
    const [textOverlays, setTextOverlays] = useState([]);
    const [selectedText, setSelectedText] = useState(null);

    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            const handleLoadedMetadata = () => {
                setDuration(video.duration);
                setTrimEnd(video.duration);
            };

            const handleTimeUpdate = () => {
                setCurrentTime(video.currentTime);
            };

            video.addEventListener('loadedmetadata', handleLoadedMetadata);
            video.addEventListener('timeupdate', handleTimeUpdate);

            return () => {
                video.removeEventListener('loadedmetadata', handleLoadedMetadata);
                video.removeEventListener('timeupdate', handleTimeUpdate);
            };
        }
    }, [videoSrc]);

    const togglePlayPause = () => {
        const video = videoRef.current;
        if (video) {
            if (isPlaying) {
                video.pause();
            } else {
                video.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleSeek = (time) => {
        const video = videoRef.current;
        if (video) {
            video.currentTime = time;
            setCurrentTime(time);
        }
    };

    const applyFilters = () => {
        const video = videoRef.current;
        if (video) {
            const filterString = `
                brightness(${filters.brightness}%)
                contrast(${filters.contrast}%)
                saturate(${filters.saturation}%)
                blur(${filters.blur}px)
                hue-rotate(${filters.hue}deg)
            `;
            video.style.filter = filterString;
        }
    };

    useEffect(() => {
        applyFilters();
    }, [filters]);

    const addTextOverlay = () => {
        const newText = {
            id: Date.now(),
            text: 'Your Text Here',
            x: 50,
            y: 50,
            fontSize: 24,
            color: '#ffffff',
            fontFamily: 'Arial',
            startTime: 0,
            endTime: duration,
            stroke: '#000000',
            strokeWidth: 2
        };
        setTextOverlays([...textOverlays, newText]);
        setSelectedText(newText.id);
    };

    const updateTextOverlay = (id, updates) => {
        setTextOverlays(textOverlays.map(text =>
            text.id === id ? { ...text, ...updates } : text
        ));
    };

    const deleteTextOverlay = (id) => {
        setTextOverlays(textOverlays.filter(text => text.id !== id));
        if (selectedText === id) {
            setSelectedText(null);
        }
    };

    const exportVideo = async () => {
        // This is a simplified version. In a real implementation,
        // you would use libraries like FFmpeg.wasm or send to server for processing
        alert('Video export functionality would be implemented with FFmpeg.wasm or server-side processing');

        // For now, just pass the current settings back
        onSave({
            trimStart,
            trimEnd,
            filters,
            textOverlays
        });
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="video-editor fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Video Editor</h2>
                        <div className="space-x-2">
                            <button
                                onClick={onCancel}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={exportVideo}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex h-[70vh]">
                    {/* Video Preview */}
                    <div className="flex-1 p-4 relative">
                        <div className="relative bg-black rounded-lg overflow-hidden">
                            <video
                                ref={videoRef}
                                src={videoSrc}
                                className="w-full h-full object-contain"
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                            />

                            {/* Text Overlays */}
                            {textOverlays.map((text) => (
                                currentTime >= text.startTime && currentTime <= text.endTime && (
                                    <div
                                        key={text.id}
                                        className={`absolute cursor-move ${selectedText === text.id ? 'ring-2 ring-blue-500' : ''}`}
                                        style={{
                                            left: `${text.x}%`,
                                            top: `${text.y}%`,
                                            transform: 'translate(-50%, -50%)',
                                            fontSize: `${text.fontSize}px`,
                                            color: text.color,
                                            fontFamily: text.fontFamily,
                                            WebkitTextStroke: `${text.strokeWidth}px ${text.stroke}`,
                                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                                        }}
                                        onClick={() => setSelectedText(text.id)}
                                    >
                                        {text.text}
                                    </div>
                                )
                            ))}
                        </div>

                        {/* Video Controls */}
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={togglePlayPause}
                                    className="p-2 bg-gray-800 text-white rounded hover:bg-gray-700"
                                >
                                    {isPlaying ? '⏸️' : '▶️'}
                                </button>
                                <span className="text-sm text-gray-600">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </span>
                            </div>

                            {/* Timeline */}
                            <div className="relative">
                                <input
                                    type="range"
                                    min="0"
                                    max={duration}
                                    value={currentTime}
                                    onChange={(e) => handleSeek(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />

                                {/* Trim markers */}
                                <div
                                    className="absolute top-0 h-2 bg-green-500 opacity-50"
                                    style={{
                                        left: `${(trimStart / duration) * 100}%`,
                                        width: `${((trimEnd - trimStart) / duration) * 100}%`
                                    }}
                                />
                            </div>

                            {/* Trim Controls */}
                            <div className="flex items-center space-x-4 text-sm">
                                <div>
                                    <label className="block text-gray-600">Start Trim</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max={duration}
                                        value={trimStart}
                                        onChange={(e) => setTrimStart(Number(e.target.value))}
                                        className="w-24"
                                    />
                                    <span className="ml-2">{formatTime(trimStart)}</span>
                                </div>
                                <div>
                                    <label className="block text-gray-600">End Trim</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max={duration}
                                        value={trimEnd}
                                        onChange={(e) => setTrimEnd(Number(e.target.value))}
                                        className="w-24"
                                    />
                                    <span className="ml-2">{formatTime(trimEnd)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Editor Panel */}
                    <div className="w-80 border-l p-4 overflow-y-auto">
                        {/* Filters */}
                        <div className="mb-6">
                            <h3 className="font-semibold mb-3">Visual Filters</h3>
                            <div className="space-y-3">
                                {Object.entries(filters).map(([filter, value]) => (
                                    <div key={filter}>
                                        <label className="block text-sm text-gray-600 capitalize mb-1">
                                            {filter}: {value}{filter === 'blur' ? 'px' : filter === 'hue' ? '°' : '%'}
                                        </label>
                                        <input
                                            type="range"
                                            min={filter === 'blur' ? 0 : filter === 'hue' ? -180 : 0}
                                            max={filter === 'blur' ? 10 : filter === 'hue' ? 180 : 200}
                                            value={value}
                                            onChange={(e) => setFilters(prev => ({
                                                ...prev,
                                                [filter]: Number(e.target.value)
                                            }))}
                                            className="w-full"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Text Overlays */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold">Text Overlays</h3>
                                <button
                                    onClick={addTextOverlay}
                                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                >
                                    Add Text
                                </button>
                            </div>

                            <div className="space-y-2">
                                {textOverlays.map((text) => (
                                    <div
                                        key={text.id}
                                        className={`p-2 border rounded cursor-pointer ${
                                            selectedText === text.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                                        }`}
                                        onClick={() => setSelectedText(text.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium truncate">{text.text}</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteTextOverlay(text.id);
                                                }}
                                                className="text-red-500 hover:text-red-700 ml-2"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {selectedText && (
                                <div className="mt-4 p-3 bg-gray-50 rounded">
                                    <h4 className="font-medium mb-2">Edit Text</h4>
                                    {(() => {
                                        const text = textOverlays.find(t => t.id === selectedText);
                                        return text ? (
                                            <div className="space-y-2">
                                                <input
                                                    type="text"
                                                    value={text.text}
                                                    onChange={(e) => updateTextOverlay(text.id, { text: e.target.value })}
                                                    className="w-full px-2 py-1 border rounded text-sm"
                                                />
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input
                                                        type="color"
                                                        value={text.color}
                                                        onChange={(e) => updateTextOverlay(text.id, { color: e.target.value })}
                                                        className="w-full h-8 border rounded"
                                                    />
                                                    <input
                                                        type="number"
                                                        value={text.fontSize}
                                                        onChange={(e) => updateTextOverlay(text.id, { fontSize: Number(e.target.value) })}
                                                        className="w-full px-2 py-1 border rounded text-sm"
                                                        min="8"
                                                        max="72"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input
                                                        type="number"
                                                        value={text.x}
                                                        onChange={(e) => updateTextOverlay(text.id, { x: Number(e.target.value) })}
                                                        className="w-full px-2 py-1 border rounded text-sm"
                                                        min="0"
                                                        max="100"
                                                        placeholder="X %"
                                                    />
                                                    <input
                                                        type="number"
                                                        value={text.y}
                                                        onChange={(e) => updateTextOverlay(text.id, { y: Number(e.target.value) })}
                                                        className="w-full px-2 py-1 border rounded text-sm"
                                                        min="0"
                                                        max="100"
                                                        placeholder="Y %"
                                                    />
                                                </div>
                                            </div>
                                        ) : null;
                                    })()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoEditor;
