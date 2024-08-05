import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const GoogleLoginComponent: React.FC = () => {
    const navigate = useNavigate();

    const handleSuccess = async (response: any) => {
        try {
            const serverResponse = await axios.post('http://localhost:5000/api/auth/google', { token: response.credential });
            const { token } = serverResponse.data;
            Cookies.set('token', token, { expires: 1 });
            navigate('/dashboard');
        } catch (error: any) {
            console.error(error);
        }
    };

    const handleError = (error: any) => {
        console.log(error);
    };

    return (
        <GoogleOAuthProvider clientId="594073034150-lh9qq65j01fhdm0f5306ar93oeurf0uk.apps.googleusercontent.com">
            <div className='google-login w-full'>
                <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={() => handleError}
                    width={999}
                />
            </div>
        </GoogleOAuthProvider>
    );
};

export default GoogleLoginComponent;