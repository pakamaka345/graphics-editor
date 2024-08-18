import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { BaseUrlProvider } from './contexts/BaseUrlContext';
import Home from './pages/Home';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import DrawingPage from './pages/DrawingPage';



const App: React.FC = () => {
  const BASE_URL = 'http://localhost:5000/api';
  return (
    <BaseUrlProvider baseUrl={BASE_URL}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path='/reset-password' element={<ResetPassword />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />}/>
            <Route path="/projects/:id" element={<DrawingPage />} />
          </Route>
          <Route path="/*" element={<Home/>} />
        </Routes>
      </Router>
    </BaseUrlProvider>
  );
};

export const BASE_URL = 'http://localhost:5000';

export default App;