import React, { useRef, useEffect, useState } from 'react';
import { useBaseUrl } from '../Contexts/BaseUrlContext';
import axios from 'axios';
import Cookies from 'js-cookie';

interface CanvasProps {
    imageId: string;
    image: string;
    name: string;
    brushActive: boolean;
    saveActive: boolean;
    setImage: (image: string) => void;
}

const Canvas: React.FC<CanvasProps> = ({ imageId, image, name, brushActive, saveActive, setImage }) => {
    const baseUrl = useBaseUrl();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        if (canvasRef.current && image) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.src = image;

            img.onload = () => {
                const { width, height } = img;
                const maxWidth = 800;
                const maxHeight = 600;

                const scale = Math.min(maxWidth / width, maxHeight / height);
                const scaledWidth = width * scale;
                const scaledHeight = height * scale;

                canvas.width = scaledWidth;
                canvas.height = scaledHeight;

                ctx?.clearRect(0, 0, canvas.width, canvas.height);
                ctx?.drawImage(img, 0, 0, scaledWidth, scaledHeight);
            };

            img.onerror = (error) => {
                console.error('Error loading image:', error);
            };
        }
    }, [image]);

    useEffect(() => {
        if (canvasRef.current) {
            canvasRef.current.style.cursor = brushActive ? 'crosshair' : 'default';
        }
    }, [brushActive]);

    useEffect(() => {
        const saveDrawing = () => {
            if (!saveActive || !canvasRef.current) return;
    
            const canvas = canvasRef.current;
            const base64 = canvas.toDataURL('image/png');
            const token = Cookies.get('token');
            
            try {
                axios.put(`${baseUrl}/projects/${imageId}`, { image: base64, name }, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                });
                alert('Drawing saved successfully!');
                setImage(base64);
            } catch (error) {
                console.error('Error saving drawing:', error);
            }
        };

        saveDrawing();
    }, [saveActive]);

    const startDrawing = (event: React.MouseEvent) => {
        if (!brushActive) return;
        setIsDrawing(true);
        draw(event);
    };

    const endDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.beginPath(); // This ensures a new line starts after the drawing stops
        }
    };

    const draw = (event: React.MouseEvent) => {
        if (!isDrawing || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        ctx.lineWidth = 5; // Adjust the width of the brush
        ctx.strokeStyle = 'black'; // Adjust the color of the brush
        ctx.lineCap = 'round'; // Smooths the edges of the line

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    return (
        <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseUp={endDrawing}
            onMouseOut={endDrawing}
            onMouseMove={draw}
            style={{ maxWidth: '800px', maxHeight: '600px', width: '100%', height: 'auto', border: '1px solid black' }}
        />
    );
};

export default Canvas;