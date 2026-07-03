import React from "react";
import {
    Home, MessageSquare, Bell, User, Users, LogOut 
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const username = localStorage.getItem("username") || "stranger";

    const navItems = [
        {
            label: "Timeline",
            icon: Home,
            path: '/feed'
        },
        {
            label: "Messages",
            icon: MessageSquare,
            path: "/message"
        },
        {
            label: "Friends",
            icon: Users,
            path: "/friends"
        },
        {
            label: "Notifications",
            icon: Bell,
            path: "/notifications"
        },
        {
            label: "Profile",
            icon: User,
            path: "/profile"
        }
    ];

    return(
        <aside className="hidden md:flex flex-col justify-between py-6 border-r border-slate-900/60 pr-4">
            {/*Top Section */}
            <div className="space-y-8">
                {/*Logo */}
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-lg shadow-violet-600/20 lg:mx-0 mx-auto">
                    <span className="text-xl font-black text-white -skew-x-3">
                        B
                    </span>

                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-white" />
                </div>

                {/*Through the navigation */}
                <nav className="space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = location.pathname === item.path;

                        return(
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`flex items-center gap-4 w-full p-3 rounded-xl transition-all ${
                                    active
                                        ? "bg-violet-600/10 text-violet-400 font-semibold"
                                        : "text-slate-400 hover:bg-slate-900/50 hover:text-slate-200"
                                }`}>
                                    <Icon size={22} />

                                    <span className="hidden lg:inline text-sm">
                                        {item.label}
                                    </span>

                                </button>
                        );
                    })}
                </nav>
            </div>

            {/*This is the bottom section that has logout and stuffs */}
            <div className="space-y-4">
                    <div className="hidden lg:flex items-center gap-3 p-2 rounded-xl bg-slate-900/30 border border-slate-900">
                        <div className="h-9 w-9 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold uppercase text-xs">
                            {user?.profilePicture ? (
                                <img src={user?.profilePicture} alt={user?.username} className="w-full h-full object-cover hidden-overflow" />
                             ) : (user?.username.substring(0,2) || "US")
                            }
                        </div>

                        <div className="truncate">
                            <p className="text-xs text-slate-500">
                                Logged in as
                            </p>

                            <p className="text-sm font-bold text-slate-200 truncate">
                                @{username}
                            </p>
                        </div>
                    </div>

            <button
                onClick={logout}
                className="flex items-center gap-4 w-full p-3 rounded-xl text-rose-400 hover:bg-rose-950/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
                <LogOut size={22} />
                <span className="hidden lg:inline text-sm font-medium">
                    Logout
                </span>
            </button>

        </div>
        </aside>
    );
};

export default Sidebar;