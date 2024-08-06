import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthService from '../Services/AuthService';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const ResetPassword: React.FC = () => {
    const query = useQuery();
    const token = query.get('token')?.replace(/\s/g, '+');
    const email = query.get('email');

    const navigate = useNavigate();
    useEffect(() => {
        if (!token || !email) {
            console.log('Invalid reset link');
            alert('Invalid reset link');
            navigate('/login');
        }
    }, [token, email]);

    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [passwordError, setPasswordError] = React.useState('');

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        setPasswordError('');
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
        setPasswordError('');
    };

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }
        if (!token || !email) return;
        const response = await AuthService.resetPassword(token, password, confirmPassword, email);
        if (response.success) {
            alert('Password reset successfully');
            navigate('/login');
        } else {
            alert('An error occurred. Please try again.');

        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="hidden md:block md:w-1/2">
                    <img src="/forgot.png" alt="Login" className="object-cover h-full w-full" />
                </div>
                <div className="w-full p-8 md:w-1/2 m-auto">
                    <>
                        <h2 className="text-3xl mb-2 text-center font-bold">Reset password</h2>
                        <h6 className="text-lg mb-8 text-center">Enter your new password</h6>
                        <form className="flex flex-col">
                            <input
                                id="password"
                                type="password"
                                placeholder="Password"
                                className="mb-4 p-2 border border-gray-300 rounded"
                                onChange={handlePasswordChange}
                                required
                            />
                            <input
                                id="confirm_password"
                                type='password'
                                placeholder="Confirm Password"
                                className="mb-4 p-2 border border-gray-300 rounded"
                                onChange={handleConfirmPasswordChange}
                                required
                            />
                            {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                            <button
                                type="submit"
                                className="bg-blue-500 text-white py-2 rounded mb-4"
                                onClick={handleSubmit}
                            >
                                Submit
                            </button>
                        </form>
                    </>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
