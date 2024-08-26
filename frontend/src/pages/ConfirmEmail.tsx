import React from "react";
import {useBaseUrl} from "../Contexts/BaseUrlContext.tsx";
import {useLocation} from "react-router-dom";
import AuthService from "../Services/AuthService.ts";

const ConfirmEmail: React.FC = () => {

    const base_url = useBaseUrl();
    const token = new URLSearchParams(useLocation().search).get('token')?.replace(/\s/g, '+'); //retrieve token from url query

    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<boolean>(false);

    React.useEffect(() => {
        const confirm = async () => {
            try {
                const response = await AuthService.confirmEmail(token, base_url);
                if (response.success) {
                    setIsLoading(false);
                    console.log('Email confirmed');
                } else {
                    setError(true);
                }
            } catch (error: any) {
                setError(true);
            }
        }
        confirm();
    }, []);


    return (
        <div className="flex items-center justify-center h-screen">
            {isLoading && <h1 className="text-3xl text-white">Loading...</h1>}
            {error && <h1 className="text-3xl text-white">An error occurred</h1>}
            {!isLoading && !error && <h1 className="text-3xl text-white">Email confirmed!</h1>}
        </div>
    );
}

export default ConfirmEmail;