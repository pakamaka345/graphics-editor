import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useParams } from 'react-router-dom';
import { useBaseUrl } from '../Contexts/BaseUrlContext';
import ToolBar from '../Components/ToolBar';
import Canvas from '../Components/Canvas';
import { Vortex } from 'react-loader-spinner';
import SignalRService from '../Services/SignalRService';

const DrawingPage: React.FC = () => {
    const baseUrl = useBaseUrl();

    const { id } = useParams<{ id: string }>();

    const [brushActive, setBrushActive] = useState(false);
    const [saving, setSaving] = useState(false);
    const [image, setImage] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const signalRServiceRef = useRef<SignalRService>();

    useEffect(() => {
        const getImage = async () => {
            try {
                setLoading(true);
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
            } finally {
                setLoading(false);
            }
        }

        getImage();

        signalRServiceRef.current = new SignalRService(baseUrl);

        const signalRService = signalRServiceRef.current;
        signalRService.joinRoom(id!);

        return () => {
            signalRService.leaveRoom(id!);
        };
    }, []);

    const LoadingComponent = () => {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <Vortex
                height={200}
                width={200}
                colors={['red', 'green', 'blue', 'yellow', 'orange', 'purple']}
                wrapperStyle={{}}
                wrapperClass=""
                visible={true}
                ariaLabel='oval-loading'
            />
        </div>
        );
    };

    return (
        <div className="flex">
            {loading && <LoadingComponent />}
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

