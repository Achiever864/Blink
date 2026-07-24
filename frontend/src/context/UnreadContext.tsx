import React, { createContext, useContext, useState} from "react";

interface UnreadContextType {
    totalUnread: number;
    setTotalUnread: (count: number) => void;
}

const unreadContext = createContext<UnreadContextType | undefined>(undefined);

export const UnreadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [totalUnread, setTotalUnread] = useState(0);

    return(
        <unreadContext.Provider value={{ totalUnread, setTotalUnread }}>
            {children}
        </unreadContext.Provider>
    );
};

export const useUnread = () => {
    const context = useContext(unreadContext);
    if (!context) throw new Error ("useunread must be used inside an UnreadProvider");
    return context;
};