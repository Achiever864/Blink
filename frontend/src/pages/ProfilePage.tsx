import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
    Settings, Shield, Link2, Heart, MessageCircle, Users, Grid3x3,
    Briefcase, MapPin, Cake
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sideBar";
import PostMedia from "../components/PostMedia";
import API from "../api/axios";
import { useStatus } from "../context/StatusBarContext";

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

interface FriendshipRecord {
    _id: string;
    status: string;
    requester: {
        _id: string;
        username: string;
        fullName: string;
        profilePicture?: { url: string; publicId: string } | "";
    };
    recipient: {
        _id: string;
        username: string;
        fullName: string;
        profilePicture?: { url: string; publicId: string } | "";
    };
}

interface Friend {
    _id: string;
    username: string;
    profilePicture?: { url: string; publicId: string } | "";
}

type ProfileTab = "posts" | "friends";

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showStatus } = useStatus();

    const [activeTab, setActiveTab] = useState<ProfileTab>("posts");

    const [posts, setPosts] = useState<Post[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(true);

    const [friends, setFriends] = useState<Friend[]>([]);
    const [loadingFriends, setLoadingFriends] = useState(true);

    const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username || "";

    const getFriendAvatar = (pic?: Friend["profilePicture"]) => {
        if (!pic) return "";
        return typeof pic === "string" ? pic : pic.url;
    };

    const fetchUserPosts = async () => {
        if (!user?.id) return;
        try {
            setLoadingPosts(true);
            const res = await API.post("/post/getUserPosts", { userId: user.id, viewerId: user.id });
            setPosts(res.data.posts || []);
        } catch (error: any) {
            showStatus(error.response?.data?.message || "Failed to load posts", "error");
        } finally {
            setLoadingPosts(false);
        }
    };

    const fetchFriends = async () => {
        if (!user?.id) return;
        try {
            setLoadingFriends(true);
            const res = await API.post("/friend/getFriends", { userId: user.id });

            const records: FriendshipRecord[] = res.data.friends || [];
            const mapped: Friend[] = records.map((record) => {
                const otherPerson =
                    record.requester._id === user.id ? record.recipient : record.requester;

                return {
                    _id: otherPerson._id,
                    username: otherPerson.username,
                    profilePicture: otherPerson.profilePicture,
                };
            });

            setFriends(mapped);
        } catch (error: any) {
            showStatus(error.response?.data?.message || "Failed to load friends", "error");
        } finally {
            setLoadingFriends(false);
        }
    };

    useEffect(() => {
        fetchUserPosts();
        fetchFriends();
    }, [user?.id]);

    return(
        <div className="relative min-h-screen bg-brand-bg text-brand-text flex justify-center overflow-hidden">
            {/*Ambient Background Glows */}
            <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-brand-accent/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 h-[600px] w-[600px] rounded-full bg-brand-accent/5 blur-[150px] pointer-events-none" />

            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-[80px_1fr] lg:grid-cols-[240px_1fr_360px] px-2 sm:px-4 lg:px-6 gap-3 lg:gap-6 relative z-10">
                <Sidebar />

                {/*Middle column: profile display */}
                <main className="py-4 sm:py-6 md:overflow-y-auto md:max-h-screen no-scrollbar space-y-4 sm:space-y-6 w-full min-w-0">
                    {/*Hero Header Banner Card */}
                    <div className="relative rounded-2xl sm:rounded-3xl border border-brand-border bg-brand-surface/10 backdrop-blur-md overflow-hidden p-4 sm:p-6 pb-4">
                        <div className="absolute top-0 left-0 w-full h-24 to-transparent" />

                        <div className="relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mt-8">
                            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">

                                {/*Avatar — read-only here, editing lives in Settings now */}
                                <div className="relative h-20 w-20 rounded-2xl border border-brand-accent/30 flex items-center justify-center text-brand-text font-black text-2xl uppercase shadow-xl shadow-brand-accent/50 overflow-hidden flex-shrink-0">
                                    {user?.profilePicture ? (
                                        <img src={user.profilePicture} alt="profile" className="w-full h-full object-cover rounded-2xl" />
                                    ) : (
                                        <span>{user?.username?.substring(0, 2) || "??"}</span>
                                    )}
                                </div>

                                <div className="pb-1">
                                    <h2 className="text-xl font-bold text-brand-text tracking-tight">{displayName}</h2>
                                    <p className="text-sm text-brand-accent font-medium">@{user?.username}</p>
                                </div>
                            </div>

                            {/*Editing now lives on the Settings page */}
                            <button
                                onClick={() => navigate("/settings")}
                                className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-brand-bg border border-brand-border text-brand-text-muted hover:text-brand-text hover:border-brand-border transition-all flex-shrink-0"
                            >
                                <Settings size={13} />
                                Edit Profile
                            </button>
                        </div>

                        {/*Bio / details / links */}
                        <div className="mt-6 pt-4 border-t border-brand-border/60 space-y-3">
                            {user?.bio && (
                                <p className="text-sm text-brand-text leading-relaxed max-w-xl break-words">{user.bio}</p>
                            )}

                            {/*Personal details row */}
                            {(user?.occupation || user?.city || user?.nationality || user?.dateOfBirth) && (
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-brand-text-muted">
                                    {user?.occupation && (
                                        <span className="flex items-center gap-1.5">
                                            <Briefcase size={13} className="text-brand-text-muted" />
                                            {user.occupation}
                                        </span>
                                    )}
                                    {(user?.city || user?.nationality) && (
                                        <span className="flex items-center gap-1.5">
                                            <MapPin size={13} className="text-brand-text-muted" />
                                            {[user?.city, user?.nationality].filter(Boolean).join(", ")}
                                        </span>
                                    )}
                                    {user?.dateOfBirth && (
                                        <span className="flex items-center gap-1.5">
                                            <Cake size={13} className="text-brand-text-muted" />
                                            {new Date(user.dateOfBirth).toLocaleDateString(undefined, { month: "long", day: "numeric" })}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/*Interests as tag pills */}
                            {user?.interests && user.interests.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {user.interests.map((interest) => (
                                        <span
                                            key={interest}
                                            className="px-2.5 py-1 rounded-lg bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-[11px] font-semibold"
                                        >
                                            {interest}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center gap-4 text-xs text-brand-text-muted pt-1">
                                {user?.website && (
                                    <a href={`https://${user.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-brand-accent transition-colors">
                                        <Link2 size={13} />
                                        <span>{user.website}</span>
                                    </a>
                                )}

                                <span className="flex items-center gap-1">
                                    <Shield size={13} className="text-brand-accent/80" />
                                    <span>Verified Operator</span>
                                </span>
                            </div>

                            {/*Stats row */}
                            <div className="flex items-center gap-6 pt-2 text-xs">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-brand-text">{posts.length}</span>
                                    <span className="text-brand-text-muted">posts</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-brand-text">{friends.length}</span>
                                    <span className="text-brand-text-muted">friends</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/*Tab switcher */}
                    <div className="flex bg-brand-bg border border-brand-border rounded-xl p-1 w-full max-w-xs">
                        <button
                            onClick={() => setActiveTab("posts")}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                                activeTab === "posts" ? "bg-brand-surface text-brand-text shadow" : "text-brand-text-muted hover:text-brand-text"
                            }`}
                        >
                            <Grid3x3 size={13} />
                            Posts
                        </button>
                        <button
                            onClick={() => setActiveTab("friends")}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                                activeTab === "friends" ? "bg-brand-surface text-brand-text shadow" : "text-brand-text-muted hover:text-brand-text"
                            }`}
                        >
                            <Users size={13} />
                            Friends
                        </button>
                    </div>

                    {/*Tab content */}
                    {activeTab === "posts" ? (
                        <div className="space-y-4">
                            {loadingPosts ? (
                                <div className="text-xs text-brand-text-muted font-mono text-center py-10">Loading posts...</div>
                            ) : posts.length === 0 ? (
                                <div className="rounded-3xl border border-brand-border/60 bg-brand-surface/5 p-8 text-center space-y-2">
                                    <p className="text-sm text-brand-text-muted font-medium">No posts yet.</p>
                                    <p className="text-xs text-brand-text-muted">Anything you share will show up here.</p>
                                </div>
                            ) : (
                                posts.map((post) => (
                                    <div key={post._id} className="rounded-3xl border border-brand-border bg-brand-surface/20 backdrop-blur-md p-4 sm:p-5 space-y-3 hover:border-brand-border/80 transition-all">
                                        <p className="text-sm leading-relaxed text-brand-text whitespace-pre-wrap break-words">{post.caption}</p>
                                        <PostMedia media={post.media} />
                                        <div className="flex items-center gap-6 pt-2 border-t border-brand-border/40 text-xs text-brand-text-muted">
                                            <span className="flex items-center gap-2">
                                                <Heart size={14} />
                                                {post.likes?.length ?? 0}
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <MessageCircle size={14} />
                                                {post.commentsCount ?? 0}
                                            </span>
                                            <span className="ml-auto text-[11px]">
                                                {new Date(post.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {loadingFriends ? (
                                <div className="text-xs text-brand-text-muted font-mono text-center py-10">Loading friends...</div>
                            ) : friends.length === 0 ? (
                                <div className="rounded-3xl border border-brand-border/60 bg-brand-surface/5 p-8 text-center space-y-2">
                                    <p className="text-sm text-brand-text-muted font-medium">No friends yet.</p>
                                    <p className="text-xs text-brand-text-muted">People you connect with will show up here.</p>
                                </div>
                            ) : (
                                friends.map((friend) => (
                                    <div key={friend._id} className="rounded-2xl border border-brand-border bg-brand-surface/20 p-3 flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-sm font-bold text-brand-text overflow-hidden">
                                            {getFriendAvatar(friend.profilePicture) ? (
                                                <img src={getFriendAvatar(friend.profilePicture)} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{friend.username?.substring(0, 2)}</span>
                                            )}
                                        </div>
                                        <span className="text-sm font-semibold text-brand-text">@{friend.username}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </main>

                {/*Right Column: static status monitoring sidebar */}
                <aside className="hidden lg:block py-6 border-l border-brand-border/60 pl-6 space-y-6">
                    <div className="rounded-3xl border border-brand-border bg-brand-surface/10 p-5 space-y-4">
                        <h3 className="text-sm font-bold text-brand-text tracking-wide">Data Node Metrics</h3>

                        <div className="space-y-3">
                            <div className="p-3 rounded-xl bg-brand-bg/60 border border-brand-border flex justify-between items-center text-xs">
                                <span className="text-brand-text-muted font-medium">Node Security Level</span>
                                <span className="text-brand-accent font-bold uppercase tracking-wider">Level 3</span>
                            </div>

                            <div className="p-3 rounded-xl bg-brand-bg/60 border border-brand-border flex justify-between items-center text-xs">
                                <span className="text-brand-text-muted font-medium">Memory footprint</span>
                                <span className="text-brand-text font-semibold font-mono">0.14MB</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    )
};

export default ProfilePage;