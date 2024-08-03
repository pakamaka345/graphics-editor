import React, { useState } from "react";
import { TextField, Button, FormControlLabel, Checkbox, Typography, Box } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faApple, faFacebook } from "@fortawesome/free-brands-svg-icons";
import { makeStyles } from '@mui/styles';
import { useNavigate } from "react-router-dom";
import authService from '../Services/AuthService';
import GoogleLoginComponent from "../components/GoogleLogin";
import FacebookLoginComponent from "../components/FacebookLogin";

const useStyles = makeStyles({
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        fontFamily: 'Arial, sans-serif',
    },
    box: {
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
    },
    imageBox: {
        width: '50%',
        display: 'none',
        '@media (min-width: 768px)': {
            display: 'block',
        },
    },
    formBox: {
        width: '100%',
        padding: '32px',
        '@media (min-width: 768px)': {
            width: '50%',
        },
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'left',
    },
    formControl: {
        marginBottom: '16px',
    },
    button: {
        alignSelf: 'center',
        marginBottom: '16px',
        width: '75%',
    },
    switchButton: {
        marginTop: '8px',
        textAlign: 'left',
    },
    socialButton: {
        marginBottom: '16px',
    },
    forgotPasswordButton: {
        justifyContent: 'flex-start',
        textAlign: 'left',
        width: 'auto',
        marginLeft: 0,
        marginRight: 'auto'
    },
    socialButtonContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '10px 0',
    },
    socialButtonWrapper: {
        width: '100%',
        maxWidth: '400px',
        marginBottom: '16px',
    },
});

const Login: React.FC = () => {
    const classes = useStyles();
    const navigate = useNavigate();
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
        
        const result = await authService.login(email, password, rememberMe);

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

        const result = await authService.Register(login, email, password);

        if (result.success) {
            setIsLogin(true);
        } else {
            setError(result.message);
        }
    }


    const loginForm = () => (
        <Box className={classes.box}>
            <Box className={classes.imageBox}>
                <img src="/login.png" alt="Login" className="object-cover h-full w-full" />
            </Box>
            <Box className={classes.formBox}>
                <Typography variant="h2" className="mb-2 text-center bold">Hi there!</Typography>
                <Typography variant="h6" className="mb-24 text-center">Welcome to Virtuoso</Typography>
                {isEmail ? (
                    <form className={classes.form}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            className={classes.formControl}
                            onChange={handleEmailChange}
                            error={!!emailError}
                            helperText={emailError}
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            className={classes.formControl}
                            onChange={handlePasswordChange}
                            error={!!passwordError}
                            helperText={passwordError}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={rememberMe}
                                    onChange={handleRememberMeChange}
                                    name="rememberMe"
                                    color="primary"
                                />
                            }
                            label="Remember me"
                            className={classes.formControl}
                        />
                        <Button
                            variant="text"
                            color="primary"
                            className={`${classes.forgotPasswordButton} ${classes.formControl}`}    
                        > Forgot password? </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            className={classes.button}
                            onClick={handleLogin}
                        >
                            Sign In
                        </Button>
                        <Typography variant="subtitle2" color="error" className="text-center">{Error}</Typography>
                    </form>
                ) : (
                    <Box className={classes.socialButtonContainer}>
                        <Box className={classes.socialButtonWrapper}>
                            <GoogleLoginComponent />
                        </Box>
                        <Box className={classes.socialButtonWrapper}>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<FontAwesomeIcon icon={faApple} />}
                                fullWidth
                                className={classes.socialButton}
                            >
                                Continue with Apple
                            </Button>
                        </Box>
                        <Box className={classes.socialButtonWrapper}>
                            <FacebookLoginComponent />
                        </Box>
                    </Box>
                )}
                <Box display="flex" justifyContent="center" mt={1}>
                    <Button
                        variant="text"
                        color="primary"
                        onClick={() => setIsEmail(!isEmail)}
                    > {isEmail ? "Sign in with social accounts" : "Sign in with email"} </Button>
                </Box>
                <Box display="flex" justifyContent="center" mt={1}>
                    <Button
                        variant="text"
                        color="primary"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            nullErrors();
                        }}
                    > {isLogin ? "Create an account" : "Sign In"} </Button>
                </Box>
            </Box>
        </Box>
    );

    const registerForm = () => (
        <Box className={classes.box}>
            <Box className={classes.formBox}>
                <Typography variant="h4" className="mb-2 text-center">Create an account</Typography>
                <Typography variant="subtitle1" className="mb-6 text-center">Welcome to Virtuoso</Typography>
                <form className={classes.form}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="name"
                        label="Name"
                        name="name"
                        autoComplete="name"
                        autoFocus
                        className={classes.formControl}
                        onChange={handleLoginChange}
                        error={!!loginError}
                        helperText={loginError}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email"
                        name="email"
                        autoComplete="email"
                        className={classes.formControl}
                        onChange={handleEmailChange}
                        error={!!emailError}
                        helperText={emailError}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        className={classes.formControl}
                        onChange={handlePasswordChange}
                        error={!!passwordError}
                        helperText={passwordError}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        onClick={handleRegister}
                    > Sign Up </ Button>
                    <Typography variant="subtitle2" color="error" className="text-center">{Error}</Typography>
                </form>
                <Box display="flex" justifyContent="center" mt={2}>
                    <Button
                        variant="text"
                        color="primary"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            nullErrors();
                        }}
                    > {isLogin ? "Create an account" : "Sign In"} </ Button>
                </Box>
            </Box>
            <Box className={classes.imageBox}>
                <img src="/register.png" alt="Register" className="object-cover h-full w-full" />
            </Box>
        </Box>
    );

    return (
        <div className={classes.container}>
            {isLogin ? loginForm() : registerForm()}
        </div>
    );
};

export default Login;