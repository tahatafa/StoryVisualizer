import React, { useState, useEffect } from 'react';
import { Mic, X } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

const StoryVisualizer = () => {
    const [isListening, setIsListening] = useState(false);
    const [text, setText] = useState('');
    const [imageUrl, setImageUrl] = useState('/api/placeholder/400/300');

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

    useEffect(() => {
        const generateImage = async () => {
            // In a real app, you would call your AI image generation API here
            // For now, we'll just use a placeholder
            setImageUrl(`/api/placeholder/400/300?text=${encodeURIComponent(text.slice(-50))}`);
        };

        const interval = setInterval(() => {
            if (text) {
                generateImage();
            }
        }, 20000);

        return () => clearInterval(interval);
    }, [text]);

    const toggleListening = () => {
        setIsListening(!isListening);
    };

    const clearText = () => {
        setText('');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <Card className="w-full max-w-md p-6 space-y-4">
                <h1 className="text-2xl font-bold text-center">Story Visualizer</h1>
                <div className="flex justify-center space-x-2">
                    <Button
                        onClick={toggleListening}
                        className={`flex items-center ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                    >
                        <Mic className="mr-2" />
                        {isListening ? 'Stop Listening' : 'Start Listening'}
                    </Button>
                    <Button
                        onClick={clearText}
                        className="flex items-center bg-gray-500 hover:bg-gray-600"
                    >
                        <X className="mr-2" />
                        Clear Text
                    </Button>
                </div>
                <div className="relative h-40 overflow-y-auto p-2 border rounded">
                    <p>{text}</p>
                </div>
                <div className="flex justify-center">
                    <img src={imageUrl} alt="Generated story visualization" className="max-w-full h-auto" />
                </div>
            </Card>
        </div>
    );
};

export default StoryVisualizer;