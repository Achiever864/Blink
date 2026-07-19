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

    const navItems = [
        { label: "Timeline", icon: Home, path: '/feed' },
        { label: "Messages", icon: MessageSquare, path: "/message" },
        { label: "Friends", icon: Users, path: "/friends" },
        { label: "Notifications", icon: Bell, path: "/notifications" },
        { label: "Profile", icon: User, path: "/profile" }
    ];

    return (
        <>
            {/* Spacer — reserves real layout space so page content never renders
                underneath the fixed nav. Top bar on mobile, side rail on desktop. */}
            <div className="md:hidden h-16 flex-shrink-0 w-full" />
            <div className="hidden md:block w-20 lg:w-64 flex-shrink-0 h-screen" />

            {/* MOBILE: fixed horizontal top bar */}
            <nav className="md:hidden fixed top-0 inset-x-0 w-screen h-16 bg-brand-bg border-b border-brand-border z-40 flex items-center justify-between px-3 gap-2 box-border">
                <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-accent to-brand-accent-hover shadow-lg shadow-violet-600/20">
                    <span className="text-base font-black text-white -skew-x-3">B</span>
                    <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-white" />
                </div>

                <div className="flex items-center justify-around flex-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = location.pathname === item.path;

                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`flex flex-col items-center justify-center gap-0.5 p-1.5 rounded-lg transition-all ${
                                    active ? "text-brand-accent" : "text-brand-text-muted"
                                }`}
                            >
                                <Icon size={20} />
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={logout}
                    className="flex-shrink-0 p-2 rounded-lg text-rose-400 hover:bg-rose-950/20 transition-all"
                >
                    <LogOut size={18} />
                </button>
            </nav>

            {/* DESKTOP: fixed vertical side rail */}
            <aside className="hidden md:flex fixed left-0 top-0 h-screen flex-col justify-between bg-brand-bg border-r border-brand-border z-40 w-20 lg:w-64 px-3 py-6">
                <div className="space-y-8">
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-accent to-brand-accent-hover shadow-lg shadow-violet-600/20 lg:mx-0 mx-auto">
                        <span className="text-xl font-black text-white -skew-x-3">B</span>
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-white" />
                    </div>

                    <nav className="space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = location.pathname === item.path;

                            return (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className={`flex items-center gap-4 w-full p-3 rounded-xl transition-all ${
                                        active
                                            ? "bg-brand-accent/10 text-brand-accent font-semibold"
                                            : "text-brand-text-muted hover:bg-brand-surface-hover hover:text-brand-text"
                                    }`}
                                >
                                    <Icon size={22} />
                                    <span className="hidden lg:inline text-sm">{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="space-y-4">
                    <div className="hidden lg:flex items-center gap-3 p-2 rounded-xl bg-brand-surface/30 border border-brand-border">
                        <div className="h-9 w-9 rounded-lg bg-brand-accent/20 border border-violet-500/30 flex items-center justify-center text-brand-accent font-bold uppercase text-xs">
                            {user?.profilePicture ? (
                                <img src={user.profilePicture} alt="US" className="w-full h-full object-cover overflow-hidden rounded-lg" />
                            ) : (
                                user?.username?.substring(0, 2) || "US"
                            )}
                        </div>

                        <div className="truncate">
                            <p className="text-xs text-brand-text-muted">Logged in as</p>
                            <p className="text-sm font-bold text-brand-text truncate">{user?.username}</p>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="flex items-center gap-4 w-full p-3 text-rose-400 hover:bg-rose-950/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <LogOut size={22} />
                        <span className="hidden lg:inline text-sm font-medium">Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;