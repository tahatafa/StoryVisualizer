import React, { useState, useEffect } from 'react';
import { Mic, MicOff, X, ChevronLeft, ChevronRight, Sparkles, Image as ImageIcon, Wand2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardHeader, CardContent, CardTitle } from './ui/Card';
import OpenAI from 'openai';

const openai = new OpenAI({ 
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true 
});

const StoryVisualizer = () => {
    const [isListening, setIsListening] = useState(false);
    const [text, setText] = useState('');
    const [imageUrl, setImageUrl] = useState('https://placehold.co/400x400');
    const [isLoading, setIsLoading] = useState(false);
    const [imageHistory, setImageHistory] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(-1);
    const [usingFallback, setUsingFallback] = useState(false);
    const [lastGenerationTime, setLastGenerationTime] = useState(0);
    const [rateLimitMessage, setRateLimitMessage] = useState('');

    useEffect(() => {
        let recognition;
        if ('webkitSpeechRecognition' in window) {
            recognition = new window.webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;

            recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                setText(transcript);
            };

            if (isListening) {
                recognition.start();
            } else {
                recognition.stop();
            }
        }

        return () => {
            if (recognition) {
                recognition.stop();
            }
        };
    }, [isListening]);

    const generateFallbackImage = (storyText) => {
        // Create a more sophisticated fallback image with story-based themes
        const themes = {
            nature: ['forest', 'mountain', 'ocean', 'sunset', 'meadow'],
            fantasy: ['castle', 'dragon', 'magic', 'wizard', 'kingdom'],
            adventure: ['journey', 'quest', 'exploration', 'discovery', 'travel'],
            emotions: ['joy', 'love', 'friendship', 'hope', 'courage'],
            mystery: ['night', 'shadow', 'secret', 'mysterious', 'dark']
        };
        
        let selectedTheme = 'nature';
        let selectedColor = '3b82f6';
        
        // Simple keyword matching to determine theme
        const lowerText = storyText.toLowerCase();
        if (lowerText.includes('forest') || lowerText.includes('tree') || lowerText.includes('nature')) {
            selectedTheme = 'nature';
            selectedColor = '10b981';
        } else if (lowerText.includes('magic') || lowerText.includes('dragon') || lowerText.includes('castle')) {
            selectedTheme = 'fantasy';
            selectedColor = '8b5cf6';
        } else if (lowerText.includes('journey') || lowerText.includes('adventure') || lowerText.includes('travel')) {
            selectedTheme = 'adventure';
            selectedColor = 'f59e0b';
        } else if (lowerText.includes('love') || lowerText.includes('happy') || lowerText.includes('joy')) {
            selectedTheme = 'emotions';
            selectedColor = 'ec4899';
        } else if (lowerText.includes('dark') || lowerText.includes('night') || lowerText.includes('mystery')) {
            selectedTheme = 'mystery';
            selectedColor = '6366f1';
        }
        
        const randomIndex = Math.floor(Math.random() * themes[selectedTheme].length);
        const themeWord = themes[selectedTheme][randomIndex];
        
        return `https://picsum.photos/400/400?random=${Date.now()}&t=${themeWord}&blur=1`;
    };

    const generateImage = async () => {
        if (!text.trim()) {
            alert('Please speak some text first!');
            return;
        }
        
        // Rate limiting: enforce minimum 60 seconds between requests
        const now = Date.now();
        const timeSinceLastGeneration = now - lastGenerationTime;
        const minInterval = 60000; // 60 seconds
        
        if (timeSinceLastGeneration < minInterval) {
            const remainingTime = Math.ceil((minInterval - timeSinceLastGeneration) / 1000);
            setRateLimitMessage(`Please wait ${remainingTime} seconds before generating another image`);
            setTimeout(() => setRateLimitMessage(''), 3000);
            return;
        }
        
        setIsLoading(true);
        setRateLimitMessage('');
        setLastGenerationTime(now);
        
        // Check if OpenAI API is available and properly configured
        if (process.env.REACT_APP_OPENAI_API_KEY && process.env.REACT_APP_OPENAI_API_KEY !== 'your_openai_api_key_here') {
            try {
                const response = await openai.images.generate({
                    model: "dall-e-3",
                    size: "1024x1024",
                    prompt: `Generate a beautiful, artistic image based on this story excerpt: ${text.slice(-200)}`,
                });

                const newImageUrl = response.data[0].url;
                setImageUrl(newImageUrl);
                setImageHistory(prevHistory => [...prevHistory, newImageUrl]);
                setCurrentImageIndex(prevIndex => prevIndex + 1);
                setUsingFallback(false);
                setIsLoading(false);
                return;
            } catch (error) {
                console.error('OpenAI API Error:', error);
                
                // Handle specific error types
                if (error.message.includes('Billing hard limit')) {
                    console.log('OpenAI billing limit reached, using fallback image generation');
                    setRateLimitMessage('OpenAI billing limit reached. Using demo images.');
                } else if (error.message.includes('quota')) {
                    console.log('OpenAI quota exceeded, using fallback image generation');
                    setRateLimitMessage('OpenAI quota exceeded. Using demo images.');
                } else if (error.status === 429 || error.message.includes('Too Many Requests')) {
                    console.log('Rate limit hit, using fallback image generation');
                    setRateLimitMessage('Rate limit reached. Using demo images. Try again in a minute.');
                } else {
                    console.log('OpenAI API error, using fallback image generation');
                    setRateLimitMessage('API error. Using demo images.');
                }
                
                setTimeout(() => setRateLimitMessage(''), 5000);
            }
        }
        
        // Fallback to demo image generation
        console.log('Using fallback image generation for demo purposes');
        
        // Simulate AI processing time
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const fallbackImageUrl = generateFallbackImage(text);
        setImageUrl(fallbackImageUrl);
        setImageHistory(prevHistory => [...prevHistory, fallbackImageUrl]);
        setCurrentImageIndex(prevIndex => prevIndex + 1);
        setUsingFallback(true);
        setIsLoading(false);
    };

    const toggleListening = () => {
        setIsListening(!isListening);
    };

    const clearText = () => {
        setText('');
        setImageUrl('https://placehold.co/400x400');
        setImageHistory([]);
        setCurrentImageIndex(-1);
        setUsingFallback(false);
    };

    const navigateImage = (direction) => {
        if (direction === 'prev' && currentImageIndex > 0) {
            setCurrentImageIndex(prevIndex => prevIndex - 1);
        } else if (direction === 'next' && currentImageIndex < imageHistory.length - 1) {
            setCurrentImageIndex(prevIndex => prevIndex + 1);
        }
    };

    useEffect(() => {
        if (currentImageIndex >= 0 && currentImageIndex < imageHistory.length) {
            setImageUrl(imageHistory[currentImageIndex]);
        }
    }, [currentImageIndex, imageHistory]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
            <div className="max-w-4xl mx-auto pt-8 pb-16">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                        Story Visualizer
                    </h1>
                    <p className="text-gray-600 text-lg">Speak your story and watch it come to life</p>
                </div>
                
                <div className="grid lg:grid-cols-2 gap-8">
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mic className="w-5 h-5" />
                                Voice Input
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex gap-3">
                                <Button
                                    onClick={toggleListening}
                                    variant={isListening ? 'danger' : 'primary'}
                                    size="lg"
                                    className="flex-1"
                                >
                                    {isListening ? <MicOff className="mr-2 w-5 h-5" /> : <Mic className="mr-2 w-5 h-5" />}
                                    {isListening ? 'Stop Recording' : 'Start Recording'}
                                </Button>
                                <Button
                                    onClick={clearText}
                                    variant="outline"
                                    size="lg"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                            
                            {rateLimitMessage && (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-amber-800 text-sm">{rateLimitMessage}</p>
                                </div>
                            )}
                            
                            {text && (
                                <Button
                                    onClick={generateImage}
                                    disabled={isLoading}
                                    variant="primary"
                                    size="lg"
                                    className="w-full"
                                >
                                    <Wand2 className="mr-2 w-5 h-5" />
                                    {isLoading ? 'Generating...' : 'Generate Image'}
                                </Button>
                            )}
                            
                            <div className="relative">
                                <div className="min-h-[200px] p-4 bg-slate-50 border border-slate-200 rounded-lg overflow-y-auto">
                                    {text ? (
                                        <p className="text-slate-700 leading-relaxed">{text}</p>
                                    ) : (
                                        <p className="text-slate-400 italic">Start speaking to see your story appear here...</p>
                                    )}
                                </div>
                                {isListening && (
                                    <div className="absolute top-2 right-2 flex items-center gap-1">
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                        <span className="text-xs text-red-600 font-medium">Recording</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5" />
                                    Generated Visualization
                                </div>
                                {usingFallback && (
                                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                                        Demo Mode
                                    </span>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="relative bg-slate-50 rounded-lg overflow-hidden">
                                {isLoading ? (
                                    <div className="aspect-square flex flex-col items-center justify-center p-8">
                                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                        <p className="text-slate-600 font-medium">Creating your visualization...</p>
                                        <p className="text-slate-400 text-sm mt-1">This may take a moment</p>
                                    </div>
                                ) : (
                                    <img 
                                        src={imageUrl} 
                                        alt="Generated story visualization" 
                                        className="w-full aspect-square object-cover transition-all duration-300 hover:scale-105" 
                                    />
                                )}
                            </div>
                            
                            {imageHistory.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Button
                                            onClick={() => navigateImage('prev')}
                                            disabled={currentImageIndex <= 0}
                                            variant="outline"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>
                                        
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-600">
                                                {currentImageIndex + 1} of {imageHistory.length}
                                            </span>
                                        </div>
                                        
                                        <Button
                                            onClick={() => navigateImage('next')}
                                            disabled={currentImageIndex >= imageHistory.length - 1}
                                            variant="outline"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    
                                    <div className="grid grid-cols-4 gap-2">
                                        {imageHistory.map((url, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentImageIndex(index)}
                                                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                                    index === currentImageIndex 
                                                        ? 'border-blue-500 ring-2 ring-blue-200' 
                                                        : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                            >
                                                <img 
                                                    src={url} 
                                                    alt={`Story visualization ${index + 1}`} 
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StoryVisualizer;