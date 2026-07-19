import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Camera, Plus, Heart, MessageCircle, Paperclip, Send, X
} from "lucide-react";
import GetFriendsDashboard from "../components/getFriendsDashboard";
import Sidebar from "../components/sideBar";
import API from "../api/axios.ts";
import { useAuth } from "../context/AuthContext";
import { useStatus } from "../context/StatusBarContext.tsx";
import PostMedia from "../components/PostMedia.tsx";
import { PostComments } from "../components/Comments.tsx";
//import ContextMenu from "../context/ContextMenu.tsx";
import { MediaCaptureControl } from "../components/MediaCaptureControl.tsx";

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
        profilePicture?: { url: string; publicId: string };
    };
    caption: string;
    media: {
        url: string;
        publicId: string;
        type: "image" | "video";
    }[];
    likes: string[];
    commentsCount: number;
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
    const [openPostId, setOpenPostId] = useState<string | null>(null);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const mainRef = useRef<HTMLElement | null>(null);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    //for camera shaaa..
    const [cameraActive, setCameraActive] = useState(false);

    const handleMediaDispatched = (file: File) => {
        console.log("Ready to hit API endpoint  with filename:", file.name, file.type);
        setAttachments(prev => [...prev, file]);
        setCameraActive(false);
    }

    //mock data for active status for now shaaa
    const activeStatuses: StatusNode[] = [
        { id: "s1", username: "compSci", avatar: "CS", hasUnread: true, isOnline: true },
        { id: "s2", username: "Kernel", avatar: "KP", hasUnread: true, isOnline: false },
        { id: "s3", username: "binaryBabe", avatar: "BB", hasUnread: false, isOnline: true },
        { id: "s4", username: "neonVector", avatar: "NV",  hasUnread: false, isOnline: false}
    ];

    const toggleLike = async (postId: string) => {
        if (!user?.id) return;

        setPosts(prev => prev.map(post => {
            if (post._id !== postId) return post;
            const alreadyLiked = post.likes.includes(user.id);
            return {
                ...post,
                likes: alreadyLiked
                    ? post.likes.filter(id => id !== user.id)
                    : [...post.likes, user.id]
            };
        }));

        try {
            await API.post("/post/like", { postId, userId: user.id });
        } catch (error: any) {
            setPosts(prev => prev.map(post => {
                if (post._id !== postId) return post;
                const alreadyLiked = post.likes.includes(user.id);
                return {
                    ...post,
                    likes: alreadyLiked
                        ? post.likes.filter(id => id !== user.id)
                        : [...post.likes, user.id]
                };
            }));
            showStatus(error.response?.data?.message || "Failed to like post", "error");
        }
    };

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

    const toggleComments = (postId: string) => {
        setOpenPostId(prev => (prev === postId ? null : postId));
    };

    const sendNewPost = async () => {
        try {
            if (!newPost.trim() && attachments.length === 0) {
                showStatus("Post cannot be empty", "error");
                return;
            }

            setIsPosting(true);

            const formData = new FormData();

            formData.append("author", user?.id || "");
            formData.append("text", newPost.trim());
            formData.append("visibility", "public");

            if (attachments.length > 0) {
                attachments.forEach(file => {
                    formData.append("media", file);
                });
            }

            const res = await API.post("/post/create", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
            });

            showStatus("Post created successfully!", "success");
            setNewPost("");
            setAttachments([]);

            // Prepend the newly created post so it shows immediately without a refetch
            if (res.data?.post) {
                setPosts(prev => [res.data.post, ...prev]);
            }
        } catch (error: any) {
            showStatus(error.response?.data?.message || "Failed to create post", "error");
        } finally {
            setIsPosting(false);
        }
    };

    const fetchFeed = async (pageNumber = 1) => {
        try {
            pageNumber === 1
             ? setLoadingFeed(true)
             : setLoadingMore(true);

            const res = await API.post(`/post/getFeed?page=${pageNumber}&limit=10`, {
                userId: user?.id,
            });

            if(pageNumber === 1){
                setPosts(res.data.posts);
            } else {
                setPosts(prev => [...prev, ...res.data.posts]);
            }

            setHasMore(res.data.pagination.hasMore);
            setPage(res.data.pagination.page);
        } catch (error: any) {
            showStatus(error.response?.data?.message || "Failed to load feed", "error");
        } finally {
            setLoadingFeed(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        if (user?.id){
            fetchFeed(1);
        }
    }, []);

    const loadMore = () => {
        if (!loadingMore && hasMore){
            fetchFeed(page + 1);
        }
    }

    //intersection observer for infinite scrolling
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const firstEntry = entries[0];

                if(firstEntry.isIntersecting && hasMore && !loadingMore){
                    loadMore();
                }
            },
            {
                root: mainRef.current,
                rootMargin: "200px",
                threshold: 0.1,
            }
        );

        const currentRef = loadMoreRef.current;
        if (currentRef){
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef){
                observer.unobserve(currentRef);
            }
        };
    }, [hasMore, loadingMore, page]);


    return (
        <div className="relative min-h-screen bg-brand-bg text-brand-text flex justify-center overflow-hidden">
            {/*global backgroung glows.. i really should remove all glows later sha */}
            <div className="absolute top-0 left-1/4 h-[600px] w-[600px] px-2 sm:px-4 rounded-full bg-brand-accent/5 blur-[150px] pointer-events-none" />

            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-[80px_minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)_360px] px-2 sm:px-4 lg:px-6 gap-3 lg:gap-6 relative z-10">

                {/*This contains the left SideBar for Navigating through the app */}
                <Sidebar />

                {/*Middle column: infinite scroll part */}
                <main
                    className="py-4 sm:py-6 md:overflow-y-auto md:max-h-screen no-scrollbar space-y-4 sm:space-y-6 w-full min-w-0"
                    ref={mainRef}
                >
                    <div className="w-full bg-brand-bg/40 p-4 border-b border-brand-border/60 rounded-2xl sm:rounded-3xl">
                        <div className="flex items-center justify-between mb-3 px-1">
                            <h3 className="text-xs font-black tracking-wider text-brand-text-muted font-mono uppercase">Active Status</h3>
                            <span className="text-[10px] bg-brand-surface px-2 py-0.5 rounded-md font-mono text-brand-text-muted">
                                {activeStatuses.length} active
                            </span>
                        </div>

                        <div className="flex items-center gap-4 overflow-x-auto pb-2 pt-1 no-scrollbar w-full scroll-smooth">
                            {/*First element: current operator add link */}
                            <div className="flex flex-col items-center flex-shrink-0 cursor-pointer group">
                                <div className="relative">
                                    <div className="h-12 w-12 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center text-xs text-brand-text-muted font-bold group-hover:border-slate-700 transition-all">
                                        ME
                                    </div>

                                    {/*Pinned Add Plus Icon Badge */}
                                    <div className="absolute bottom-0 right-0 p-0.5 rounded-full bg-brand-accent text-white border-2 border-slate-950 group-hover:scale-110 transition-transform">
                                        <Plus size={10} strokeWidth={3} />
                                    </div>
                                </div>
                                <span className="text-[10px] font-mono mt-1.5 text-brand-text-muted group-hover:text-brand-text transition-colors">My Status</span>
                            </div>

                            {/*Mapped Friends Channels */}
                            {activeStatuses.map((status) => (
                                <div key={status.id} className="flex flex-col items-center flex-shrink-0 cursor-pointer group">
                                    <div className="relative">
                                        <div className={`p-[2px] rounded-full transition-all group-hover:scale-105 ${
                                            status.hasUnread
                                                ? "bg-gradient-to-tr from-violet-600 via-indigo-500 to-teal-400 animation-pulse"
                                                : "border border-brand-border/80 bg-transparent"
                                        }`}>
                                            {/*Inner Avatar Frame */}
                                            <div className="h-11 w-11 rounded-full bg-brand-bg border border-brand-border/40 flex items-center justify-center text-xs text-brand-text font-black uppercase group-hover:text-white transition-colors">
                                                {status.avatar}
                                            </div>
                                        </div>

                                        {/*Core Online Indicator Dot */}
                                        {status.isOnline && (
                                            <div className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-teal-400 border-2 border-slate-950 ring-1 ring-teal-400/20" title="Online" />
                                        )}
                                    </div>

                                    {/*Friend Name Display Text */}
                                    <span className="text-[10px] font-mono mt-1.5 text-brand-text-muted max-w-[64px] truncate text-center group-hover:text-brand-text transition-colors">
                                        {status.username}
                                    </span>
                                </div>
                            ))}

                        </div>
                    </div>


                    {/*Feed composer box */}
                    <div className="rounded-3xl border border-brand-border bg-brand-bg p-3 sm:p-4 shadow-xl focus-within:border-violet-500/40 transition-all">
                        <textarea 
                            className="w-full bg-transparent resize-none text-sm text-brand-text placeholder-slate-600 outline-none min-h-[80px]"
                            placeholder="What's on your mind..."
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                        />

                        {/*Image Previewssss */}
                        <div>
                            {previews.length > 0 && (
                                <div className="mt-4 animate-slide-in">
                                    <div className="relative overflow-hidden rounded-3xl border border-brand-border bg-brand-surface/40 p-3 shadow-xl">

                                    <button
                                        type="button"
                                        onClick={() => setAttachments([])}
                                        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:scale-110 hover:bg-red-500"
                                    >
                                        <X size={16} />
                                    </button>

                                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {previews.map((preview, index) => (
                                            <div
                                                key={preview.url}
                                                className="relative overflow-hidden rounded-2xl"
                                            >
                                                <img
                                                    src={preview.url}
                                                    alt="preview"
                                                    className="h-44 w-full object-cover"
                                                />

                                                <button
                                                    type="button"
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
                                            type="button"
                                            onClick={() => setAttachments([])}
                                            className="rounded-full bg-red-500/20 p-2 text-red-400 hover:bg-red-500 hover:text-white transition"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                    </div>
                                </div>
                            )
                            }
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-brand-border">
                            <div className="flex">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center justify-center p-2.5 rounded-xl text-brand-text-muted hover:text-brand-accent hover:bg-brand-surface-hover/60 border border-transparent hover:border-brand-border/80 transition-all active:scale-95 group outline-none"
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

                            <div>
                                <button
                                    type="button"
                                    onClick={() => setCameraActive(true)}
                                    className="flex items-center justify-center p-2.5 rounded-xl text-brand-text-muted hover:text-brand-accent hover:bg-brand-surface-hover/60 border border-transparent hover:border-brand-border/80 transition-all active:scale-95 group outline-none"
                                >
                                    <Camera size={14} />
                                </button>

                                {cameraActive && (
                                    <MediaCaptureControl
                                        onCaptureComplete={handleMediaDispatched}
                                        onClose={() => setCameraActive(false)}
                                    />
                                )}
                            </div>
                            </div>


                            {/* <span className="text-xs text-brand-text-muted font-mono tracking-wide">
                            
                            </span> */}

                            <button
                                type="button"
                                onClick={sendNewPost}
                                disabled={isPosting || (!newPost.trim() && attachments.length === 0)}
                                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-brand-accent to-brand-accent-hover rounded-xl font-bold text-white shadow-lg shadow-violet-600/10 transition-all hover:scale-[1.03] active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                        {loadingFeed && posts.length === 0 && (
                            <div className="text-xs text-brand-text-muted font-mono text-center py-10">Loading feed...</div>
                        )}
                        {posts.map((post, index) => {
                            const isLiked = user?.id ? post.likes.includes(user.id) : false;
                            return (
                                <React.Fragment key={post._id || index}>

                                {/*standard post card */}
                                <div className="rounded-3xl border border-brand-border bg-brand-surface/20 backdrop-blur-md p-4 sm:p-5 space-y-4 hover:border-brand-border/80 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold uppercase text-xs overflow-hidden">
                                                {post.author?.profilePicture?.url ? (
                                                    <img
                                                        src={post.author.profilePicture.url}
                                                        alt={post.author.username}
                                                        className="w-full h-full object-cover rounded-lg"
                                                    />
                                                ) : (
                                                    <span>{post.author?.username?.substring(0, 2) || "??"}</span>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-brand-text">{post.author?.username || "Unknown"}</h4>
                                                <p className="text-[11px] text-brand-text-muted">{new Date(post.createdAt).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-sm leading-relaxed text-brand-text whitespace-pre-wrap break-words">{post.caption}</p>

                                    {/*Media...Ok great i get it now */}
                                    <PostMedia media={post.media} />


                                    <div className="flex items-center gap-6 pt-2 border-t border-brand-border/40 text-xs text-brand-text-muted">
                                        <button
                                            onClick={() => toggleLike(post._id)}
                                            className={`flex items-center gap-2 transition-colors ${
                                                isLiked ? "text-rose-400" : "text-brand-text-muted hover:text-rose-400"
                                            }`}
                                        >
                                            <Heart
                                                size={16}
                                                className={isLiked ? "fill-rose-400 stroke-rose-400" : "fill-none"}
                                            />
                                            <span>{post.likes?.length ?? 0}</span>
                                        </button>
                                        <button
                                            className="flex items-center gap-2 hover:text-brand-accent transition-colors"
                                            onClick={() => toggleComments(post._id)}
                                        >
                                            <MessageCircle size={16} />
                                            <span>{post.commentsCount ?? 0}</span>
                                        </button>
                                    </div>
                                </div>

                                {openPostId === post._id && (
                                    <PostComments
                                        postId={post._id}
                                        onCommentAdded={() => {
                                            // bump the count locally so it updates without a refetch
                                            setPosts(prev => prev.map(p =>
                                                p._id === post._id
                                                    ? { ...p, commentsCount: (p.commentsCount ?? 0) + 1 }
                                                    : p
                                            ));
                                        }}
                                    />
                                )}

                                    {/*Trying to strategically inject our Friends suggestion */}
                                    {index === 1 && (
                                        <div>
                                            <GetFriendsDashboard isEmbedded={true} />
                                        </div>
                                    )}

                                </React.Fragment>
                            );
                        })}
                    </div>

                    {/*Sentinel element... */}
                    <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
                        {loadingMore && (
                            <div className="text-xs text-brand-text-muted font-mono">
                                Loading more posts...
                            </div>
                        )}

                        {!hasMore && posts.length > 0 && (
                            <div className="text-xs text-brand-text-muted font-mono">
                                You've reached the end of the feed.
                            </div>
                        )}
                    </div>
                </main>

                
                {/*Right column: Discover Bar (Large Desktop only)*/}
                <aside className="hidden lg:block py-6 border-l border-brand-border/60 pl-6 space-y-6">
                        <div className="rounded-3xl border border-brand-border bg-brand-surface/10 p-5 space-y-4">
                            <h3 className="text-sm font-bold text-brand-text tracking-wide">System Activity</h3>
                            <div className="space-y-3">
                                <div className="text-xs p-3 sm:p-4 rounded-xl bg-brand-bg/60 border border-brand-border">
                                    <p className="text-brand-text-muted font-medium">Status: </p>
                                    <p className="text-emerald-400 font-bold mt-1 flex items-center gap-1.5">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" /> Online
                                    </p>
                                </div>

                                {/* <ContextMenu items={[
                                    { label: "Edit", icon: Pencil, onClick: () => console.log("edit") },
                                    { label: "Delete", icon: Trash2, onClick: () => console.log("delete"), danger: true }
                                ]}>
                                    <div className="p-4 bg-brand-surface rounded-xl">Right-click me</div>
                                </ContextMenu> */}
                            </div>
                        </div>
                </aside>

            </div>
        </div>
    );
};

export default FeedPage;