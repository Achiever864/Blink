import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";
import { useStatus } from "./StatusBarContext";
import type { AuthFormData, UserProfile } from "../types/auth";
import { useNavigate } from "react-router-dom";

interface AuthContextType{
    user: UserProfile | null;
    isLoading: boolean;
    login: (credentials: AuthFormData) => Promise<void>;
    register: (credentials: AuthFormData) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext <AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { showStatus } = useStatus();
    const navigate = useNavigate();

    //actual request to handle login
    const login = async (credentials: AuthFormData) => {
        setIsLoading(true);
        try{
            const res = await API.post("/login", {
                email: credentials.email,
                password: credentials.password
            });

            const token = res.data.user.token;
            const username = res.data.user.username;
            const email = res.data.user.email;
            const userId = res.data.user.id;

            localStorage.setItem("token", token);
            localStorage.setItem('username', username);
            localStorage.setItem("email", email);
            localStorage.setItem("userId", userId);
            
            const userProfile: UserProfile = {
                id: userId,
                username: username,
                email: email
            };
            setUser(userProfile);

            showStatus("Access authorized. Syncing system profile", "success");
        } catch(error: any){
            const errorMsg = error.response?.data?.message || "Authentication rejected: Invalid credentials.";
            showStatus(errorMsg, "error");
            throw error; //let the component know it failed if needed
        } finally{
            setIsLoading(false);
        }
    };

    //Handle Registration
    const register = async (credentials: AuthFormData) => {
        setIsLoading(true);
        try {
            const res = await API.post("/register", credentials);
            const { token, userProfile } = res.data;

            localStorage.setItem("myToken", token);
            setUser(userProfile);

            showStatus("Account initialized! Welcome to Blink.", "success");
        } catch(error: any){
            const errorMsg = error.response?.data?.message || "Registration failed. Try again";
            showStatus(errorMsg, "error");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    //Lets handle the logout here
    const logout = () => {
        localStorage.removeItem("myToken");
        setUser(null);
        showStatus("Session terminated. See you soon!", "success");
        navigate("/")
    };

    return(
        <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be executed inside an AuthProvider wrapper");
    return context;
}