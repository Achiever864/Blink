import React, { createContext, useContext, useState } from "react";
import API from "../api/axios";
import { useStatus } from "./StatusBarContext";
import socket from "../socket";
import type { AuthFormData, UserProfile } from "../types/auth";
import { useNavigate } from "react-router-dom";

interface AuthContextType{
    user: UserProfile | null;
    isLoading: boolean;
    login: (credentials: AuthFormData) => Promise<void>;
    register: (credentials: AuthFormData) => Promise<void>;
    logout: () => void;
    updateUser: (updatedFields: Partial<UserProfile>) => void;
}

const AuthContext = createContext <AuthContextType | undefined>(undefined);

const buildUserProfile = (raw: any): UserProfile => ({
    id: raw._id || raw.id,
    username: raw.username,
    email: raw.email,
    profilePicture: raw.profilePicture?.url || raw.profilePicture || "",
    firstName: raw.firstName || "",
    lastName: raw.LastName || raw.lastName || "",
    bio: raw.bio || "",
    website: raw.website || "",
    occupation: raw.occupation || "",
    nationality: raw.nationality || "",
    city: raw.city || "",
    dateOfBirth: raw.dateOfBirth || "",
    interests: raw.interests || []
});

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("userProfile");

        if (token && storedUser) {
            try {
                return JSON.parse(storedUser);
            } catch {
                return null;
            }
        }
        return null;
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { showStatus } = useStatus();
    const navigate = useNavigate();

    const login = async (credentials: AuthFormData) => {
        setIsLoading(true);
        try{
            const res = await API.post("user/login", {
                email: credentials.email,
                password: credentials.password
            });

            const token = res.data.user.token;
            const userProfile = buildUserProfile(res.data.user);

            localStorage.setItem("token", token);
            localStorage.setItem("userProfile", JSON.stringify(userProfile));

            setUser(userProfile);
            socket.connect();
            socket.emit("setup", userProfile.id);
            showStatus("Access authorized. Syncing system profile", "success");
        } catch(error: any){
            const errorMsg = error.response?.data?.message || "Authentication rejected: Invalid credentials.";
            showStatus(errorMsg, "error");
            throw error;
        } finally{
            setIsLoading(false);
        }
    };

    const register = async (credentials: AuthFormData) => {
        setIsLoading(true);
        try {
            const res = await API.post("user/register", credentials);

            // Matching login's response shape (res.data.user.*) rather than a
            // different res.data.token / res.data.userProfile shape — confirm
            // this matches your actual register endpoint's real response.
            const token = res.data.user.token;
            const userProfile = buildUserProfile(res.data.user);

            localStorage.setItem("token", token);
            localStorage.setItem("userProfile", JSON.stringify(userProfile));

            setUser(userProfile);
            socket.connect();
            socket.emit("setup", userProfile.id);
            showStatus("Account initialized! Welcome to Blink.", "success");
        } catch(error: any){
            const errorMsg = error.response?.data?.message || "Registration failed. Try again";
            showStatus(errorMsg, "error");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Called after a successful profile update (e.g. SettingsPage's handleProfileSave)
    // so the rest of the app reflects new data immediately, without needing a re-login.
    const updateUser = (updatedFields: Partial<UserProfile>) => {
        setUser(prev => {
            if (!prev) return prev;
            const merged = { ...prev, ...updatedFields };
            localStorage.setItem("userProfile", JSON.stringify(merged));
            return merged;
        });
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userProfile");

        setUser(null);
        socket.disconnect();
        showStatus("Session terminated. See you soon!", "success");
        navigate("/")
    };

    return(
        <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be executed inside an AuthProvider wrapper");
    return context;
}