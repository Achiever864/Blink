import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Home, Pencil, MessageSquare, Bell, User, Plus, Heart, MessageCircle, ImageIcon, Paperclip, Send, Handshake, X,
    Trash2
} from "lucide-react";
import GetFriendsDashboard from "../components/getFriendsDashboard";
import Sidebar from "../components/sideBar";
import API from "../api/axios.ts";
import { useAuth } from "../context/AuthContext";
import { useStatus } from "../context/StatusBarContext.tsx";
import PostMedia from "../components/PostMedia.tsx";
import ContextMenu from "../context/ContextMenu.tsx";

interface StatusNode {
    id: string;
    username: string;
    avatar: string;
    hasUnread: boolean;
    isOnline: boolean;
}

interface Post {
    _id: string;
    author: {
        _id: string;
        username: string;
    };
    text: string;
    media: {
        url: string;
        public_id: string;
        type: "image" | "video";
    }[];
    likes: string[];
    comments: string[];
    createdAt: string;
}

const FeedPage: React.FC = () => {
    const { user } = useAuth();
    const {showStatus} = useStatus();
    const [attachments, setAttachments] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [newPost, setNewPost] = useState<string>("");
    const [posts, setPosts] = useState<Post[]>([]);
    const [loadingFeed, setLoadingFeed] = useState(true);
    const [isPosting, setIsPosting] = useState(false);


    //mock data for active status for now shaaa
    const activeStatuses: StatusNode[] = [
        { id: "s1", username: "compSci", avatar: "CS", hasUnread: true, isOnline: true },
        { id: "s2", username: "Kernel", avatar: "KP", hasUnread: true, isOnline: false },
        { id: "s3", username: "binaryBabe", avatar: "BB", hasUnread: false, isOnline: true },
        { id: "s4", username: "neonVector", avatar: "NV",  hasUnread: false, isOnline: false}
    ];

const previews = useMemo(() => {
    return attachments.map(file => ({
        file,
        url: URL.createObjectURL(file)
    }));
}, [attachments]);

useEffect(() => {
    return () => {
        previews.forEach(preview =>
            URL.revokeObjectURL(preview.url)
        );
    };
}, [previews]);

const sendNewPost = async () => {
    try{
        if(!newPost.trim() && attachments.length === 0) {
            showStatus("Post cannot be empty", "error");
            return;
        }

        setIsPosting(true);

        const formData = new FormData();

        formData.append("author", user?.id || "");
        formData.append("text", newPost.trim());
        formData.append("visibility", "public");

        if(attachments.length > 0){
            attachments.forEach(file => {
                formData.append("media", file);
            })
        }

        const res = await API.post("/post/create", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            },
        });

    showStatus("Post created successfully!", "success");
    setNewPost("");
    setAttachments([]);

    console.log(res.data);
    } catch (error: any){
        showStatus(error.response?.data?.message || "Failed to create post", "error")
    } finally {
        setIsPosting(false);
    }
}

const fetchFeed = async () => {
    try {
        setLoadingFeed(true);
        const res = await API.post("/post/getFeed", {
            userId: user?.id,
        })
        setPosts(res.data.posts);
        console.log(res.data);
    } catch (error: any){
        showStatus(error.response?.data?.message || "Failed to load feed", "error");
    } finally {
        setLoadingFeed(false);
    }
}

