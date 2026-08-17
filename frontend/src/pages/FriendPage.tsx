import React, { useState, useEffect } from "react";
import {
    Search, UserPlus, Check, X, Users, UserCheck, Loader2, Eye, MessageCircle
} from "lucide-react";
import Sidebar from "../components/sideBar";
import API from "../api/axios";
import { useStatus } from "../context/StatusBarContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ContextMenu from "../context/ContextMenu";
import ProfileView from "../components/ProfileView";

interface NetworkUser {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
}

interface SearchResult {
    id: string;
    username: string;
    avatarUrl?: string;
    status: "none" | "friend" | "requested" | "pending" | "blocked";
}

const FriendsPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [loadingSearch, setLoadingSearch] = useState(false);

    const { showStatus } = useStatus();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [pendingRequests, setPendingRequests] = useState<NetworkUser[]>([]);
    const [myCircle, setMyCircle] = useState<NetworkUser[]>([]);
    const [loadingFriends, setLoadingFriends] = useState(true);

    const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);

    const fetchRequest = async () => {
        try {
            const res = await API.post("/friend/getPending", { recipientId: user?.id });

            const mapped = res.data.relation.map((request: any) => ({
                id: request.requester._id,
                username: request.requester.username,
                displayName: request.requester.username,
                avatarUrl: request.requester.profilePicture?.url,
            }));

            setPendingRequests(mapped);
        } catch (error) {
            showStatus("Unable to fetch friend requests", "error");
        }
    };

    const fetchFriends = async () => {
        try {
            setLoadingFriends(true);
            const res = await API.post("/friend/getFriends", { userId: user?.id });

            const mapped = res.data.friends.map((friend: any) => {
                const otherUser = friend.requester._id === user?.id ? friend.recipient : friend.requester;
                return {
                    id: otherUser._id,
                    username: otherUser.username,
                    avatarUrl: otherUser.profilePicture?.url,
                    displayName: otherUser.username,
                };
            });

            setMyCircle(mapped);
        } catch (error) {
            showStatus("Unable to fetch friends", "error");
        } finally {
            setLoadingFriends(false);
        }
    };

    const searchUsers = async () => {
        if (!user?.id) return;
        setLoadingSearch(true);
        try {
            const res = await API.post("/friend/searchUsers", {
                userId: user.id,
                query: searchQuery
            });
            setSearchResults(res.data.users);
        } catch (error) {
            showStatus("Unable to find matches. Please try again!", "error");
        } finally {
            setLoadingSearch(false);
        }
    };

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(() => searchUsers(), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        if (!user?.id) return;
        fetchRequest();
        fetchFriends();
    }, [user?.id]);

    const handleAcceptRequest = async (requestId: string) => {
        try {
            await API.post("/friend/accept", { requesterId: requestId, recipientId: user?.id });
            fetchRequest();
            fetchFriends();
            showStatus("Friend request accepted", "success");
        } catch (error) {
            showStatus("Unable to accept request", "error");
        }
    };

    const handleDeclineRequest = async (id: string) => {
        try {
            await API.post("/friend/reject", { requesterId: id, recipientId: user?.id });
            setPendingRequests(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            showStatus("Unable to decline request", "error");
        }
    };

    const handleSendRequest = async (targetId: string) => {
        if (!user?.id) return;
        try {
            await API.post("/friend/send", { requesterId: user.id, recipientId: targetId });
            setSearchResults(prev => prev.map(r => r.id === targetId ? { ...r, status: "requested" } : r));
            showStatus("Friend request sent", "success");
        } catch (error: any) {
            showStatus(error.response?.data?.message || "Unable to send request", "error");
        }
    };

    const handleMessage = async (targetId: string) => {
        if (!user?.id) return;
        try {
            await API.post("/conversation/create", {
                isGroupChat: false,
                participants: [targetId, user.id]
            });
            navigate("/message");
        } catch (error) {
            showStatus("Unable to start chat", "error");
        }
    };

    const isSearching = searchQuery.trim().length > 0;

    return (
        <div className="relative min-h-screen bg-brand-bg text-brand-text flex justify-center overflow-hidden">
            <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-brand-accent/5 blur-[120px] pointer-events-none" />

            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-[80px_1fr] lg:grid-cols-[240px_1fr] px-2 sm:px-4 lg:px-6 gap-3 lg:gap-6 relative z-10">
                <Sidebar />

                <main className="py-4 sm:py-6 md:overflow-y-auto md:max-h-screen no-scrollbar space-y-4 sm:space-y-6 w-full min-w-0">
                    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4 sm:gap-6">

                        {/* Header row */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-1">
                            <div>
                                <h2 className="text-xl font-black text-brand-text tracking-tight flex items-center gap-2">
                                    <Users size={18} className="text-brand-text-muted" />
                                    Friends
                                </h2>
                                <p className="text-xs text-brand-text-muted">
                                    {myCircle.length} friend{myCircle.length !== 1 ? "s" : ""} · Search to find anyone on Blink
                                </p>
                            </div>
                        </div>

                        {/* Global search bar */}
                        <div className="relative flex items-center flex-shrink-0">
                            <Search size={16} className="absolute left-4 text-brand-text-muted" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search any username on Blink..."
                                className="w-full bg-brand-surface/30 border border-brand-border/80 rounded-2xl pl-11 pr-12 py-3.5 text-sm text-brand-text placeholder-slate-600 outline-none focus:border-brand-accent/40 backdrop-blur-sm transition-all"
                            />
                            {isSearching && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-4 text-brand-text-muted hover:text-brand-text"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* SEARCH RESULTS VIEW */}
                        {isSearching ? (
                            <div className="space-y-2.5 pb-10">
                                {loadingSearch ? (
                                    <div className="flex items-center justify-center py-16 text-brand-text-muted">
                                        <Loader2 size={20} className="animate-spin" />
                                    </div>
                                ) : searchResults.length === 0 ? (
                                    <div className="text-center py-16 bg-brand-surface/10 border border-dashed border-brand-border rounded-3xl text-brand-text-muted text-xs font-mono">
                                        No users found matching "{searchQuery}"
                                    </div>
                                ) : (
                                    searchResults.map((result) => (
                                        <ContextMenu
                                            key={result.id}
                                            items={[
                                                { label: "View profile", icon: Eye, onClick: () => setViewingProfileId(result.id) },
                                                { label: "Message", icon: MessageCircle, onClick: () => handleMessage(result.id) },
                                                ...(result.status === "none" ? [{
                                                    label: "Add friend", icon: UserPlus, onClick: () => handleSendRequest(result.id)
                                                }] : [])
                                            ]}
                                        >
                                            <div className="flex items-center gap-3 p-3 rounded-2xl border border-brand-border bg-brand-surface/20 hover:bg-brand-surface/40 transition-all">
                                                <button
                                                    onClick={() => setViewingProfileId(result.id)}
                                                    className="h-11 w-11 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-sm font-bold text-brand-text overflow-hidden flex-shrink-0"
                                                >
                                                    {result.avatarUrl ? (
                                                        <img src={result.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>{result.username?.substring(0, 2)}</span>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => setViewingProfileId(result.id)}
                                                    className="flex-1 min-w-0 text-left"
                                                >
                                                    <p className="text-sm font-bold text-brand-text truncate">@{result.username}</p>
                                                </button>

                                                {result.status === "friend" && (
                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0">
                                                        <UserCheck size={12} /> Friends
                                                    </span>
                                                )}
                                                {result.status === "requested" && (
                                                    <span className="text-[10px] font-bold text-brand-text-muted px-2.5 py-1.5 rounded-lg bg-brand-surface-hover flex-shrink-0">
                                                        Requested
                                                    </span>
                                                )}
                                                {result.status === "pending" && (
                                                    <span className="text-[10px] font-bold text-amber-400 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex-shrink-0">
                                                        Wants to add you
                                                    </span>
                                                )}
                                                {result.status === "blocked" && (
                                                    <span className="text-[10px] font-bold text-rose-400 px-2.5 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 flex-shrink-0">
                                                        Blocked
                                                    </span>
                                                )}
                                                {result.status === "none" && (
                                                    <button
                                                        onClick={() => handleSendRequest(result.id)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-accent/10 hover:bg-brand-accent text-brand-accent hover:text-white border border-brand-accent/20 text-[11px] font-bold transition-all flex-shrink-0"
                                                    >
                                                        <UserPlus size={12} /> Add
                                                    </button>
                                                )}
                                            </div>
                                        </ContextMenu>
                                    ))
                                )}
                            </div>
                        ) : (
                            <>
                                {/* PENDING REQUESTS */}
                                {pendingRequests.length > 0 && (
                                    <div className="space-y-2.5">
                                        <h3 className="text-xs font-bold text-brand-text-muted uppercase tracking-wider px-1">Pending Requests</h3>
                                        {pendingRequests.map((request) => (
                                            <ContextMenu
                                                key={request.id}
                                                items={[
                                                    { label: "View profile", icon: Eye, onClick: () => setViewingProfileId(request.id) }
                                                ]}
                                            >
                                                <div className="flex items-center gap-3 p-3 rounded-2xl border border-indigo-500/10 bg-gradient-to-br from-indigo-950/10 via-brand-surface/20 to-brand-surface/40">
                                                    <button
                                                        onClick={() => setViewingProfileId(request.id)}
                                                        className="h-11 w-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm uppercase overflow-hidden flex-shrink-0"
                                                    >
                                                        {request.avatarUrl ? (
                                                            <img src={request.avatarUrl} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <span>{request.username?.substring(0, 2)}</span>
                                                        )}
                                                    </button>
                                                    <p className="flex-1 min-w-0 text-sm font-bold text-brand-text truncate">@{request.username}</p>
                                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                                        <button
                                                            onClick={() => handleAcceptRequest(request.id)}
                                                            className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"
                                                        >
                                                            <Check size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeclineRequest(request.id)}
                                                            className="p-2 rounded-xl bg-brand-surface border border-brand-border text-brand-text-muted hover:text-rose-400 transition-all"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </ContextMenu>
                                        ))}
                                    </div>
                                )}

                                {/* FRIENDS LIST */}
                                <div className="space-y-2.5 pb-10">
                                    <h3 className="text-xs font-bold text-brand-text-muted uppercase tracking-wider px-1">My Friends</h3>

                                    {loadingFriends ? (
                                        <div className="flex items-center justify-center py-16 text-brand-text-muted">
                                            <Loader2 size={20} className="animate-spin" />
                                        </div>
                                    ) : myCircle.length === 0 ? (
                                        <div className="text-center py-16 bg-brand-surface/10 border border-dashed border-brand-border rounded-3xl text-brand-text-muted text-xs font-mono">
                                            No friends yet — search above to find people.
                                        </div>
                                    ) : (
                                        myCircle.map((friend) => (
                                            <ContextMenu
                                                key={friend.id}
                                                items={[
                                                    { label: "View profile", icon: Eye, onClick: () => setViewingProfileId(friend.id) },
                                                    { label: "Message", icon: MessageCircle, onClick: () => handleMessage(friend.id) }
                                                ]}
                                            >
                                                <div className="flex items-center gap-3 p-3 rounded-2xl border border-brand-border bg-brand-surface/20 hover:bg-brand-surface/40 transition-all">
                                                    <button
                                                        onClick={() => setViewingProfileId(friend.id)}
                                                        className="h-11 w-11 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-sm font-bold text-brand-text overflow-hidden flex-shrink-0"
                                                    >
                                                        {friend.avatarUrl ? (
                                                            <img src={friend.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span>{friend.username?.substring(0, 2)}</span>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => setViewingProfileId(friend.id)}
                                                        className="flex-1 min-w-0 text-left"
                                                    >
                                                        <p className="text-sm font-bold text-brand-text truncate">@{friend.username}</p>
                                                    </button>
                                                    <button
                                                        onClick={() => handleMessage(friend.id)}
                                                        className="p-2 rounded-xl text-brand-text-muted hover:bg-brand-surface-hover hover:text-brand-accent transition-all flex-shrink-0"
                                                    >
                                                        <MessageCircle size={16} />
                                                    </button>
                                                </div>
                                            </ContextMenu>
                                        ))
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>

            <ProfileView
                userId={viewingProfileId}
                isOpen={!!viewingProfileId}
                onClose={() => setViewingProfileId(null)}
            />
        </div>
    );
};

export default FriendsPage;