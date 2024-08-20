import React, { useState } from 'react';
import authService from '../Services/AuthService';
import { useBaseUrl } from '../Contexts/BaseUrlContext';

const ForgotPassword = () => {
    const baseUrl = useBaseUrl();

    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [messageSent, setMessageSent] = useState(false);

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        setEmailError('');
    };

    const handleSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!email) {
            setEmailError('Email is required');
            return;
        }

        try {
            const result = await authService.forgotPassword(email, baseUrl);
            if (result.success) {
                setMessageSent(true);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.log(error);
            setEmailError('Failed to send email. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="hidden md:block md:w-1/2">
                    <img src="/forgot.png" alt="Login" className="object-cover h-full w-full" />
                </div>
                <div className="w-full p-8 md:w-1/2 m-auto">
                    {!messageSent ? (
                        <>
                            <h2 className="text-3xl mb-2 text-center font-bold">Forgot your password?</h2>
                            <h6 className="text-lg mb-8 text-center">Enter your email to reset your password</h6>
                            <form className="flex flex-col">
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="Email"
                                    className="mb-4 p-2 border border-gray-300 rounded"
                                    onChange={handleEmailChange}
                                    required
                                />
                                {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white py-2 rounded mb-4"
                                    onClick={handleSubmit}
                                >
                                    Submit
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <h2 className="text-3xl mb-2 text-center font-bold">Email has been succesfully sent!</h2>
                            <h6 className="text-lg mb-8 text-center">Check your email and follow futher instructtions</h6>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;