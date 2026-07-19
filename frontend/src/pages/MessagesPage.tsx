import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Search, MessageSquarePlus } from "lucide-react";
import Sidebar from "../components/sideBar";
import API from "../api/axios";
import { useStatus } from "../context/StatusBarContext";
import NewChatModal from "../components/newChatModal";
import socket from "../socket";
import ChatWindow from "../components/chatWIndow";
import ChatSettingsPanel from "../components/chatSettingsPanel";
import type { Conversation } from "../types/chat";

const MessagePage: React.FC = () => {
    const { user } = useAuth();
    const { showStatus } = useStatus();
    const [activeChat, setActiveChat] = useState<Conversation | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showChatSettings, setShowChatSettings] = useState(false);

    const fetchOnlineStatus = async (userId: string) => {
        try {
            const res = await API.get(`/user/getOnlineStatus/${userId}`);
            return { online: res.data.isOnline as boolean, lastSeen: res.data.lastSeen as string };
        } catch {
            return { online: false, lastSeen: undefined };
        }
    };

    const fetchConversation = async () => {
        if (!user?.id) return;

        try {
            const res = await API.post("/conversation/getConversation", { userId: user.id });

            const mapped = res.data.conversation.map((converse: any) => {
                const otherUser = converse.participant.find((p: any) => p._id !== user?.id);

                const chatTitle = converse.isGroupChat
                    ? (converse.roomName || "Untitled Group")
                    : `${otherUser?.username || "deleted_user"}`;

                const avatar = converse.isGroupChat
                    ? (converse.groupvatar?.url ? <img src={converse.groupvatar.url} alt="image" className="w-full h-full object-cover rounded-xl" /> : chatTitle.substring(0, 2))
                    : (otherUser.profilePicture ? <img src={otherUser?.profilePicture?.url} alt="image" className="w-full h-full object-cover rounded-xl" /> : otherUser?.username.substring(0, 2));

                return {
                    conversationId: converse._id,
                    isGroup: converse.isGroupChat,
                    title: chatTitle,
                    avatarLabel: avatar,
                    participants: converse.participant,
                    otherUserId: converse.isGroupChat ? undefined : otherUser?._id,
                    profilePicture: converse.isGroupChat ? "" : otherUser?.profilePicture?.url || "",
                    latestMessage: converse.latestMessage || null,
                    updatedAt: converse.updatedAt
                };
            });

            const withStatus: Conversation[] = await Promise.all(
                mapped.map(async (chat: Conversation) => {
                    if (chat.isGroup || !chat.otherUserId) return chat;
                    const status = await fetchOnlineStatus(chat.otherUserId);
                    return { ...chat, online: status.online, lastSeen: status.lastSeen };
                })
            );

            setConversations(withStatus);
            setActiveChat(prev => {
                if (!prev) return prev;
                return withStatus.find(c => c.conversationId === prev.conversationId) || prev;
            });
        } catch (error) {
            console.log(error);
        }
    };

    const handleStartNewChat = async (targetUserId: string) => {
        try {
            await API.post("/conversation/create", {
                isGroupChat: false,
                participants: [targetUserId, user!.id]
            });
            fetchConversation();
        } catch (error) {
            console.error("Failed to initialize conversation:", error);
            throw error;
        }
    };

    const handleCreateGroup = async (roomName: string, participantIds: string[]) => {
        try {
            await API.post("/conversation/create", {
                isGroupChat: true,
                roomName,
                participants: [...participantIds, user!.id],
                creatorId: user!.id
            });
            showStatus("Group created!", "success");
            fetchConversation();
        } catch (error) {
            showStatus("Failed to create group!");
            throw error;
        }
    };

    useEffect(() => {
        if (!user?.id) return;

        socket.emit("setup", user.id);
        fetchConversation();

        socket.on("user-online", ({ userId }: { userId: string }) => {
            setConversations(prev => prev.map(c => c.otherUserId === userId ? { ...c, online: true } : c));
            setActiveChat(prev => prev && prev.otherUserId === userId ? { ...prev, online: true } : prev);
        });

        socket.on("user-offline", ({ userId, lastSeen }: { userId: string; lastSeen: string }) => {
            setConversations(prev => prev.map(c => c.otherUserId === userId ? { ...c, online: false, lastSeen } : c));
            setActiveChat(prev => prev && prev.otherUserId === userId ? { ...prev, online: false, lastSeen } : prev);
        });

        return () => {
            socket.off("user-online");
            socket.off("user-offline");
        };
    }, [user?.id]);

    return (
        <div className="relative min-h-screen bg-brand-bg text-brand-text flex justify-center overflow-hidden">
            <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-brand-accent/5 blur-[130px] pointer-events-none " />
            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-[80px_1fr] lg:grid-cols-[260px_1fr] px-2 sm:px-4 lg:px-6 gap-3 lg:gap-6 relative z-10">
                <Sidebar />

                <main className="py-4 sm:py-6 grid grid-cols-1 md:grid-cols-[340px_1fr] overflow-hidden max-h-screen w-full min-w-0">

                    {/*Chat directory — full width on mobile when no chat is open,
                        hidden on mobile once a chat is active (WhatsApp-style swap) */}
                    <section className={`border-r border-brand-border/60 md:pr-4 flex-col h-full overflow-hidden ${
                        activeChat ? "hidden md:flex" : "flex"
                    }`}>
                        <div className="mb-4 space-y-4 px-2 sm:px-0">
                            <h1 className="text-2xl font-black tracking-tight text-brand-text flex items-center gap-2">
                                Chats
                            </h1>
                            <div className="relative flex items-center">
                                <Search className="absolute left-4 text-brand-text-muted" size={16} />
                                <input type="text"
                                    placeholder="Search a friend..."
                                    className="w-full text-xs rounded-xl border border-brand-border bg-brand-bg py-3 pl-11 pr-4 text-brand-text placeholder-slate-600 outline-none transition-all focus:border-brand-accent/40"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1 px-2 sm:px-0">
                            {conversations.map((chat) => (
                                <button
                                    key={chat.conversationId}
                                    onClick={() => setActiveChat(chat)}
                                    className={`w-full text-left p-3.5 rounded-2xl flex items-center gap-3.5 border transition-all ${
                                        activeChat?.conversationId === chat.conversationId
                                            ? "bg-gradient-to-r from-brand-accent/20 to-brand-surface/40 border-brand-accent/30 shadow-md shadow-violet-950/10"
                                            : "bg-transparent border-transparent hover:bg-brand-surface-hover/40 hover:border-brand-border"
                                    }`}
                                >
                                    <div className="relative">
                                        <div className="h-10 w-10 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-sm font-bold text-brand-text overflow-hidden">
                                            {chat.avatarLabel}
                                        </div>
                                        {chat.online && (
                                            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-brand-bg" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-bold text-brand-text truncate">{chat.title}</h4>
                                            <span className="text-[10px] text-brand-text-muted font-medium">{new Date(chat.updatedAt).toLocaleTimeString()}</span>
                                        </div>
                                        <p className={`text-xs truncate mt-0.5 ${chat.unread ? "text-brand-accent font-semibold" : "text-brand-text-muted"}`}>
                                            {chat.latestMessage?.text || "No messages yet"}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="p-3 border-t border-brand-border/80 bg-brand-bg">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="w-full py-3 px-4 rounded-xl bg-brand-accent/10 hover:bg-brand-accent border border-brand-accent/20 text-brand-accent hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
                            >
                                <MessageSquarePlus size={15} />
                                <span>Chat with Friends</span>
                            </button>
                        </div>

                        <NewChatModal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            onStartChat={handleStartNewChat}
                            onCreateGroup={handleCreateGroup}
                        />
                    </section>

                    {/*Chat window — hidden on mobile until a chat is selected,
                        always visible from md upward (so the empty state still shows on desktop) */}
                    <div className={`h-full min-h-0 md:pl-6 ${activeChat ? "flex" : "hidden md:flex"} flex-col`}>
                        <ChatWindow
                            activeChat={activeChat}
                            onOpenSettings={() => setShowChatSettings(true)}
                            onStartNewChat={() => setIsModalOpen(true)}
                            onBack={() => setActiveChat(null)}
                        />
                    </div>
                </main>
            </div>

            {showChatSettings && activeChat && (
                <ChatSettingsPanel
                    chat={activeChat}
                    onClose={() => setShowChatSettings(false)}
                    onLeftGroup={() => {
                        setActiveChat(null);
                        fetchConversation();
                    }}
                />
            )}
        </div>
    );
};

export default MessagePage;