import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { X, MapPin, Briefcase, Globe2, Calendar, Award, MessageCircle, UserPlus, Users } from "lucide-react";
import { useStatus } from "../context/StatusBarContext";
import { useAuth } from "../context/AuthContext";
import PostMedia from "./PostMedia";

interface UserProfileModalProps {
    userId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

interface MutualFriend {
    _id: string;
    username: string;
    profilePicture?: { url: string; publicId: string } | "";
}

interface UserProfile {
    userId: string;
    username: string;
    fullName: string;
    bio: string;
    occupation: string;
    city: string;
    nationality: string;
    profilePicture: { url: string; publicId: string };
    friendsCount: number;
    postsCount: number;
    mutualFriends: MutualFriend[];
    badges: string[];
    isFriend: boolean;
    friendRequestSent: boolean;
    hasBlocked: boolean;
    blockedMe: boolean;
    joinedAt: string;
    lastSeen: string;
    online: boolean;
}

interface Post {
    _id: string;
    author: { _id: string; username: string; profilePicture?: { url: string; publicId: string } };
    caption: string;
    media: { url: string; publicId: string; type: "image" | "video" | "audio" | "file" }[];
    likes: string[];
    commentsCount: number;
    createdAt: string;
}

type ProfileTab = "posts" | "friends" | "about";

const ProfileView: React.FC<UserProfileModalProps> = ({
    userId,
    isOpen,
    onClose
}) =>  {
    const { user: currentUser } = useAuth();
    const { showStatus } = useStatus();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<ProfileTab>("posts");

    const [posts, setPosts] = useState<Post[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(false);

    const [sendingRequest, setSendingRequest] = useState(false);
    const [startingChat, setStartingChat] = useState(false);

    useEffect(() => {
        if (!isOpen || !userId) return;
        setActiveTab("posts");

        const fetchUser = async () => {
            try {
                setProfile(null);
                setLoading(true);

                const res = await API.get(`/user/getProfile/${userId}`, {
                    params: { viewerId: currentUser?.id }
                });

                setProfile(res.data);
            } catch (error) {
                showStatus("Unable to fetch user profile", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [isOpen, userId, currentUser?.id]);

    useEffect(() => {
        if (!isOpen || !userId || activeTab !== "posts") return;

        const fetchPosts = async () => {
            try {
                setLoadingPosts(true);
                const res = await API.post("/post/getUserPosts", {
                    userId,
                    viewerId: currentUser?.id
                });
                setPosts(res.data.posts || []);
            } catch (error) {
                showStatus("Unable to load posts", "error");
            } finally {
                setLoadingPosts(false);
            }
        };

        fetchPosts();
    }, [isOpen, userId, activeTab, currentUser?.id]);

    const handleSendFriendRequest = async () => {
        if (!currentUser?.id || !userId) return;
        try {
            setSendingRequest(true);
            await API.post("/friend/sendRequest", {
                requesterId: currentUser.id,
                recipientId: userId
            });
            showStatus("Friend request sent!", "success");
            setProfile(prev => prev ? { ...prev, friendRequestSent: true } : prev);
        } catch (error: any) {
            showStatus(error.response?.data?.message || "Failed to send request", "error");
        } finally {
            setSendingRequest(false);
        }
    };

    const handleMessage = async () => {
        if (!currentUser?.id || !userId) return;
        try {
            setStartingChat(true);
            await API.post("/conversation/create", {
                isGroupChat: false,
                participants: [userId, currentUser.id]
            });
            onClose();
            navigate("/message");
        } catch (error: any) {
            showStatus(error.response?.data?.message || "Failed to start chat", "error");
        } finally {
            setStartingChat(false);
        }
    };

    if (!isOpen) return null;

    if (loading || !profile) {
        return createPortal(
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="flex flex-col items-center gap-3 text-brand-text-muted">
                    <div className="h-10 w-10 rounded-full border-2 border-brand-border border-t-brand-accent animate-spin" />
                    <span className="text-sm font-medium">Loading profile...</span>
                </div>
            </div>,
            document.body
        );
    }

    const isOwnProfile = profile.userId === currentUser?.id;

    return createPortal(
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
            <div className="w-full max-w-3xl max-h-[92vh] bg-brand-bg border border-brand-border rounded-3xl overflow-hidden shadow-2xl flex flex-col">

                {/* Header — replaces the old empty cover-photo band */}
                <div className="relative pt-8 pb-6 px-6 sm:px-8 bg-gradient-to-b from-brand-accent/10 to-transparent border-b border-brand-border/60">
                    <button
                        className="absolute top-4 right-4 h-9 w-9 rounded-full bg-brand-surface/80 hover:bg-brand-surface-hover flex items-center justify-center text-brand-text-muted hover:text-brand-text transition-all"
                        onClick={onClose}
                    >
                        <X size={18} />
                    </button>

                    <div className="flex items-start gap-4">
                        <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-3xl border-2 border-brand-bg overflow-hidden bg-brand-surface shadow-xl flex-shrink-0">
                            {profile.profilePicture?.url ? (
                                <img src={profile.profilePicture.url} alt="" className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-2xl font-black text-brand-text-muted uppercase">
                                    {profile.username?.substring(0, 2)}
                                </div>
                            )}
                            <span className={`absolute bottom-1.5 right-1.5 h-4 w-4 rounded-full border-2 border-brand-bg ${
                                profile.online ? "bg-emerald-500" : "bg-slate-500"
                            }`} />
                        </div>

                        <div className="min-w-0 flex-1 pt-1">
                            <h1 className="text-xl sm:text-2xl font-black text-brand-text truncate">
                                {profile.fullName?.trim() || profile.username}
                            </h1>
                            <p className="text-brand-text-muted text-sm">@{profile.username}</p>

                            {profile.bio && (
                                <p className="mt-2 text-sm text-brand-text leading-relaxed max-w-lg break-words">
                                    {profile.bio}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Action buttons */}
                    {!isOwnProfile && (
                        <div className="flex gap-2 mt-5">
                            <button
                                onClick={handleMessage}
                                disabled={startingChat}
                                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-brand-border hover:border-brand-accent/40 hover:bg-brand-surface-hover text-brand-text text-sm font-semibold transition-all disabled:opacity-50"
                            >
                                <MessageCircle size={15} />
                                Message
                            </button>

                            {profile.isFriend ? (
                                <button className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-surface-hover text-brand-text text-sm font-semibold cursor-default">
                                    <Users size={15} />
                                    Friends
                                </button>
                            ) : profile.friendRequestSent ? (
                                <button className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-brand-surface-hover text-brand-text-muted text-sm font-semibold cursor-default">
                                    Request Sent
                                </button>
                            ) : (
                                <button
                                    onClick={handleSendFriendRequest}
                                    disabled={sendingRequest}
                                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white text-sm font-semibold transition-all disabled:opacity-50"
                                >
                                    <UserPlus size={15} />
                                    Add Friend
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 px-6 sm:px-8 py-4 border-b border-brand-border/60">
                    <div className="rounded-2xl bg-brand-surface/60 border border-brand-border p-3 sm:p-4 text-center">
                        <h2 className="text-xl sm:text-2xl font-black text-brand-text">{profile.friendsCount}</h2>
                        <p className="text-[10px] sm:text-xs text-brand-text-muted mt-0.5">Friends</p>
                    </div>
                    <div className="rounded-2xl bg-brand-surface/60 border border-brand-border p-3 sm:p-4 text-center">
                        <h2 className="text-xl sm:text-2xl font-black text-brand-text">{profile.postsCount}</h2>
                        <p className="text-[10px] sm:text-xs text-brand-text-muted mt-0.5">Posts</p>
                    </div>
                    <div className="rounded-2xl bg-brand-surface/60 border border-brand-border p-3 sm:p-4 text-center">
                        <h2 className="text-xl sm:text-2xl font-black text-brand-text">{profile.mutualFriends.length}</h2>
                        <p className="text-[10px] sm:text-xs text-brand-text-muted mt-0.5">Mutual</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 px-6 sm:px-8 pt-3 border-b border-brand-border/60 flex-shrink-0">
                    {(["posts", "friends", "about"] as ProfileTab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2.5 text-xs font-bold capitalize rounded-t-lg transition-all border-b-2 ${
                                activeTab === tab
                                    ? "border-brand-accent text-brand-text"
                                    : "border-transparent text-brand-text-muted hover:text-brand-text"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto no-scrollbar px-6 sm:px-8 py-5">
                    {activeTab === "posts" && (
                        <div className="space-y-4">
                            {loadingPosts ? (
                                <div className="text-xs text-brand-text-muted font-mono text-center py-10">Loading posts...</div>
                            ) : posts.length === 0 ? (
                                <div className="text-center py-12 text-sm text-brand-text-muted">
                                    No posts yet.
                                </div>
                            ) : (
                                posts.map((post) => (
                                    <div key={post._id} className="rounded-2xl border border-brand-border bg-brand-surface/20 p-4 space-y-3">
                                        {post.caption && (
                                            <p className="text-sm text-brand-text leading-relaxed break-words">{post.caption}</p>
                                        )}
                                        <PostMedia media={post.media} />
                                        <div className="flex items-center gap-4 pt-2 border-t border-brand-border/40 text-xs text-brand-text-muted">
                                            <span>{post.likes?.length ?? 0} likes</span>
                                            <span>{post.commentsCount ?? 0} comments</span>
                                            <span className="ml-auto">{new Date(post.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === "friends" && (
                        <div className="space-y-3">
                            {profile.mutualFriends.length === 0 ? (
                                <div className="text-center py-12 text-sm text-brand-text-muted">
                                    No mutual friends to show.
                                </div>
                            ) : (
                                <>
                                    <p className="text-xs font-bold text-brand-text-muted uppercase tracking-wide mb-2">
                                        Mutual Friends
                                    </p>
                                    {profile.mutualFriends.map((friend) => (
                                        <div key={friend._id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-brand-surface-hover/40 transition-all">
                                            <div className="h-10 w-10 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-sm font-bold text-brand-text overflow-hidden flex-shrink-0">
                                                {friend.profilePicture ? (
                                                    <img
                                                        src={typeof friend.profilePicture === "string" ? friend.profilePicture : friend.profilePicture.url}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span>{friend.username?.substring(0, 2)}</span>
                                                )}
                                            </div>
                                            <span className="text-sm font-semibold text-brand-text">@{friend.username}</span>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === "about" && (
                        <div className="space-y-4">
                            <div className="space-y-3">
                                {profile.occupation && (
                                    <div className="flex items-center gap-3 text-sm text-brand-text">
                                        <Briefcase size={16} className="text-brand-text-muted flex-shrink-0" />
                                        {profile.occupation}
                                    </div>
                                )}
                                {profile.city && (
                                    <div className="flex items-center gap-3 text-sm text-brand-text">
                                        <MapPin size={16} className="text-brand-text-muted flex-shrink-0" />
                                        {profile.city}
                                    </div>
                                )}
                                {profile.nationality && (
                                    <div className="flex items-center gap-3 text-sm text-brand-text">
                                        <Globe2 size={16} className="text-brand-text-muted flex-shrink-0" />
                                        {profile.nationality}
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-sm text-brand-text">
                                    <Calendar size={16} className="text-brand-text-muted flex-shrink-0" />
                                    Joined {new Date(profile.joinedAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                                </div>
                            </div>

                            {profile.badges.length > 0 && (
                                <div className="pt-4 border-t border-brand-border/60">
                                    <p className="text-xs font-bold text-brand-text-muted uppercase tracking-wide mb-3 flex items-center gap-1.5">
                                        <Award size={13} />
                                        Badges
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.badges.map((badge) => (
                                            <span
                                                key={badge}
                                                className="px-3 py-1.5 rounded-lg bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-xs font-semibold"
                                            >
                                                {badge}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!profile.online && (
                                <p className="text-xs text-brand-text-muted pt-2">
                                    Last seen {new Date(profile.lastSeen).toLocaleString()}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ProfileView;