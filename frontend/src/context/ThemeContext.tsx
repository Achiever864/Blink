import React, { createContext, useContext, useState, useEffect } from "react";

export type ThemeMode = "light"  | "dark" | "cyberpunk";

interface ThemeContextType {
    theme: ThemeMode;
    setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined> (undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<ThemeMode>(() => {
        const savedTheme = localStorage.getItem('blink_theme') as ThemeMode;
        return savedTheme || "dark";
    });

    useEffect(() => {
        const root = window.document.documentElement;

        root.classList.remove("light", "dark", "cyberpunk");

        root.classList.add(theme);

        localStorage.setItem("blink_theme", theme);
    }, [theme]);

    const setTheme = (newTheme: ThemeMode) => {
        setThemeState(newTheme);
    };

    return (
        <ThemeContext.Provider value={{theme, setTheme}}>
            {children}
        </ThemeContext.Provider>
    );
};

//const token customer hook with safety validation boundaries
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be wrapped inside a valid ThemeProvider.");
    }

    return context;
}