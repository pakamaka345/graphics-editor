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
}

const ProjectCard: React.FC<ProjectCardProps> = ({project, onDelete}) => {
    const baseUrl = useBaseUrl();
    const navigate = useNavigate();

    const IsToday = new Date(project.lastUpdatedAt).toDateString() === new Date().toDateString();
    const dateString = IsToday ? new Date(project.lastUpdatedAt).getHours() + ':' + new Date(project.lastUpdatedAt).getMinutes() : project.lastUpdatedAt.split("T")[0];

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

    return (
        <div
        className="bg-cyan-600 bg-opacity-30 backdrop-blur-md w-72 h-64 flex flex-col justify-center items-center text-gray-800 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-200 ease-in-out cursor-pointer">
            <div className="absolute top-0 left-0 p-2 bg-cyan-700 text-white rounded-br-lg">
                <FontAwesomeIcon icon={faClockRotateLeft}/>
                <span className="ml-2">{dateString}</span>
            </div>
            <div onClick={handleDelete}
                 className="absolute top-0 right-0 p-2 bg-cyan-700 text-white rounded-bl-lg hover:bg-cyan-800 cursor-pointer">
                <FontAwesomeIcon icon={faTrashCan}/>
            </div>
            <div onClick={handleGetImage} className="w-full h-full p-4 mt-8 flex flex-col">
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
        </div>
    );
};

export default ProjectCard;