import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
    Home, MessageSquare, Bell, User, LogOut, Heart, MessageCircle, Send, Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import GetFriendsDashboard from "../components/getFriendsDashboard";


interface Post {
    id: string;
    username: string;
    content: string;
    likes: number;
    comments: number;
    time: string;
    mediaUrl?: string;
    mediaType?: "image" | "video"
}

const FeedPage: React.FC = () => {
    const { user, logout } = useAuth();
    const [newPost, setNewPost] = useState<string>("");
    const navigate = useNavigate();
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
            },
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

                            <button className="flex items-center gap-4 w-full p-3 rounded-xl text-slate-400 hover:bg-slate-900/50 hover:text-slate-200 transition-all"
                                    onClick={() => {navigate("/message")}}
                            >
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
                                {user?.username?.substring(0,2) || "US"}
                            </div>
                                <div className="truncate">
                                    <p className="text-xs text-slate-500">Logged in as</p>
                                    <p className="text-sm font-bold text-slate-200 truncate">@{user?.username || "stranger"}</p>
                                </div>
                            </div>

                                <button
                                    onClick={logout}
                                    className="flex items-center gap-4 w-full p-3 rounded-xl text-rose-400 hover:bg-rose-950/20 transition-all group duration-200 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <LogOut size={22} />
                                    <span className="hidden lg:inline text-sm font-medium">Logout</span>


                                </button>
                        </div>
                </aside>


                {/*Middle column: infinite scroll part */}
                <main className="py-6 overflow-y-auto max-h-screen no-scrollbar space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-black tracking-tight text-white ">
                        Friends Status (Place in this field later sha)
                        </h1>
                    </div>


                    {/*Feed composer box */}
                    <div className="rounded-3xl border border-slate-900 bg-slate-950 p-4 shadow-xl focus-within:border-violet-500/40 transition-all">
                        <textarea 
                            className="w-full bg-transparent resize-none text-sm text-slate-200 placeholder-slate-600 outline-none min-h-[80px]"
                            placeholder="Broadcast something new onto Blink..."
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                        />
                        <div className="flex justify-between items-center pt-3 border-t border-slate-900">
                            <span className="text-xs text-slate-600 font-medium">
                                Markdown strings supported
                            </span>
                            <button
                                disabled={!newPost.trim()}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl text--xs font-bold text-white shadow-lg shadow-violet-600/10 transition-all hover:scale-[1.03] active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                <span>Transmit</span>
                                <Send size={12}/>
                            </button>
                        </div>
                    </div>


                    {/*Stream View (Let's cook) */}
                    <div className="space-y-4">
                        {posts.map((post, index) => (
                            <React.Fragment key={post.id || index}>

                            {/*standard post card */}
                            <div className="rounded-3xl border border-slate-900 bg-slate-900/20 backdrop-blur-md p-5 space-y-4 hover:border-slate-800/80 transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold uppercase text-xs">
                                            {post.username.substring(0,2)}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-200">@{post.username}</h4>
                                            <p className="text-[11px] text-slate-500">{post.time}</p>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-sm leading relaxed text-slate-300 whitespace-pre-wrap">{post.content}</p>

                                {/*Media Attachment Rendering */}
                                {post.mediaUrl && (
                                    <div className="relative rounded-2xl overflow-hidden border border-slate-900/80 bg-slate-950 max-h-[480px] flex items-center justify-center group/media">
                                            {/*If the media type is an image */}
                                            {post.mediaType === "image" && (
                                                <img
                                                src={post.mediaUrl}
                                                alt=""
                                                className="w-full h-full object-cover max-h-[480px] transition-transform duration-500 group-hover/media:scale-[1.01]"
                                                loading="lazy"
                                                />
                                            )}


                                            {/*If the media type is a video */}
                                            {post.mediaType === "video" && (
                                                <video
                                                    src={post.mediaUrl}
                                                    controls
                                                    playsInline
                                                    className="w-full h-full object-cover max-h-[480px]"
                                                    poster ="/video-fallback-poster.jpg"
                                                />
                                            )}
                                    </div>
                                )}


                                <div className="flex items-center gap-6 pt-2 border-t border-slate-900/40 text-xs text-slate-500">
                                    <button className="flex items-center gap-2 hover:text-rose-400 transition-colors">
                                        <Heart size={16} />
                                        <span>{post.likes}</span>
                                    </button>
                                    <button className="flex items-center gap-2 hover:text-violet-400 transition-colors">
                                        <MessageCircle size={16} />
                                        <span>{post.comments}</span>
                                    </button>
                                </div>
                            </div>

                                {/*Trying to strategically inject our Friends suggestion */}
                                {index === 1 && (
                                    <div>
                                        <GetFriendsDashboard isEmbedded={true} />
                                    </div>
                                )}

                                </ React.Fragment >
                        ))}
                    </div>
                </main>

                
                {/*Right column: Discover Bar (Large Desktop only)*/}
                <aside className="hidden lg:block py-6 border-l border-slate-900/60 pl-6 space-y-6">
                        <div className="rounded-3xl border border-slate-900 bg-slate-900/10 p-5 space-y-4">
                            <h3 className="text-sm font-bold text-slate-200 tracking-wide">System Activity</h3>
                            <div className="space-y-3">
                                <div className="text-xs p-3 rounded-xl bg-slate-950/60 border border-slate-900">
                                    <p className="text-slate-400 font-medium">Status: </p>
                                    <p className="text-emerald-400 font-bold mt-1 flex items-center gap-1.5">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" /> Online
                                    </p>
                                </div>
                            </div>
                        </div>
                </aside>

            </div>
        </div>
    );
};

export default FeedPage;