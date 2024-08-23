import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faPaintBrush } from '@fortawesome/free-solid-svg-icons';

interface ToolBarProps { 
    name: string;
    onBrushClick: () => void;
    onSaveClick: () => void;
}

const ToolBar: React.FC<ToolBarProps> = ({ name, onBrushClick, onSaveClick }) => {
    return (
        <div className="flex flex-col p-2">
            <div className="flex items-center gap-3 p-2">
                <h1 className="text-white text-2xl mb-4">{name}</h1>
            </div>
            
            <div className="flex flex-col gap-3 p-2 bg-gray-900 rounded-lg shadow-lg">
                <button onClick={onSaveClick} className="flex justify-center items-center text-xl bg-slate-600 rounded-lg p-3 hover:bg-slate-700 text-white transition-colors duration-300">
                    <FontAwesomeIcon icon={faSave} />
                </button>
                <button onClick={onBrushClick} className="flex justify-center items-center text-xl bg-slate-600 rounded-lg p-3 hover:bg-slate-700 text-white transition-colors duration-300">
                    <FontAwesomeIcon icon={faPaintBrush} />
                </button>
            </div>
        </div>
    );
}

export default ToolBar;