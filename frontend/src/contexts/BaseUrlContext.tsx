import React, { createContext, useContext } from 'react';

const BaseUrlContext = createContext<string | undefined>(undefined);

export const useBaseUrl = () => {
    const context = useContext(BaseUrlContext);
    if (context === undefined) {
        throw new Error('useBaseUrl must be used within a BaseUrlProvider');
    }
    return context;
};

interface BaseUrlProviderProps {
    children: React.ReactNode;
    baseUrl: string;
}

export const BaseUrlProvider: React.FC<BaseUrlProviderProps> = ({ children, baseUrl }) => {
    return (
        <BaseUrlContext.Provider value={baseUrl}>
            {children}
        </BaseUrlContext.Provider>
    );
};