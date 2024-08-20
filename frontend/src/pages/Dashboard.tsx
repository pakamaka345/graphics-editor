import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useBaseUrl } from '../Contexts/BaseUrlContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faSignOutAlt, faUser, faCog, faPlus, faClock, faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import UploadImage from '../Components/UploadImage';
import Footer from '../Components/Footer';
import ProjectCard from '../Components/ProjectCard';
import { jwtDecode } from "jwt-decode";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const baseUrl = useBaseUrl();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    width: '',
    height: ''
  });
  const [error, setError] = useState('');
  const [recentProjects, setRecentProjects] = useState<ProjectCard[]>([]);
  const [allProjects, setAllProjects] = useState<ProjectCard[]>([]);
  const [projects, setProjects] = useState<ProjectCard[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${baseUrl}/projects`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get('token')}`
            }
          }
        );
        const projectData = response.data;
        setProjects(projectData);

        const recentSortedProjects = [...projectData].sort((a: { lastUpdatedAt: string }, b: { lastUpdatedAt: string }) => {
          return new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime();
        });

        setRecentProjects(recentSortedProjects.slice(0, 3));

        const allSortedProjects = [...projectData].sort((a: { createdAt: string }, b: { createdAt: string }) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        setAllProjects(allSortedProjects);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProjects();
  }, []);

  const createImage = async (width: number, height: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) {
      return "Error";
    }
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    const whiteImage = canvas.toDataURL('image/png');

    return whiteImage;
  };

  const logout = async () => {
    try {
      await axios.post(`${baseUrl}/users/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`
          }
        }
      );
      Cookies.remove('token');
      navigate('/');
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error(error);
    }
  };

  const handleProjectDelete = (projectId: string) => {
    const updatedProjects = projects.filter((project) => project.id !== projectId);
    setProjects(updatedProjects);

    const updatedRecentProjects = [...updatedProjects].sort((a: { lastUpdatedAt: string }, b: { lastUpdatedAt: string }) => {
      return new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime();
    });
    setRecentProjects(updatedRecentProjects.slice(0, 3));

    const updatedAllProjects = [...updatedProjects].sort((a: { createdAt: string }, b: { createdAt: string }) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    setAllProjects(updatedAllProjects);
  };

  const handleProjectNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewProject({ ...newProject, name: event.target.value });
  };

  const handleProjectWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewProject({ ...newProject, width: event.target.value });
  };

  const handleProjectHeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewProject({ ...newProject, height: event.target.value });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const createNew = () => {
    setIsModalOpen(true);
  }

  const closeModal = () => {
    setIsModalOpen(false);
  }

  const closeBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      setIsModalOpen(false);
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const width = parseInt(newProject.width);
    const height = parseInt(newProject.height);

    if (width <= 0 || height <= 0) {
      setError('Width and height must be greater than 0');
      return;
    }

    const image = await createImage(width, height);
    if (image === "Error") {
      setError('Error creating image');
      return;
    }
    const project = {
      name: newProject.name,
      image: image
    }
    const token = Cookies.get('token')!;
    const userId = jwtDecode(token).sub;

    const createdAt = new Date().toISOString();

    try {
      const response = await axios.post(`${baseUrl}/projects/create`,
        {
          name: project.name,
          width: width,
          height: height,
          userId: userId,
          createdAt: createdAt,
          image: project.image
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      navigate(`/projects/${response.data.id}`, { state: { project } });

    } catch (error) {
      setError('Error with http request');
      console.error(error);
    }
  }

  const Header = () => (
    <header className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-md relative">
      <div className="flex items-center space-x-4">
        <div className="text-2xl font-bold">VladickGayCorp</div>
      </div>

      <div className="relative">
        <FontAwesomeIcon icon={faUserCircle} size="2x" onClick={toggleMenu} className="cursor-pointer hover:text-gray-300 transition duration-200" />

        {isMenuOpen && (
          <div className="absolute top-12 right-0 bg-slate-700 text-white py-2 px-2 rounded-lg shadow-lg z-10 w-48">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 cursor-pointer hover:bg-slate-800 p-2 rounded transition duration-200" onClick={toggleMenu}>
                <FontAwesomeIcon icon={faUser} />
                <span>Profile</span>
              </div>
              <div className="flex items-center space-x-2 cursor-pointer hover:bg-slate-800 p-2 rounded transition duration-200">
                <FontAwesomeIcon icon={faCog} />
                <span>Settings</span>
              </div>
              <hr className="border-t border-white" />
              <div className="flex items-center space-x-2 cursor-pointer hover:bg-red-600 p-2 rounded transition duration-200" onClick={logout}>
                <FontAwesomeIcon icon={faSignOutAlt} />
                <span>Logout</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );


  return (
    <div className="min-h-screen bg-gray-800 text-white">
      <Header />
      <div className="flex flex-col mx-0 p-8">
        <h2 className="text-2xl font-bold mb-6">
          <FontAwesomeIcon icon={faClock} className="mr-2" />
          Recent projects
        </h2>
        <div className="grid grid-cols-4 gap-0">
          <div className="flex space-y-2 flex-col items-center justify-center">
            <div onClick={createNew} className="bg-cyan-600 w-72 h-32 flex flex-col justify-center items-center text-gray-800 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-200 ease-in-out cursor-pointer">
              <div className="flex flex-col items-center">
                <FontAwesomeIcon icon={faPlus} size="3x" className="text-white mb-2" />
                <p className="text-2xl font-semibold text-white">New Project</p>
              </div>
            </div>
            <UploadImage />
          </div>

          {recentProjects.map((project) => (
            <ProjectCard key={project.id} project={project} onDelete={handleProjectDelete} />
          ))}
        </div>

        {/*All projects*/}

        <h2 className="text-2xl font-bold mb-6 mt-12">
          <FontAwesomeIcon icon={faFolderOpen} className="mr-2" />
          All projects
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {allProjects.map((project) => (
            <ProjectCard key={project.id} project={project} onDelete={handleProjectDelete} />
          ))}
        </div>
      </div>

      <div className='border-t border-gray-700'>
        <Footer />
      </div>

      {isModalOpen && (
        <div onClick={closeBackgroundClick} className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-gray-900 p-8 rounded-lg shadow-2xl w-1/3 relative border border-gray-700">
            <h2 className="text-3xl font-extrabold text-gray-200 mb-6">
              Create New Project
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-gray-400 text-lg font-semibold mb-2" htmlFor="projectName">
                  Project Name
                </label>
                <input
                  type="text"
                  id="projectName"
                  name="projectName"
                  className="shadow-inner bg-gray-800 border border-gray-700 rounded w-full py-3 px-4 text-gray-300 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Enter project name"
                  required
                  onChange={handleProjectNameChange}
                />
              </div>

              <div className="flex space-x-4 mb-6">
                <div className='flex-1'>
                  <label className="block text-gray-400 text-lg font-semibold mb-2" htmlFor="projectWidth">
                    Project Width
                  </label>
                  <input
                    type="number"
                    id="projectWidth"
                    name="projectWidth"
                    className="shadow-inner bg-gray-800 border border-gray-700 rounded w-full py-3 px-4 text-gray-300 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Width"
                    required
                    onChange={handleProjectWidthChange}
                  />
                </div>
                <div className='w-4 text-2xl mt-10'>X</div>
                <div className='flex-1'>
                  <label className="block text-gray-400 text-lg font-semibold mb-2" htmlFor="projectHeight">
                    Project Height
                  </label>
                  <input
                    type="number"
                    id="projectHeight"
                    name="projectHeight"
                    className="shadow-inner bg-gray-800 border border-gray-700 rounded w-full py-3 px-4 text-gray-300 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Height"
                    required
                    onChange={handleProjectHeightChange}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 mt-8">
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

interface ProjectCard {
  id: string;
  name: string;
  createdAt: string;
  lastUpdatedAt: string;
  imagePreview: string;
  collaboratorsCount: number;
}