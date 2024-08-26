import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './Components/ProtectedRoute';
import { BaseUrlProvider } from './Contexts/BaseUrlContext';
import Home from './Pages/Home';
import Login from './Pages/Login';
import ForgotPassword from './Pages/ForgotPassword';
import ResetPassword from './Pages/ResetPassword';
import Dashboard from './Pages/Dashboard';
import DrawingPage from './Pages/DrawingPage';
import ConfirmEmail from "./Pages/ConfirmEmail.tsx";



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
            <Route path='/confirm-email' element={<ConfirmEmail />} />
          </Route>
          <Route path="/*" element={<Home/>} />
        </Routes>
      </Router>
    </BaseUrlProvider>
  );
};

export const BASE_URL = 'http://localhost:5000';

export default App;