import React, { useEffect, useState } from 'react';
import { Outlet, Navigate} from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get('token');
      if (token) {
        try {
          await axios.get('http://localhost:5000/api/users/checkAuth', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setIsAuthenticated(true);
        } catch (error) {
          Cookies.remove('token');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Or any other loading component
  }

  return (
    isAuthenticated ? <Outlet/> : <Navigate to="/login" />
  );
};

export default ProtectedRoute;