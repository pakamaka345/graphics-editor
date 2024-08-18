import axios from 'axios';
import Cookies from 'js-cookie';

class AuthService {

    async login(email: string, password: string, rememberMe: boolean, BASE_URL: string) {
        try {
            const response = await axios.post(`${BASE_URL}/users/login`, { email, password, rememberMe });

            if (rememberMe) {
                Cookies.set('token', response.data.token, { expires: 30 });
                console.log('remember me');
            } else {
                Cookies.set('token', response.data.token);
                console.log('not remember me');
            }

            return { success: true, message: '' };
        } catch (error: any) {
            if (error.response.status === 400) 
                return { success: false, message: error.response.data };
            return { success: false, message: 'An error occurred' };
        }
    }

    async Register(login: string, email: string, password: string, BASE_URL: string) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        try {
            if (!emailRegex.test(email)) {
                return { success: false, message: 'Invalid email' };
            }

            await axios.post(`${BASE_URL}/users/register`, { login, email, password });

            return { success: true, message: '' };
        } catch (error: any) {
            if (error.response.status === 400)
                return { success: false, message: error.response.data };
            return { success: false, message: 'An error occurred' };
        }
    }

    async forgotPassword(email: string, BASE_URL: string) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        try {
            if (!emailRegex.test(email)) {
                return { success: false, message: 'Invalid email' };
            }
            await axios.post(`${BASE_URL}/users/forgot-password`, { email });
            return { success: true, message: '' };
        } catch (error: any) {
            if (error.response.status === 400)
                return { success: false, message: error.response.data };
            return { success: false, message: 'An error occurred' };
        }
    }

    async resetPassword(token: string, password: string, confirmPassword: string, email: string, BASE_URL: string) {
        try {
            await axios.put(`${BASE_URL}/users/reset-password`, { token, password, confirmPassword, email });
            return { success: true, message: '' };
        } catch (error: any) {
            if (error.response.status === 400)
                return { success: false, message: error.response.data };
            return { success: false, message: 'An error occurred' };
        }

    }
}

export default new AuthService();