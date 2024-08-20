import React, { useState } from 'react';
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

    return (
        <div className="flex">
            <ToolBar name={project.name} onBrushClick={() => setBrushActive(!brushActive)} />
            <div className="flex-1 p-4">
                <p className="text-lg text-gray-700 mb-4">ID: {id}</p>
                <Canvas image={project.image} brushActive={brushActive} />
            </div>
        </div>
    );
};

export default DrawingPage;