import axios from 'axios';
import Cookies from 'js-cookie';

class AuthService {
    private apiUrl = 'http://localhost:5000/api/users';

    async login(email: string, password: string, rememberMe: boolean) {
        try {
            const response = await axios.post(`${this.apiUrl}/login`, { email, password, rememberMe });

            if (rememberMe) {
                Cookies.set('token', response.data.token, { expires: 30 });
            } else {
                Cookies.set('token', response.data.token);
            }

            return { success: true, message: '' };
        } catch (error: any) {
            if (error.response.status === 400) 
                return { success: false, message: error.response.data };
            return { success: false, message: 'An error occurred' };
        }
    }

    async Register(login: string, email: string, password: string) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        try {
            if (!emailRegex.test(email)) {
                return { success: false, message: 'Invalid email' };
            }

            await axios.post(`${this.apiUrl}/register`, { login, email, password });

            return { success: true, message: '' };
        } catch (error: any) {
            if (error.response.status === 400)
                return { success: false, message: error.response.data };
            return { success: false, message: 'An error occurred' };
        }
    }
}

export default new AuthService();