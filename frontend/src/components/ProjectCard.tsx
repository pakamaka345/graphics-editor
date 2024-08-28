import React from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import {useNavigate} from 'react-router-dom';
import {useBaseUrl} from '../Contexts/BaseUrlContext';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faUsers, faTrashCan, faClockRotateLeft} from '@fortawesome/free-solid-svg-icons';

interface ProjectCardProps {
    project: {
        id: string;
        name: string;
        createdAt: string;
        lastUpdatedAt: string;
        imagePreview: string;
        collaboratorsCount: number;
    };
    onDelete: (projectId: string) => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    isHovered: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({project, onDelete, onMouseEnter, onMouseLeave, isHovered}) => {
    const baseUrl = useBaseUrl();
    const navigate = useNavigate();

    const [isConfirmationOpen, setIsConfirmationOpen] = React.useState(false);
    const confirmationRef = React.useRef(null);

    const IsToday = new Date(project.lastUpdatedAt).toDateString() === new Date().toDateString();
    let dateString: string = '';
    if (!IsToday) {
        dateString = project.lastUpdatedAt.split("T")[0];
    } else {
        dateString += (new Date(project.lastUpdatedAt).getHours() < 10) ? '0' + new Date(project.lastUpdatedAt).getHours() : new Date(project.lastUpdatedAt).getHours();
        dateString += ':';
        dateString += (new Date(project.lastUpdatedAt).getMinutes() < 10) ? '0' + new Date(project.lastUpdatedAt).getMinutes() : new Date(project.lastUpdatedAt).getMinutes();
    }

    const handleDelete = async () => {
        try {
            await axios.delete(`${baseUrl}/projects/${project.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get('token')}`
                    }
                });
            onDelete(project.id);
        } catch (error: any) {
            console.error('Error deleting project:', error.response.data);
        }
    }

    const handleGetImage = async () => {
        try {
            navigate(`/projects/${project.id}`);
        } catch (error: any) {
            console.error('Error getting project:', error.response.data);
        }
    }

    const handleClickOutside = (event) => {
        if (confirmationRef.current && !confirmationRef.current.contains(event.target)) {
            setIsConfirmationOpen(false);
        }
    };

    React.useEffect(() => { //for automatic closing of confirmation dialog
        if (isConfirmationOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isConfirmationOpen]);

    return (
        <div
            className="group bg-cyan-600 bg-opacity-30 backdrop-blur-md w-72 h-64 flex flex-col justify-center items-center text-gray-800 rounded-xl shadow-lg transform transition-transform duration-200 ease-in-out cursor-pointer relative overflow-clip"
            onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            { isHovered && <div
                className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-40 animate-shine"/>
                /* shine effect */}

            <div className="absolute top-0 left-0 p-2 bg-cyan-700 text-white rounded-br-lg">
                <FontAwesomeIcon icon={faClockRotateLeft}/>
                <span className="ml-2">{dateString}</span>
            </div>
            <div
                onClick={() => setIsConfirmationOpen(true)}
                className="absolute top-0 right-0 p-2 bg-cyan-700 text-white rounded-bl-lg hover:bg-red-600 cursor-pointer"
            >
                <FontAwesomeIcon icon={faTrashCan}/>
            </div>
            <div onClick={handleGetImage} className="size-full p-4 mt-8 flex flex-col">
                <div className="flex flex-col justify-center items-center h-48">
                    <img
                        src={project.imagePreview}
                        alt={project.name}
                        className="w-full h-full object-contain rounded-lg"
                    />
                </div>
                <div className="flex pb-2 justify-between items-center">
                    <p className="text-2xl font-semibold truncate text-white">{project.name}</p>
                    <div className="flex items-center text-white">
                        <span className="text-2xl mr-2">{project.collaboratorsCount}</span>
                        <FontAwesomeIcon icon={faUsers}/>
                    </div>
                </div>
            </div>

            {isConfirmationOpen && (
                <div
                    className="absolute top-8 right-0 mt-5 bg-white border border-gray-300 p-4 rounded-lg shadow-lg z-10 w-[80%]"
                    ref={confirmationRef}>
                    <div
                        className="absolute -top-2 right-2 w-4 h-4 bg-white transform rotate-45 border-t border-l border-gray-300"></div>
                    {/* Стрілка */}
                    <p className="text-black mb-4 text-sm">Are you sure you want to delete this project?</p>
                    <div className="flex justify-between">
                        <button
                            onClick={handleDelete}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200 text-sm"
                        >
                            Delete
                        </button>
                        <button
                            onClick={() => setIsConfirmationOpen(false)}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition duration-200 text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectCard;