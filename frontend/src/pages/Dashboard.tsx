import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import Footer from '../components/Footer';

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
    <>
      <div className='flex'>
        <AsideBar />
        <div className='w-full'>
          <TopElement />
          <div className='logout flex justify-center'>
            <button className='btn btn-primary' onClick={logout}>Logout</button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;

const AsideBar: React.FC = () => {
  return (
    <div className='p-1 w-[15%] bg-blue-950'>
      <h1 className='flex justify-center mt-2'>Virtuoso Board</h1>
      <div className='flex flex-col text-white items-center space-y-10 mt-10'>
        <label>fgfdhh</label>
        <label>fgfdhh</label>
        <label>fgfdhh</label>
      </div>
    </div>
  );
}

const TopElement: React.FC = () => {
  return(
  <div className='h-10 bg-gray-500'>

  </div>);
}