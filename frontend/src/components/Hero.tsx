import React, { useEffect } from "react";
import Avatar from '@mui/material/Avatar';
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignInAlt } from "@fortawesome/free-solid-svg-icons";

const Hero: React.FC = () => {
    const mainDivStyle: React.CSSProperties = {
        height: '100vh',
        backgroundImage: 'linear-gradient(to right, #24243e, #302b63, #0f0c29)',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
    };
    
    const headingStyle = {
        background: 'linear-gradient(to right, #43c6ac, #f8ffae)',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        fontFamily: '"Playwrite AR", cursive',
        fontWeight: 700,
    };

    const subheadingStyle = {
        fontFamily: '"Montserrat", sans-serif',
        fontWeight: 400,
    };

    const paragraphStyle = {
        fontFamily: '"Montserrat", sans-serif',
        fontWeight: 300,
        maxWidth: '90%',
        margin: '0 auto',
    };

    const navigate = useNavigate();
    const handleGetLogin = () => {
        navigate('/login');
    };

    return (
        <>
            <div style={mainDivStyle}>
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                    <Link to="/">
                        <Avatar alt="Logo" src="/logo.png" className="mr-4" style={{ width: '50px', height: '50px', backgroundColor: 'white'}} />
                    </Link>
                </div>
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                    <Link to="/login" className="text-white font-semibold text-lg sm:text-xl bg-zinc-500 bg-opacity-0 px-4 py-2 sm:px-6 sm:py-3 rounded-full hover:bg-opacity-20 flex items-center">
                        <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
                        Login
                    </Link>
                </div>
                <div className="bg-gray-900 bg-opacity-40 backdrop-filter backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-lg">
                    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4 p-4" style={headingStyle}>
                        Virtuoso Board
                    </h1>
                    <h3 className="text-2xl sm:text-3xl md:text-4xl text-gray-300 mb-4" style={subheadingStyle}>
                        The Ultimate Graphics Editor for Team Collaboration
                    </h3>
                    <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 w-3/4" style={paragraphStyle}>
                        Unleash your creativity with Virtuoso Board. Seamlessly create, share, and collaborate on stunning graphics with your team in real-time. Whether you're designing a marketing campaign, crafting social media visuals, or collaborating on a project, Virtuoso Board provides the tools you need to bring your ideas to life.
                    </p>
                    <button onClick={handleGetLogin} className="px-6 mt-6 sm:px-8 py-2 sm:py-3 rounded-full border-2 border-purple-400 bg-black bg-opacity-40 text-xl sm:text-2xl text-gray-300  hover:shadow-gradient transition duration-150 ease-linear">
                        Get Started
                    </button>
                </div>
            </div>
        </>
    );
};

export default Hero;