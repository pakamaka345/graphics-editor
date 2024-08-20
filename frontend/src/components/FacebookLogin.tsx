import React from 'react';
import FacebookLogin from 'react-facebook-login';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { useBaseUrl } from '../Contexts/BaseUrlContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';

const CustomFacebookLoginButton: React.FC = () => {
    const navigate = useNavigate();
    const baseUrl = useBaseUrl();

    const responseFacebook = async (response: any) => {
        try {
            const serverResponse = await axios.post(`${baseUrl}/auth/facebook`, { token: response.accessToken, name: response.name });
            const { token } = serverResponse.data;
            Cookies.set('token', token, { expires: 1 });
            navigate('/dashboard');
        } catch (error: any) {
            console.error(error);
        }
    };

    const handleError = (error: any) => {
        console.error(error);
    };

    return (
        <div className="facebook-login">
            <FacebookLogin
                appId="507045291829431"
                autoLoad={false}
                fields="name,picture"
                callback={responseFacebook}
                onFailure={handleError}
                cssClass="h-11 w-full bg-blue-600 text-white rounded-md flex items-center justify-center hover:bg-blue-700"
                textButton={ "Login with Facebook" }
                icon={<FontAwesomeIcon icon={faFacebook} className="mr-2 h-6 w-6" />}
            />
        </div>
    );
};

export default CustomFacebookLoginButton;