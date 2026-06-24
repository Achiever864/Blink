import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle2, AlertOctagon } from "lucide-react";
//import { StatusNotification, StatusBarContextType, StatusType } from "../types/status";

const StatusBarContext = createContext<StatusBarContextType | undefined>(undefined);

export const StatusBarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<StatusNotification[]>([]);

    const showStatus = useCallback((message: string, type: StatusType) => {
        const id = Date.now();
        setNotifications((prev) => [...prev, { message, type, id }]);

        //Auto-dismiss after 4 seconds
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 4000);
    }, []);

    const removeStatus = (id: number) => {
        setNotifications((prev) =>  prev.filter((n) => n.id !== id));
    };

    return(
        <StatusBarContext.Provider value={{ showStatus }}>
            {children}

        {/*floating box */}
        <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
            {notifications.map((notif) => {
                const isSuccess = notif.type === "success";

                return(
                    <div key={notif.id} className={`pointer-events-auto relative flex items-center justify-between gap-3 overflow-hidden rounded-2xl border p-4 backdrop-blur-xl transition-all duration-300 animate-slide-in shadow-2xl ${
                        isSuccess ? "border-emerald-500/20 bg-emerald-950/40 text-emerald-400 shadow-emerald-950/30": "border-rose-500/20 bg-rose-950/40 text-rose-400 shadow-rose-950/30"
                    }`}>
                        <div className={`absolute left-0 top-0 h-full w-1 ${isSuccess ? "bg-emarald-500" : "bg-rose-500"}`} />

                        <div className="flex items-center gap-3">
                            {isSuccess ?(
                                <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                            ) : (
                                <AlertOctagon size={20} className="text-rose-400 shrink-0" />
                            )}

                            <p className="text-sm font-medium tracking-wide text-slate-200">
                                {notif.message}
                            </p>
                        </div>

                        {/*This if for users to exit the commands */}
                        <button
                        onClick={() => removeStatus(notif.id)}
                        className="rounded-lg p-1 text-slate-400 hover:bg-white/5 hover:text-white transition">
                            <X size={16} />
                        </button>

                        {/*Progress Bar */}
                        <div className={`absolute bottom-0 left-0 h-[2px] w-full origin-left animate-toast-progress ${
                            isSuccess ? "bg-emerald-500/50" : "bg-rose-500/50"
                        }`} />

                    </div>
                );
        })}

        </div>
        </StatusBarContext.Provider>
    );
};

//Hooks for seamless access
export const useStatus = (): StatusBarContextType => {
    const context = useContext(StatusBarContext);
    if(!context){
        throw new Error("useStatus must be executed inside a StatusBarProvider wrapper");
    }
    return context;
};