useEffect(() => {
    fetchFeed();
}, []);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center overflow-hidden">
            {/*global backgroung glows.. i really should remove all glows later sha */}
            <div className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-violet-600/5 blur-[150px] pointer-events-none" />

            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-[80px_1fr] lg:grid-cols-[260px_1fr_360px] px-4 gap-6 relative z-10">

                {/*This contains the left SideBar for Navigating through the app */}
                <Sidebar />

                {/*Middle column: infinite scroll part */}
                <main className="py-6 overflow-y-auto max-h-screen no-scrollbar space-y-6">
                    <div className="w-full bg-slate-950/40 p-4 border-b border-slate-900/60 rounded-3xl">
                        <div className="flex items-center justify-between mb-3 px-1">
                            <h3 className="text-xs font-black tracking-wider text-slate-400 font-mono uppercase">Active Status</h3>
                            <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded-md font-mono text-slate-600">
                                {activeStatuses.length} active
                            </span>
                        </div>

                        <div className="flex items-center gap-4 overflow-x-auto pb-2 pt-1 no-scrollbar w-full scroll-smooth">
                            {/*First element: current operator add link */}
                            <div className="flex flex-col items-center flex-shrink-0 cursor-pointer group">
                                <div className="relative">
                                    <div className="h-12 w-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs text-slate-500 font-bold group-hover:border-slate-700 transition-all">
                                        ME
                                    </div>

                                    {/*Pinned Add Plus Icon Badge */}
                                    <div className="absolute bottom-0 right-0 p-0.5 rounded-full bg-violet-600 text-white border-2 border-slate-950 group-hover:scale-110 transition-transform">
                                        <Plus size={10} strokeWidth={3} />
                                    </div>
                                </div>
                                <span className="text-[10px] font-mono mt-1.5 text-slate-500 group-hover:text-slate-300 transition-colors">My Status</span>
                            </div>

                            {/*Mapped Friends Channels */}
                            {activeStatuses.map((status) => (
                                <div key={status.id} className="flex flex-col items-center flex-shrink-0 cursor-pointer group">
                                    <div className="relative">
                                        <div className={`p-[2px] rounded-full transition-all group-hover:scale-105 ${
                                            status.hasUnread
                                                ? "bg-gradient-to-tr from-violet-600 via-indigo-500 to-teal-400 animation-pulse"
                                                : "border border-slate-800/80 bg-transparent"
                                        }`}>
                                            {/*Inner Avatar Frame */}
                                            <div className="h-11 w-11 rounded-full bg-slate-950 border border-slate-900/40 flex items-center justify-center text-xs text-slate-300 font-black uppercase group-hover:text-white transition-colors">
                                                {status.avatar}
                                            </div>
                                        </div>

                                        {/*Core Online Indicator Dot */}
                                        {status.isOnline && (
                                            <div className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-teal-400 border-2 border-slate-950 ring-1 ring-teal-400/20" title="Online" />
                                        )}
                                    </div>

                                    {/*Friend Name Display Text */}
                                    <span className="text-[10px] font-mono mt-1.5 text-slate-400 max-w-[64px] truncate text-center group-hover:text-slate-200 transition-colors">
                                        {status.username}
                                    </span>
                                </div>
                            ))}

                        </div>
                    </div>


                    {/*Feed composer box */}
                    <div className="rounded-3xl border border-slate-900 bg-slate-950 p-4 shadow-xl focus-within:border-violet-500/40 transition-all">
                        <textarea 
                            className="w-full bg-transparent resize-none text-sm text-slate-200 placeholder-slate-600 outline-none min-h-[80px]"
                            placeholder="What's on your mind..."
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                        />

                        {/*Image Previewssss */}
                        <div>
                            {attachments.length > 0 && (
                                <div className="mt-4 animate-slide-in">
                                    <div className="relative overflow-hidden rounded-3xl border border-brand-border bg-brand-surface p-3 shadow-xl">

                                    <button
                                        type="button"
                                        onClick={() => setAttachments([])}
                                        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:scale-110 hover:bg-red-500"
                                    >
                                        <X size={16} />
                                    </button>

                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        {attachments.map((file, index) => (
                                            <div
                                                key={index}
                                                className="relative overflow-hidden rounded-2xl"
                                            >
                                                {previews.map((preview, index) => (
                                                    <img src={preview.url} alt="preview"
                                                        className="h-44 w-full object-cover"
                                                    />
                                                ))}

                                                {/* <img 
                                                    src={URL.createObjectURL(file)} 
                                                    alt="preview" 
                                                    className="h-44 w-full object-cover"
                                                /> */}

                                                <button
                                                    onClick={() =>
                                                        setAttachments(prev =>
                                                            prev.filter((_, i) => i !== index)
                                                        ) 
                                                    }
                                                    className="absolute right-2 top-2 rounded-full bg-black/60 p-2"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="mt-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-brand-text">
                                                {attachments.length} attachment{attachments.length > 1 && "s"}
                                            </p>

                                            <p className="text-xs text-brand-text-muted">
                                                {(
                                                    attachments.reduce(
                                                        (total, file) => total + file.size,
                                                        0
                                                    ) / (1024 * 1024)).toFixed(2)}{" "} MB
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => setAttachments([])}
                                            className="rounded-full bg-red-500/20 p-2 text-red-400 hover:bg-red-500 hover:text-white transition"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                    {/* <div className="mt-3 flex items-center justify-between">
                                        <div className="overflow-hidden">
                                            <p className="truncate text-sm font-semibold text-brand-text">
                                                {attachment.name}
                                            </p>

                                            <p className="text-xs text-brand-text-muted">
                                                {(attachment.size / (1024 * 1024)).toFixed(2)} MB
                                            </p>
                                        </div>

                                        <ImageIcon className="text-brand-accent" size={14} />
                                    </div> */}
                                    </div>
                                </div>
                            )
                            }
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-slate-900">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center justify-center p-2.5 rounded-xl text-slate-500 hover:text-violet-400 hover:bg-slate-900/60 border border-transparent hover:border-slate-900/80 transition-all active:scale-95 group outline-none"
                                title="Attach files or media payloads"
                            >
                                    <Paperclip size={15}
                                        className="transform group-hover:rotate-12 group-hover:scale-105 transition-transform duration-200"
                                    />
                            </button>

                            <input
                                ref={fileInputRef}
                                multiple
                                type="file"
                                accept="image/*, video/*"
                                hidden
                                onChange={(e) => {
                                    const files = Array.from(e.target.files || []);

                                    setAttachments((prev) => [...prev, ...files]);
                                }}
                            />

                            <span className="text-xs text-slate-600 font-mono tracking-wide">
                                Markdown strings supported
                            </span>
                            
                            {/* <span className="text-xs text-slate-600 font-medium">
                                Markdown strings supported
                            </span> */}
                            <button
                                onClick={sendNewPost}
                                disabled={isPosting || (!newPost.trim() && attachments.length === 0)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl font-bold text-white shadow-lg shadow-violet-600/10 transition-all hover:scale-[1.03] active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {isPosting ? (
                                    <>
                                        <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                        <span>Posting...</span>
                                    </>
                                ):(
                                    <>
                                        <span>Post</span>
                                        <Send size={12}/>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>


                    {/*Stream View (Let's cook) */}
                    <div className="space-y-4">
                        {posts.map((post, index) => (
                            <React.Fragment key={post._id || index}>

                            {/*standard post card */}
                            <div className="rounded-3xl border border-slate-900 bg-slate-900/20 backdrop-blur-md p-5 space-y-4 hover:border-slate-800/80 transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold uppercase text-xs">
                                            <img 
                                                src={post.author.profilePicture.url} 
                                                alt={post.author.username} 
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-200">@{post.author.username}</h4>
                                            <p className="text-[11px] text-slate-500">{new Date(post.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-sm leading relaxed text-slate-300 whitespace-pre-wrap">{post.caption}</p>

                                {/*Media Attachment Rendering */}
                                {/* {post.media.length > 0 && (
                                    <div className="grid gap-2">
                                        {post.media.map((item, index) => (
                                            item.type === "image" ? (
                                                <img
                                                    src={item.url}
                                                    key={index}
                                                    alt="image"
                                                    className="rounded-2xl"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <video
                                                    src={item.url}
                                                    key={index}
                                                    controls
                                                    playsInline
                                                    className="rounded-2xl"
                                                    poster="/video-fallbck-poster.jpg"
                                                />
                                            )
                                        ))}
                                    </div>
                                )} */}

                                {/*Media...Ok great i get it now */}
                                <PostMedia media={post.media} />


                                <div className="flex items-center gap-6 pt-2 border-t border-slate-900/40 text-xs text-slate-500">
                                    <button className="flex items-center gap-2 hover:text-rose-400 transition-colors">
                                        <Heart size={16} />
                                        <span>{post.likes.length}</span>
                                    </button>
                                    <button className="flex items-center gap-2 hover:text-violet-400 transition-colors">
                                        <MessageCircle size={16} />
                                        <span>{post.commentsCount}</span>
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

                                <ContextMenu items={[
                                    { label: "Edit", icon: Pencil, onClick: () => console.log("edit") },
                                    { label: "Delete", icon: Trash2, onClick: () => console.log("delete"), danger: true }
                                ]}>
                                    <div className="p-4 bg-slate-900 rounded-xl">Right-click me</div>
                                </ContextMenu>
                            </div>
                        </div>
                </aside>

            </div>
        </div>
    );
};

export default FeedPage;