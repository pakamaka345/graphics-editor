import React, { useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useBaseUrl } from '../contexts/BaseUrlContext';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { gapi } from 'gapi-script';

const GoogleLoginComponent: React.FC = () => {
    const navigate = useNavigate();
    const baseUrl = useBaseUrl();

    useEffect(() => {
        function start() {
            gapi.client.init({
                clientId: '594073034150-lh9qq65j01fhdm0f5306ar93oeurf0uk.apps.googleusercontent.com',
                scope: 'profile email',
            });
        }
        gapi.load('client:auth2', start);
    }, []);

    const handleSuccess = async (codeResponse: any) => {
        try {
            const { access_token } = codeResponse;
            const userInfo = await gapi.client.request({
                path: 'https://www.googleapis.com/oauth2/v3/userinfo',
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            });

            const { name, email } = userInfo.result;

            const serverResponse = await axios.post(`${baseUrl}/auth/google`, { name, email });
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

    const login = useGoogleLogin({
        onSuccess: handleSuccess,
        onError: handleError
    });

    return (
        <div className="flex items-center justify-center w-full align-middle">
            <button onClick={() => login()}
                className="h-11 px-4 py-2 border w-full justify-center flex gap-2 border-slate-200 rounded-lg text-slate-700 hover:border-slate-400 hover:text-slate-900 hover:shadow transition duration-150">
                <img className="w-6 h-6" src="https://www.svgrepo.com/show/475656/google-color.svg" loading="lazy" alt="google logo" />
                <span>Login with Google</span>
            </button>
        </div>
    );
};

export default GoogleLoginComponent;