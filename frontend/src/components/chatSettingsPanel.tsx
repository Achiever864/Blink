import React from "react";
import { X, LogOut, Users, UserX } from "lucide-react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useStatus } from "../context/StatusBarContext";
import type { Conversation } from "../types/chat";

interface ChatSettingsPanelProps {
    chat: Conversation;
    onClose: () => void;
    onLeftGroup?: () => void;
}

const ChatSettingsPanel: React.FC<ChatSettingsPanelProps> = ({ chat, onClose, onLeftGroup }) => {
    const { user } = useAuth();
    const { showStatus } = useStatus();

    const handleBlockUser = async () => {
        if (!chat.otherUserId || !user?.id) return;
        try {
            await API.post("/friend/blockUser", { blocker: user.id, blockee: chat.otherUserId });
            showStatus("User blocked", "success");
            onClose();
        } catch (error: any) {
            showStatus(error.response?.data?.message || "Failed to block user", "error");
        }
    };

    const handleLeaveGroup = async () => {
        if (!user?.id) return;
        try {
            await API.post("/conversation/leaveGroup", {
                conversationId: chat.conversationId,
                userId: user.id
            });
            showStatus("You left the group", "success");
            onClose();
            onLeftGroup?.();
        } catch (error: any) {
            showStatus(error.response?.data?.message || "Failed to leave group", "error");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-bg/80 backdrop-blur-md p-4">
            <div className="w-full max-w-sm rounded-3xl border border-brand-border bg-brand-surface/60 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border bg-brand-bg/40">
                    <h3 className="text-sm font-bold text-brand-text">
                        {chat.isGroup ? "Group Settings" : "Chat Options"}
                    </h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-brand-text-muted hover:bg-brand-surface hover:text-brand-text transition-all">
                        <X size={16} />
                    </button>
                </div>

                <div className="flex flex-col items-center gap-2 py-6 border-b border-brand-border/60">
                    <div className="h-16 w-16 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent font-bold text-lg overflow-hidden">
                        {chat.profilePicture ? (
                            <img src={chat.profilePicture} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <span>{chat.avatarLabel}</span>
                        )}
                    </div>
                    <p className="text-sm font-bold text-brand-text">{chat.title}</p>
                    {chat.isGroup && (
                        <p className="text-[11px] text-brand-text-muted">{chat.participants.length} members</p>
                    )}
                </div>

                <div className="p-3 space-y-1">
                    {chat.isGroup ? (
                        <>
                            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-brand-text hover:bg-brand-surface transition-all">
                                <Users size={15} />
                                View members
                            </button>
                            <button
                                onClick={handleLeaveGroup}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-all"
                            >
                                <LogOut size={15} />
                                Leave group
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleBlockUser}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-all"
                        >
                            <UserX size={15} />
                            Block user
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatSettingsPanel;