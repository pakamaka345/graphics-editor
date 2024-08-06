import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await axios.post('http://localhost:5000/api/users/logout', 
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
      alert('An error occurred. Please try again.');
      console.error(error);
    }
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <div className='logout flex justify-center'>
        <button className='btn btn-primary' onClick={logout}>Logout</button>
      </div>
    </div>
  );
};

export default Dashboard;