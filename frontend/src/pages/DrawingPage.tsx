import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useBaseUrl } from '../Contexts/BaseUrlContext';
import ToolBar from '../Components/ToolBar';
import Canvas from '../Components/Canvas';

const DrawingPage: React.FC = () => {
    const baseUrl = useBaseUrl();

    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const { project } = location.state as { project: any } || {};

    const [brushActive, setBrushActive] = useState(false);
    const [saving, setSaving] = useState(false);
    const [image, setImage] = useState<string>('');

    useEffect(() => {
        if (image === '') setImage(project.image);
    }, []);

    return (
        <div className="flex">
            <ToolBar name={project.name} 
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