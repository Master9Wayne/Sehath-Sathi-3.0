import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkUserStatus = async () => {
            try {
                const response = await apiClient.get('/users/me');
                setUser(response.data.data);
            } catch (error) {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        checkUserStatus();
    }, []);

    const login = async (email, password) => {
        const response = await apiClient.post('/users/login', { email, password });
        setUser(response.data.data.user);
        return response;
    };

    // Update this function to accept and send the phone number
    const register = async (fullName, email, password, phonenumber) => {
        return await apiClient.post('/users/register', { fullName, email, password, phonenumber });
    };

    const logout = async () => {
        await apiClient.post('/users/logout');
        setUser(null);
    };

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};