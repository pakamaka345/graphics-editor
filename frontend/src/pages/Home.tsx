import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBaseUrl } from '../contexts/BaseUrlContext';
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import Cookies from "js-cookie";
import axios from "axios";

const Home: React.FC = () => {
    const navigate = useNavigate();
    const baseUrl = useBaseUrl();

    useEffect(() => {
        const checkAuth = async () => {
          const token = Cookies.get('token');
          if (token) {
            try {
              await axios.get(`${baseUrl}/users/checkAuth`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
              navigate('/dashboard');
            } catch (error) {
                Cookies.remove('token');
            }
          }
        };
    
        checkAuth();
      }, [navigate]);

    return ( 
        <>
            <Hero />
            <Footer />
        </>
    );
};

export default Home;