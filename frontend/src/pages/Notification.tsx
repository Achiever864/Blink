import React, { useState, useEffect, useCallback } from "react";
import { 
    Bell, 
    MessageSquare, 
    Sparkles, 
    ShieldAlert,
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
            return { icon: <MessageSquare size={13} />, color: "text-brand-accent bg-violet-500/5 border-brand-accent/20" };
        case "friend_accept":
            return { icon: <Sparkles size={13} />, color: "text-teal-400 bg-teal-500/5 border-teal-500/20" };
        case "friend_request":
            return { icon: <ShieldAlert size={13} />, color: "text-amber-400 bg-amber-500/5 border-amber-500/20" };
        default:
            return { icon: <Bell size={13} />, color: "text-brand-text-muted bg-slate-500/5 border-slate-500/20" };
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
        <div className="relative min-h-screen bg-brand-bg text-brand-text flex justify-center overflow-hidden">
            {/*Ambient Background */}
            <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-brand-accent/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 h-[600px] w-[600px] rounded-full bg-brand-accent/5 blur-[150px] pointer-events-none" />

            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-[80px_1fr] lg:grid-cols-[240px_1fr] px-2 sm:px-4 lg:px-6 gap-3 lg:gap-6 relative z-10">
                <Sidebar />

                <main className="py-4 sm:py-6 md:overflow-y-auto md:max-h-screen no-scrollbar space-y-4 sm:space-y-6 w-full min-w-0">
                    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4 sm:gap-6">

                        {/* Status ticker */}
                        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 bg-brand-surface/40 border border-brand-border/80 rounded-2xl backdrop-blur-md flex-shrink-0 gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <span className="relative flex h-2 w-2 flex-shrink-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                                </span>
                                {/* <p className="text-[11px] font-mono tracking-wider text-brand-text-muted uppercase truncate">
                                    Blink Telemetry Tunnel: <span className="text-teal-400">Live</span>
                                </p> */}
                            </div>
                            {unreadCount > 0 && (
                                <span className="text-[10px] font-mono font-bold bg-brand-accent/10 text-brand-accent border border-brand-accent/20 px-2 py-0.5 rounded-md flex-shrink-0">
                                    {unreadCount} pending updates
                                </span>
                            )}
                        </div>

                        {/* Header row */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-1 flex-shrink-0">
                            <div>
                                <h2 className="text-xl font-black text-brand-text tracking-tight flex items-center gap-2">
                                    <Bell size={18} className="text-brand-text-muted" />
                                    Notification Feed
                                </h2>
                                <p className="text-xs text-brand-text-muted">Monitor activity across your account.</p>
                            </div>

                            <div className="flex gap-2 self-stretch sm:self-auto">
                                <button 
                                    onClick={handleMarkAllRead}
                                    disabled={unreadCount === 0}
                                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-surface/60 border border-brand-border hover:border-brand-border disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-[11px] font-bold text-brand-text transition-all outline-none"
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
                                    <span>Delete all</span>
                                </button>
                            </div>
                        </div>

                        {/* Filter tabs */}
                        <div className="flex gap-1.5 border-b border-brand-border/60 pb-3 overflow-x-auto no-scrollbar flex-shrink-0">
                            {filters.map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={`px-4 py-2 text-xs font-bold tracking-wide rounded-xl capitalize transition-all border outline-none whitespace-nowrap ${
                                        activeFilter === filter 
                                            ? "bg-brand-accent/10 border-brand-accent/20 text-brand-accent" 
                                            : "bg-transparent border-transparent text-brand-text-muted hover:text-brand-text"
                                    }`}
                                >
                                    {filter === "all" ? "All" : filter.replace("_", " ")}
                                </button>
                            ))}
                        </div>

                        {/* List */}
                        <div className="space-y-2.5 pb-10">
                            {loading ? (
                                <div className="flex items-center justify-center py-20 text-brand-text-muted">
                                    <Loader2 size={20} className="animate-spin" />
                                </div>
                            ) : filteredFeed.length === 0 ? (
                                <div className="text-center py-20 bg-brand-surface/10 border border-dashed border-brand-border rounded-3xl p-6 flex flex-col items-center justify-center gap-2 text-brand-text-muted font-mono text-xs">
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
                                                className={`p-3 sm:p-4 rounded-2xl border transition-all flex items-start justify-between gap-2 sm:gap-4 group ${
                                                    !log.isRead
                                                        ? "bg-brand-surface/30 border-brand-border/80 shadow-md shadow-brand-accent/5" 
                                                        : "bg-brand-bg/40 border-brand-border/50 opacity-70 hover:opacity-100"
                                                }`}
                                            >
                                                <div className="flex gap-3 sm:gap-4 min-w-0">
                                                    <div className={`p-2 rounded-xl border flex items-center justify-center h-8 w-8 mt-0.5 flex-shrink-0 ${config.color}`}>
                                                        {config.icon}
                                                    </div>

                                                    <div className="space-y-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h4 className="text-xs font-bold text-brand-text tracking-wide truncate">
                                                                {log.sender.username}
                                                            </h4>
                                                            {!log.isRead && (
                                                                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 ring-4 ring-violet-500/10 flex-shrink-0" />
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-brand-text-muted leading-relaxed max-w-xl break-words">{log.text}</p>
                                                        <span className="block text-[10px] font-mono text-brand-text-muted pt-1">
                                                            {new Date(log.createdAt).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                                    <button 
                                                        onClick={() => handleMarkRead(log._id)}
                                                        disabled={log.isRead}
                                                        className="p-1.5 rounded-lg bg-brand-bg border border-brand-border hover:text-teal-400 transition-colors disabled:opacity-40"
                                                        title={log.isRead ? "Already read" : "Mark as read"}
                                                    >
                                                    </button> {/*add read notifications here */}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {hasMore && (
                                        <button
                                            onClick={handleLoadMore}
                                            disabled={loadingMore}
                                            className="w-full py-3 rounded-xl bg-brand-surface/40 border border-brand-border text-xs font-bold text-brand-text-muted hover:text-brand-text transition-all disabled:opacity-50"
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