import React from "react";
import Avatar from '@mui/material/Avatar';
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignInAlt } from "@fortawesome/free-solid-svg-icons";

const Hero: React.FC = () => {
    const mainDivStyle = {
        height: '100vh',
        backgroundImage: 'linear-gradient(to right, #24243e, #302b63, #0f0c29)'
    };
    
    const mainFont = {
        fontFamily: '"Montserrat", sans-serif',
        fontWeight: 500,
        fontStyle: 'normal',
    }

    const navigate = useNavigate();
    const handleGetLogin = () => {
        navigate('/login');
    }

    return (
        <>
            <div style={mainDivStyle} className="flex flex-col items-center justify-center">
                <div className="flex justify-around w-full">
                    <div className="absolute top-6 left-8">
                        <Link to="/">
                            <Avatar alt="Logo" src="/logo.svg" className="mr-4" style={{ width: '70px', height: '70px' }} />
                        </Link>
                    </div>
                    <div className="absolute top-8 right-12">
                        <Link to="/login" className="text-white font-semibold hover:underline text-2xl">
                            <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
                            Login
                        </Link>
                    </div>
                </div>
                <div className="bg-gray-900 bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-2xl p-8 shadow-lg text-center">
                    <h1 className="text-8xl font-bold mb-4 p-4"
                        style={{
                            background: 'linear-gradient(to right, #4ac29a, #bdfff3)',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                            fontFamily: '"Playwrite AR", cursive',
                            fontWeight: 400,
                            fontStyle: 'normal',
                        }}>
                        Virtuoso Board
                    </h1>
                    <h3 className="text-4xl text-cyan-600" style={ mainFont }>Graphics editor with collaboration</h3>
                    <p className="text-2xl text-gray-600 mt-4" style={ mainFont }>
                        Create, share and collaborate on graphics with your team in real-time. <br />
                        Get started by logging in or creating an account.
                    </p>
                </div>
            </div>
        </>
    );
};

export default Hero;