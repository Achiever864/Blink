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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
            <div className="w-full max-w-sm rounded-3xl border border-slate-900 bg-slate-900/60 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-900 bg-slate-950/40">
                    <h3 className="text-sm font-bold text-slate-200">
                        {chat.isGroup ? "Group Settings" : "Chat Options"}
                    </h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-900 hover:text-slate-200 transition-all">
                        <X size={16} />
                    </button>
                </div>

                <div className="flex flex-col items-center gap-2 py-6 border-b border-slate-900/60">
                    <div className="h-16 w-16 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-lg overflow-hidden">
                        {chat.profilePicture ? (
                            <img src={chat.profilePicture} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <span>{chat.avatarLabel}</span>
                        )}
                    </div>
                    <p className="text-sm font-bold text-slate-200">{chat.title}</p>
                    {chat.isGroup && (
                        <p className="text-[11px] text-slate-500">{chat.participants.length} members</p>
                    )}
                </div>

                <div className="p-3 space-y-1">
                    {chat.isGroup ? (
                        <>
                            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-900 transition-all">
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