import React from 'react';
import FacebookLogin from 'react-facebook-login';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const CustomFacebookLoginButton: React.FC = () => {
    const navigate = useNavigate();
    
    const responseFacebook = async (response: any) => {
        try {
            const serverResponse = await axios.post('http://localhost:5000/api/auth/facebook', { token: response.accessToken, name: response.name });
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
                cssClass="h-9 w-full bg-blue-600 text-white rounded-md text-l font-semibold flex items-center justify-center hover:bg-blue-700"
                textButton={ "Login with Facebook" }
            />
        </div>
    );
};

export default CustomFacebookLoginButton;