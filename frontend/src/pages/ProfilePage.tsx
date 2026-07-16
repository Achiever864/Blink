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
            // ASSUMPTION: adjust this route/payload to match your real "get a user's own posts" endpoint
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
        <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center overflow-hidden">
            {/*Ambient Background Glows */}
            <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 h-[600px] w-[600px] rounded-full bg-violet-600/5 blur-[150px] pointer-events-none" />

            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-[80px_1fr] lg:grid-cols-[240px_1fr_360px] px-4 gap-6 relative z-10">
                <Sidebar />

                {/*Middle column: profile display */}
                <main className="py-6 overflow-y-auto max-h-screen no-scrollbar space-y-6">
                    {/*Hero Header Banner Card */}
                    <div className="relative rounded-3xl border border-slate-900 bg-slate-900/10 backdrop-blur-md overflow-hidden p-6 pb-4">
                        <div className="absolute top-0 left-0 w-full h-24 to-transparent" />

                        <div className="relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mt-8">
                            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">

                                {/*Avatar — read-only here, editing lives in Settings now */}
                                <div className="relative h-20 w-20 rounded-2xl border border-violet-400/30 flex items-center justify-center text-white font-black text-2xl uppercase shadow-xl shadow-violet-950/50 overflow-hidden">
                                    {user?.profilePicture ? (
                                        <img src={user.profilePicture} alt="profile" className="w-full h-full object-cover rounded-2xl" />
                                    ) : (
                                        <span>{user?.username?.substring(0, 2) || "??"}</span>
                                    )}
                                </div>

                                <div className="pb-1">
                                    <h2 className="text-xl font-bold text-white tracking-tight">{displayName}</h2>
                                    <p className="text-sm text-violet-400 font-medium">@{user?.username}</p>
                                </div>
                            </div>

                            {/*Editing now lives on the Settings page */}
                            <button
                                onClick={() => navigate("/settings")}
                                className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-slate-950 border border-slate-900 text-slate-400 hover:text-white hover:border-slate-800 transition-all"
                            >
                                <Settings size={13} />
                                Edit Profile
                            </button>
                        </div>

                        {/*Bio / details / links */}
                        <div className="mt-6 pt-4 border-t border-slate-900/60 space-y-3">
                            {user?.bio && (
                                <p className="text-sm text-slate-300 leading-relaxed max-w-xl">{user.bio}</p>
                            )}

                            {/*Personal details row */}
                            {(user?.occupation || user?.city || user?.nationality || user?.dateOfBirth) && (
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
                                    {user?.occupation && (
                                        <span className="flex items-center gap-1.5">
                                            <Briefcase size={13} className="text-slate-600" />
                                            {user.occupation}
                                        </span>
                                    )}
                                    {(user?.city || user?.nationality) && (
                                        <span className="flex items-center gap-1.5">
                                            <MapPin size={13} className="text-slate-600" />
                                            {[user?.city, user?.nationality].filter(Boolean).join(", ")}
                                        </span>
                                    )}
                                    {user?.dateOfBirth && (
                                        <span className="flex items-center gap-1.5">
                                            <Cake size={13} className="text-slate-600" />
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
                                            className="px-2.5 py-1 rounded-lg bg-violet-600/10 border border-violet-500/20 text-violet-400 text-[11px] font-semibold"
                                        >
                                            {interest}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                                {user?.website && (
                                    <a href={`https://${user.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-violet-400 transition-colors">
                                        <Link2 size={13} />
                                        <span>{user.website}</span>
                                    </a>
                                )}

                                <span className="flex items-center gap-1">
                                    <Shield size={13} className="text-violet-500/80" />
                                    <span>Verified Operator</span>
                                </span>
                            </div>

                            {/*Stats row */}
                            <div className="flex items-center gap-6 pt-2 text-xs">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-200">{posts.length}</span>
                                    <span className="text-slate-500">posts</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-200">{friends.length}</span>
                                    <span className="text-slate-500">friends</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/*Tab switcher */}
                    <div className="flex bg-slate-950 border border-slate-900 rounded-xl p-1 w-full max-w-xs">
                        <button
                            onClick={() => setActiveTab("posts")}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                                activeTab === "posts" ? "bg-slate-900 text-white shadow" : "text-slate-500 hover:text-slate-300"
                            }`}
                        >
                            <Grid3x3 size={13} />
                            Posts
                        </button>
                        <button
                            onClick={() => setActiveTab("friends")}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                                activeTab === "friends" ? "bg-slate-900 text-white shadow" : "text-slate-500 hover:text-slate-300"
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
                                <div className="text-xs text-slate-600 font-mono text-center py-10">Loading posts...</div>
                            ) : posts.length === 0 ? (
                                <div className="rounded-3xl border border-slate-900/60 bg-slate-900/5 p-8 text-center space-y-2">
                                    <p className="text-sm text-slate-400 font-medium">No posts yet.</p>
                                    <p className="text-xs text-slate-600">Anything you share will show up here.</p>
                                </div>
                            ) : (
                                posts.map((post) => (
                                    <div key={post._id} className="rounded-3xl border border-slate-900 bg-slate-900/20 backdrop-blur-md p-5 space-y-3 hover:border-slate-800/80 transition-all">
                                        <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-wrap break-words">{post.caption}</p>
                                        <PostMedia media={post.media} />
                                        <div className="flex items-center gap-6 pt-2 border-t border-slate-900/40 text-xs text-slate-500">
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
                                <div className="text-xs text-slate-600 font-mono text-center py-10">Loading friends...</div>
                            ) : friends.length === 0 ? (
                                <div className="rounded-3xl border border-slate-900/60 bg-slate-900/5 p-8 text-center space-y-2">
                                    <p className="text-sm text-slate-400 font-medium">No friends yet.</p>
                                    <p className="text-xs text-slate-600">People you connect with will show up here.</p>
                                </div>
                            ) : (
                                friends.map((friend) => (
                                    <div key={friend._id} className="rounded-2xl border border-slate-900 bg-slate-900/20 p-3 flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-sm font-bold text-slate-300 overflow-hidden">
                                            {getFriendAvatar(friend.profilePicture) ? (
                                                <img src={getFriendAvatar(friend.profilePicture)} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{friend.username?.substring(0, 2)}</span>
                                            )}
                                        </div>
                                        <span className="text-sm font-semibold text-slate-200">@{friend.username}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </main>

                {/*Right Column: static status monitoring sidebar */}
                <aside className="hidden lg:block py-6 border-l border-slate-900/60 pl-6 space-y-6">
                    <div className="rounded-3xl border border-slate-900 bg-slate-900/10 p-5 space-y-4">
                        <h3 className="text-sm font-bold text-slate-200 tracking-wide">Data Node Metrics</h3>

                        <div className="space-y-3">
                            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-900 flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-medium">Node Security Level</span>
                                <span className="text-violet-400 font-bold uppercase tracking-wider">Level 3</span>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-900 flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-medium">Memory footprint</span>
                                <span className="text-slate-300 font-semibold font-mono">0.14MB</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    )
};

export default ProfilePage;