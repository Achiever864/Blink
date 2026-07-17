import React, { useState, useEffect, useCallback } from "react";
import { 
    Bell, 
    MessageSquare, 
    Sparkles, 
    ShieldAlert, 
    Radio, 
    CheckCheck, 
    Trash2, 
    Layers,
    Loader2
} from "lucide-react";
import Sidebar from "../components/sideBar";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import socket from "../socket";

type NotificationFilter = "all" | "message" | "friend_request" | "friend_accept" | "like" | "comment";

interface NotificationItem {
    _id: string;
    type: "message" | "friend_request" | "friend_accept" | "like" | "comment";
    sender: {
        _id: string;
        username: string;
        profilePicture?: { url: string };
    };
    text: string;
    isRead: boolean;
    createdAt: string;
    refId?: string;
    refModel?: "Post" | "Message" | "Friendship";
}

const getNotificationTypeConfig = (type: string) => {
    switch (type) {
        case "message":
            return { icon: <MessageSquare size={13} />, color: "text-violet-400 bg-violet-500/5 border-violet-500/20" };
        case "friend_accept":
            return { icon: <Sparkles size={13} />, color: "text-teal-400 bg-teal-500/5 border-teal-500/20" };
        case "friend_request":
            return { icon: <ShieldAlert size={13} />, color: "text-amber-400 bg-amber-500/5 border-amber-500/20" };
        default:
            return { icon: <Bell size={13} />, color: "text-slate-400 bg-slate-500/5 border-slate-500/20" };
    }
};

