import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBaseUrl } from "../contexts/BaseUrlContext";
import authService from '../Services/AuthService';
import GoogleLoginComponent from "../components/GoogleLogin";
import FacebookLoginComponent from "../components/FacebookLogin";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faApple } from "@fortawesome/free-brands-svg-icons";
import { GoogleOAuthProvider } from "@react-oauth/google";

const Login: React.FC = () => {
    const navigate = useNavigate();
    const baseUrl = useBaseUrl();

    const [isLogin, setIsLogin] = useState(true);
    const [isEmail, setIsEmail] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [login, setLogin] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [Error, setError] = useState('');

    const nullErrors = () => {
        setLoginError('');
        setEmailError('');
        setPasswordError('');
        setError('');
    }

    const handleLoginChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLogin(event.target.value);
    }

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
    };

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    };

    const handleRememberMeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRememberMe(event.target.checked);
    };

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setEmailError('');
        setPasswordError('');

        if (email === '') {
            setEmailError('Email is required');
        }
        if (password === '') {
            setPasswordError('Password is required');
        }
        if (email === '' || password === '') {
            return;
        }

        const result = await authService.login(email, password, rememberMe, baseUrl);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }
    }

    const handleRegister = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoginError('');
        setEmailError('');
        setPasswordError('');

        if (login === '') {
            setLoginError('Name is required');
        }
        if (email === '') {
            setEmailError('Email is required');
        }
        if (password === '') {
            setPasswordError('Password is required');
        }
        if (login === '' || email === '' || password === '') {
            return;
        }

        const result = await authService.Register(login, email, password, baseUrl);

        if (result.success) {
            setIsLogin(true);
        } else {
            setError(result.message);
        }
    }

    const loginForm = () => (
        <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="hidden md:block md:w-1/2">
                <img src="/login.png" alt="Login" className="object-cover h-full w-full" />
            </div>
            <div className="w-full p-8 md:w-1/2">
                <h2 className="text-3xl mb-2 text-center font-bold">Hi there!</h2>
                <h6 className="text-lg mb-8 text-center">Welcome to Virtuoso</h6>
                {isEmail ? (
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
                        <input
                            type="password"
                            id="password"
                            placeholder="Password"
                            className="mb-4 p-2 border border-gray-300 rounded"
                            onChange={handlePasswordChange}
                            required
                        />
                        {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                        <div className="flex items-center mb-4">
                            <input
                                type="checkbox"
                                id="rememberMe"
                                checked={rememberMe}
                                onChange={handleRememberMeChange}
                                className="mr-2 cursor-pointer"
                            />
                            <label htmlFor="rememberMe" className="hover:underline cursor-pointer">Remember me</label>
                        </div>
                        <button
                            type="button"
                            className="relative text-blue-500 mb-4 hover:underline"
                            onClick={() => navigate('/forgot-password')}
                        >Forgot password?</button>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white py-2 rounded mb-4 hover:bg-blue-600 transition-colors duration-300"
                            onClick={handleLogin}
                        >
                            Sign In
                        </button>
                        {Error && <p className="text-red-500 text-sm text-center">{Error}</p>}
                    </form>
                ) : (
                    <div className="flex flex-col items-center mb-4">
                        <div className="w-full max-w-sm mb-4">
                            <GoogleOAuthProvider clientId="594073034150-lh9qq65j01fhdm0f5306ar93oeurf0uk.apps.googleusercontent.com">
                                <GoogleLoginComponent />
                            </GoogleOAuthProvider>
                        </div>
                        <div className="w-full max-w-sm mb-4">
                            <button
                                className="bg-black text-white py-2 rounded w-full flex items-center justify-center"
                            >
                                <FontAwesomeIcon icon={faApple} className="mr-2" />
                                Continue with Apple
                            </button>
                        </div>
                        <div className="w-full max-w-sm mb-4">
                            <FacebookLoginComponent />
                        </div>
                    </div>
                )}
                <div className="flex justify-center mt-1 w-full">
                    <button
                        className="text-blue-500 w-full hover:underline"
                        onClick={() => setIsEmail(!isEmail)}
                    >
                        {isEmail ? "Sign in with social accounts" : "Sign in with email"}
                    </button>
                </div>
                <div className="flex justify-center mt-1 w-full">
                    <button
                        className="text-blue-500 w-full hover:underline"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            nullErrors();
                        }}
                    >
                        {isLogin ? "Create an account" : "Sign In"}
                    </button>
                </div>
            </div>
        </div>
    );

    const registerForm = () => (
        <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="w-full p-8 md:w-1/2">
                <h2 className="text-3xl mb-2 text-center font-bold">Create an account</h2>
                <h6 className="text-lg mb-8 text-center">Welcome to Virtuoso</h6>
                <form className="flex flex-col">
                    <input
                        type="text"
                        id="name"
                        placeholder="Name"
                        className="mb-4 p-2 border border-gray-300 rounded"
                        onChange={handleLoginChange}
                        required
                    />
                    {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
                    <input
                        type="email"
                        id="email"
                        placeholder="Email"
                        className="mb-4 p-2 border border-gray-300 rounded"
                        onChange={handleEmailChange}
                        required
                    />
                    {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
                    <input
                        type="password"
                        id="password"
                        placeholder="Password"
                        className="mb-4 p-2 border border-gray-300 rounded"
                        onChange={handlePasswordChange}
                        required
                    />
                    {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                    <button
                        type="submit"
                        className="bg-blue-500 text-white py-2 rounded mb-4"
                        onClick={handleRegister}
                    >
                        Sign Up
                    </button>
                    {Error && <p className="text-red-500 text-sm text-center">{Error}</p>}
                </form>
                <div className="flex justify-center mt-2">
                    <button
                        className="text-blue-500"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            nullErrors();
                        }}
                    >
                        {isLogin ? "Create an account" : "Sign In"}
                    </button>
                </div>
            </div>
            <div className="hidden md:block md:w-1/2">
                <img src="/register.png" alt="Register" className="object-cover h-full w-full" />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            {isLogin ? loginForm() : registerForm()}
        </div>
    );
};

export default Login;
