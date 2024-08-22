import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBaseUrl } from '../Contexts/BaseUrlContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import Cookies from 'js-cookie';

const UploadImage: React.FC = () => {
    const baseUrl = useBaseUrl();
    const navigate = useNavigate();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDivClick = () => {
        fileInputRef.current?.click();
    };

    const getBase64String = async (file: File) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        return new Promise<string>((resolve, reject) => {
            reader.onload = () => {
                resolve(reader.result as string);
            }
            reader.onerror = (error) => {
                reject(error);
            }
        });
    };

    const getImageDimensions = async (base64string: string) => {
        const image = new Image();
        image.src = base64string;
        return new Promise<{ width: number, height: number }>((resolve, reject) => {
            image.onload = () => {
                resolve({ width: image.width, height: image.height });
            }
            image.onerror = (error) => {
                reject(error);
            }
        });
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const base64String = await getBase64String(file);
                const dimensions = await getImageDimensions(base64String);

                const token = Cookies.get('token')!;
                const userId = jwtDecode(token).sub;
                
                const name = file.name;

                const response = await axios.post(`${baseUrl}/projects/upload`,
                    {
                        name: name,
                        width: dimensions.width,
                        height: dimensions.height,
                        userId: userId,
                        image: base64String,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                
                navigate(`/projects/${response.data.id}`); 
            } catch (error) {
                console.error('Error reading file:', error);
            }
        } else {
            console.error('No file selected');
        }
    };

    return (
        <div onClick={handleDivClick} className="bg-cyan-600 w-72 h-32 flex flex-col justify-center items-center text-gray-800 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-200 ease-in-out cursor-pointer">
            <input
                type="file"
                ref={fileInputRef}
                className='hidden'
                onChange={handleFileChange}
            />

            <div className="flex flex-col items-center">
                <FontAwesomeIcon icon={faUpload} size="3x" className="text-white mb-2" />
                <p className="text-2xl font-semibold text-white">Upload Image</p>
            </div>
        </div>
    );
};

export default UploadImage;