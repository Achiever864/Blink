import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
    Home, MessageSquare, Bell, User, LogOut, Heart, MessageCircle, Send, Sparkles
} from "lucide-react";

interface Post {
    id: string;
    username: string;
    content: string;
    likes: number;
    comments: number;
    time: string;
}

const FeedPage: React.FC = () => {
    const { user, logout } = useAuth();
    const [newPost, setNewPost] = useState<string>("");

    const [posts] = useState<Post[]>([
            {
                id: "1",
                username: "cyber_architect",
                content: "Just finalized the glassmorphic styling engines for the new system framework. The biolet sub-glow looks absolutely premium.",
                likes: 42,
                comments: 5,
                time: "12m ago",
            },
            {
                id: "2",
                username: "neon_builder",
                content: "TypeScript type-safety handles edge cases beautifully before production runs. Never shipping raw JS ever again.",
                likes: 128,
                comments: 14,
                time: "2h ago",
            }
    ]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center overflow-hidden">
            {/*global backgroung glows.. i really should remove all glows later sha */}
            <div className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-violet-600/5 blur-[150px] pointer-events-none" />

            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-[80px_1fr] lg:grid-cols-[260px_1fr_360px] px-4 gap-6 relative z-10">

                {/*This contains the left SideBar for Navigating through the app */}
                <aside className="hidden md:flex flex-col justify-between py-6 border-r border-slate-900/60 pr-4">
                    <div className="space-y-8">
                        {/*Minimalist Top App Badge */}
                        <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-lg shadow-violet-600/20 lg:mx-0 mx-auto">
                            <span className="text-xl font=black text-white transform -skew-x-3">B</span>
                            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-white" />
                        </div>


                        {/*Stack of the navigation link */}
                        <nav className="space-y-2">
                            <button className="flex items-center gap-4 w-full p-3 rounded-xl bg-violet-600/10 text-violet-400 font-semibold transition-all">
                                <Home size={22}/>
                                <span className="hidden lg:inline text-sm">Timeline</span>
                            </button>

                            <button className="flex items-center gap-4 w-full p-3 rounded-xl text-slate-400 hover:bg-slate-900/50 hover:text-slate-200 transition-all">
                                <MessageSquare size={22} />
                                <span className="hidden lg:inline text-sm">Messages</span>
                            </button>

                            <button className="flex items-center gap-4 w-full p-3 rounded-xl text-slate-400 hover:bg-slate-900/50 hover:text-slate-200 transition-all">
                                <Bell size={22} />
                                <span className="hidden lg:inline text-sm">Notifications</span>
                            </button>

                            <button className="flex items-center gap-4 w-full p-3 rounded-xl text-slate-400 hover:bg-slate-900/50 hover:text-slate-200 transition-all">
                                <User size={22} />
                                <span className="hidden lg:inline text-sm">Profile</span>
                            </button>
                        </nav>
                    </div>


                    {/*User Profile & Logout Segment*/}
                    <div className="space-y-4">
                        <div className="hidden lg:flex items-center gap-3 p-2 rounded-xl bg-slate-900/30 border border-slate-900">
                            <div className="h-9 w-9 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold uppercase text-xs">
                                <div className="h-9 w-9 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold uppercase text-xs">
                                    {user?.username?.substring(0,2) || "US"}
                                </div>
                                <div className="truncate">
                                    <p className="text-xs text-slate-500">Logged in as</p>
                                    <p className="text-sm font-bold text-slate-200 truncate">@{user?.username || "stranger"}</p>
                                </div>
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-4 w-full p-3 rounded-xl text-rose-400 hover:bg-rose-950/20 transition-all group duration-200 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <LogOut size={22} />
                                    <span className="hidden lg:inline text-sm font-medium"></span>


                                </button>
                            </div>
                        </div>

                    </div>

                </aside>

            </div>
        </div>
    )
}

export default FeedPage;