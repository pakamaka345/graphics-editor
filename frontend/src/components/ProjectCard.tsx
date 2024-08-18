import React from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { useBaseUrl } from '../contexts/BaseUrlContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faTrashCan, faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';

interface ProjectCardProps {
    project: {
        id: string;
        name: string;
        createdAt: string;
        lastUpdatedAt: string;
        imagePreview: string;
        coloboratorsCount: number;
    };
    onDelete: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete }) => {
    const baseUrl = useBaseUrl();
    const navigate = useNavigate();

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
            const response = await axios.get(`${baseUrl}/projects/${project.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get('token')}`
                    }
                });
            
            const newProject = {
                name: response.data.name,
                image: response.data.image,
            };

            navigate(`/projects/${project.id}`, { state: { project: newProject } });
        } catch (error: any) {
            console.error('Error getting project:', error.response.data);
        }
    }

    return (
        <div className="bg-cyan-600 w-72 h-62 flex flex-col justify-center items-center text-gray-800 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-200 ease-in-out">
            <div className = "absolute top-0 left-0 p-2 bg-cyan-500 text-white rounded-br-lg">
                <FontAwesomeIcon icon={faClockRotateLeft} />
                <span className="ml-2">{project.lastUpdatedAt.split("T")[0]}</span>
            </div>
            <div onClick={handleDelete} className="absolute top-0 right-0 p-2 bg-cyan-500 text-white rounded-bl-lg hover:bg-cyan-700 cursor-pointer">
                <FontAwesomeIcon icon={faTrashCan} />
            </div>
            <div onClick={handleGetImage} className="w-full h-full p-4 mt-2 flex flex-col">
                <div className="flex flex-col justify-center items-center h-48">
                    <img
                        src={project.imagePreview}
                        alt={project.name}
                        className="w-full h-full object-contain rounded-lg"
                    />
                </div>
                <div className="flex justify-between items-center mt-4">
                    <p className="text-2xl font-semibold truncate text-white">{project.name}</p>
                    <div className="flex items-center text-white">
                        <span className="text-2xl mr-2">{project.coloboratorsCount}</span>
                        <FontAwesomeIcon icon={faUsers} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;