const NotificationsPage: React.FC = () => {
    const { user } = useAuth();

    const [feed, setFeed] = useState<NotificationItem[]>([]);
    const [activeFilter, setActiveFilter] = useState<NotificationFilter>("all");
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const fetchNotifications = useCallback(async (pageNum: number, append = false) => {
        if (!user?.id) return;

        if (append) setLoadingMore(true);
        else setLoading(true);

        try {
            const res = await API.post(
                "/notifications/getNotification",
                { userId: user.id },
                { params: { page: pageNum, limit: 20 } }
            );

            setFeed(prev => append ? [...prev, ...res.data.notifications] : res.data.notifications);
            setHasMore(res.data.pagination.hasMore);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchNotifications(1);
    }, [fetchNotifications]);

    // Live push for new notifications while the page is open
    useEffect(() => {
        if (!user?.id) return;

        socket.on("new-notification", (notification: NotificationItem) => {
            setFeed(prev => [notification, ...prev]);
        });

        return () => {
            socket.off("new-notification");
        };
    }, [user?.id]);

    const handleMarkAllRead = async () => {
        try {
            await API.post("/notification/markAllAsRead", { userId: user?.id });
            setFeed(prev => prev.map(item => ({ ...item, isRead: true })));
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    const handleMarkRead = async (id: string) => {
        try {
            await API.post("/notification/markAsRead", { notificationId: id });
            setFeed(prev => prev.map(item => item._id === id ? { ...item, isRead: true } : item));
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchNotifications(nextPage, true);
    };

    // Clearing is local-only for now — there's no delete endpoint on the backend yet,
    // so a refresh will bring these back. Flagging this rather than pretending it's permanent.
    const handleClearAll = () => {
        setFeed([]);
    };

    const filteredFeed = feed.filter(item => {
        if (activeFilter === "all") return true;
        return item.type === activeFilter;
    });

    const unreadCount = feed.filter(item => !item.isRead).length;

    const filters: NotificationFilter[] = ["all", "message", "friend_request", "friend_accept", "like", "comment"];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center overflow-hidden">
            {/*Ambient Background */}
            <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 h-[600px] w-[600px] rounded-full bg-violet-600/5 blur-[150px] pointer-events-none" />

            {/* Single grid holds Sidebar + main, same pattern as ProfilePage */}
            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-[80px_1fr] lg:grid-cols-[240px_1fr] px-4 gap-6 relative z-10">
                <Sidebar />

                <main className="py-6 overflow-y-auto max-h-screen no-scrollbar space-y-6">
                    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">

                        {/* Status ticker */}
                        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/40 border border-slate-900/80 rounded-2xl backdrop-blur-md flex-shrink-0">
                            <div className="flex items-center gap-2.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                                </span>
                                <p className="text-[11px] font-mono tracking-wider text-slate-500 uppercase">
                                    Blink Telemetry Tunnel: <span className="text-teal-400">Live</span>
                                </p>
                            </div>
                            {unreadCount > 0 && (
                                <span className="text-[10px] font-mono font-bold bg-violet-600/10 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-md">
                                    {unreadCount} pending updates
                                </span>
                            )}
                        </div>

                        {/* Header row */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-1 flex-shrink-0">
                            <div>
                                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                                    <Bell size={18} className="text-slate-400" />
                                    Notification Feed
                                </h2>
                                <p className="text-xs text-slate-500">Monitor incoming messages, friend activity, and engagement on your posts.</p>
                            </div>

                            <div className="flex gap-2 self-stretch sm:self-auto">
                                <button 
                                    onClick={handleMarkAllRead}
                                    disabled={unreadCount === 0}
                                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900/60 border border-slate-900 hover:border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-[11px] font-bold text-slate-300 transition-all outline-none"
                                >
                                    <CheckCheck size={12} />
                                    <span>Read All</span>
                                </button>
                                <button 
                                    onClick={handleClearAll}
                                    disabled={feed.length === 0}
                                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-950/20 border border-rose-950/40 hover:bg-rose-900/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-[11px] font-bold text-rose-400 transition-all outline-none"
                                >
                                    <Trash2 size={12} />
                                    <span>Purge Feed</span>
                                </button>
                            </div>
                        </div>

                        {/* Filter tabs */}
                        <div className="flex gap-1.5 border-b border-slate-900/60 pb-3 overflow-x-auto no-scrollbar flex-shrink-0">
                            {filters.map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={`px-4 py-2 text-xs font-bold tracking-wide rounded-xl capitalize transition-all border outline-none whitespace-nowrap ${
                                        activeFilter === filter 
                                            ? "bg-violet-600/10 border-violet-500/20 text-violet-400" 
                                            : "bg-transparent border-transparent text-slate-500 hover:text-slate-300"
                                    }`}
                                >
                                    {filter === "all" ? "All" : filter.replace("_", " ")}
                                </button>
                            ))}
                        </div>

                        {/* List */}
                        <div className="space-y-2.5 pb-10">
                            {loading ? (
                                <div className="flex items-center justify-center py-20 text-slate-500">
                                    <Loader2 size={20} className="animate-spin" />
                                </div>
                            ) : filteredFeed.length === 0 ? (
                                <div className="text-center py-20 bg-slate-900/10 border border-dashed border-slate-900 rounded-3xl p-6 flex flex-col items-center justify-center gap-2 text-slate-600 font-mono text-xs">
                                    <Layers size={16} />
                                    <span>No notifications matching this filter.</span>
                                </div>
                            ) : (
                                <>
                                    {filteredFeed.map((log) => {
                                        const config = getNotificationTypeConfig(log.type);
                                        return (
                                            <div 
                                                key={log._id} 
                                                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 group ${
                                                    !log.isRead
                                                        ? "bg-slate-900/30 border-slate-800/80 shadow-md shadow-violet-950/5" 
                                                        : "bg-slate-950/40 border-slate-900/50 opacity-70 hover:opacity-100"
                                                }`}
                                            >
                                                <div className="flex gap-4">
                                                    <div className={`p-2 rounded-xl border flex items-center justify-center h-8 w-8 mt-0.5 flex-shrink-0 ${config.color}`}>
                                                        {config.icon}
                                                    </div>

                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h4 className="text-xs font-bold text-slate-200 tracking-wide">
                                                                {log.sender.username}
                                                            </h4>
                                                            {!log.isRead && (
                                                                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 ring-4 ring-violet-500/10" />
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-400 leading-relaxed max-w-xl">{log.text}</p>
                                                        <span className="block text-[10px] font-mono text-slate-600 pt-1">
                                                            {new Date(log.createdAt).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => handleMarkRead(log._id)}
                                                        disabled={log.isRead}
                                                        className="p-1.5 rounded-lg bg-slate-950 border border-slate-900 hover:text-teal-400 transition-colors disabled:opacity-40"
                                                        title={log.isRead ? "Already read" : "Mark as read"}
                                                    >
                                                        <Radio size={13} className={!log.isRead ? "text-slate-600" : "text-teal-400"} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {hasMore && (
                                        <button
                                            onClick={handleLoadMore}
                                            disabled={loadingMore}
                                            className="w-full py-3 rounded-xl bg-slate-900/40 border border-slate-900 text-xs font-bold text-slate-400 hover:text-white transition-all disabled:opacity-50"
                                        >
                                            {loadingMore ? "Loading..." : "Load more"}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default NotificationsPage;