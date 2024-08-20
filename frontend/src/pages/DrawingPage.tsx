import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useParams } from 'react-router-dom';
import { useBaseUrl } from '../Contexts/BaseUrlContext';
import ToolBar from '../Components/ToolBar';
import Canvas from '../Components/Canvas';

const DrawingPage: React.FC = () => {
    const baseUrl = useBaseUrl();

    const { id } = useParams<{ id: string }>();

    const [brushActive, setBrushActive] = useState(false);
    const [saving, setSaving] = useState(false);
    const [image, setImage] = useState<string>('');
    const [name, setName] = useState<string>('');

    useEffect(() => {
        const getImage = async () => {
            try {
                const response = await axios.get(`${baseUrl}/projects/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${Cookies.get('token')}`
                        }
                    });

                setName(response.data.name);
                setImage(response.data.image);
                
            } catch (error: any) {
                console.error('Error getting project:', error.response.data);
            }
        }

        getImage();
    }, []);

    return (
        <div className="flex">
            <ToolBar name={name} 
                onBrushClick={() => setBrushActive(!brushActive)}
                onSaveClick={() => setSaving(!saving)} />
            <div className="flex-1 p-4">
                <p className="text-lg text-gray-700 mb-4">ID: {id}</p>
                <Canvas image={image} 
                    imageId={id as string}
                    brushActive={brushActive} 
                    saveActive={saving}
                    setImage={setImage} />
            </div>
        </div>
    );
};

export default DrawingPage;