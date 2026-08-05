import React, { useState, useRef, useMemo, useEffect } from "react";
import { X, LogOut, Users, UserX, ArrowLeft, Camera, ShieldCheck, ShieldOff, UserMinus, UserPlus, Lock, Unlock } from "lucide-react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useStatus } from "../context/StatusBarContext";
import type { Conversation } from "../types/chat";

interface ChatSettingsPanelProps {
    chat: Conversation;
    onClose: () => void;
    onLeftGroup?: () => void;
    onUpdate?: (updatedChat: Conversation) => void;
}

interface Friend {
    _id: string;
    username: string;
    profilePicture?: string;
}

type PanelView = "main" | "members" | "addMembers";

const ChatSettingsPanel: React.FC<ChatSettingsPanelProps> = ({ chat, onClose, onLeftGroup, onUpdate }) => {
    const { user } = useAuth();
    const { showStatus } = useStatus();

    const [view, setView] = useState<PanelView>("main");
    const [groupPhotoFile, setGroupPhotoFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const [friends, setFriends] = useState<Friend[]>([]);
    const [loadingFriends, setLoadingFriends] = useState(false);
    const [selectedToAdd, setSelectedToAdd] = useState<Set<string>>(new Set());
    const [addingMembers, setAddingMembers] = useState(false);
    const [togglingLock, setTogglingLock] = useState(false);

    const isAdmin = chat.groupAdmins?.includes(user?.id || "") ?? false;

    const groupPhotoPreview = useMemo(() => {
        if (!groupPhotoFile) return null;
        return URL.createObjectURL(groupPhotoFile);
    }, [groupPhotoFile]);

    useEffect(() => {
        return () => {
            if (groupPhotoPreview) URL.revokeObjectURL(groupPhotoPreview);
        };
    }, [groupPhotoPreview]);

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user?.id) return;

        setGroupPhotoFile(file);
        setUploadingPhoto(true);

        try {
            const formData = new FormData();
            formData.append("conversationId", chat.conversationId);
            formData.append("requesterId", user.id);
            formData.append("groupPhoto", file);

            const res = await API.patch("/conversation/updateGroupInfo", formData);
            showStatus("Group photo updated", "success");
            onUpdate?.(res.data.conversation);
        } catch (error: any) {
            showStatus(error.response?.data?.message || "Failed to update photo", "error");
        } finally {
            setUploadingPhoto(false);
            setGroupPhotoFile(null);
        }
    };

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

    const handlePromote = async (targetUserId: string) => {
        if (!user?.id) return;
        try {
            const res = await API.post("/conversation/promoteAdmin", {
                conversationId: chat.conversationId,
                requesterId: user.id,
                userId: targetUserId
            });
            showStatus("Promoted to admin", "success");
            onUpdate?.(res.data.conversation);
        } catch (error: any) {
            showStatus(error.response?.data?.message || "Failed to promote", "error");
        }
    };

    const handleDemote = async (targetUserId: string) => {
        if (!user?.id) return;
        try {
            const res = await API.post("/conversation/demoteAdmin", {
                conversationId: chat.conversationId,
                requesterId: user.id,
                userId: targetUserId
            });
            showStatus("Admin rights removed", "success");
            onUpdate?.(res.data.conversation);
        } catch (error: any) {
            showStatus(error.response?.data?.message || "Failed to demote", "error");
        }
    };

    const handleRemoveMember = async (targetUserId: string) => {
        if (!user?.id) return;
        try {
            const res = await API.post("/conversation/removeParticipant", {
                conversationId: chat.conversationId,
                requesterId: user.id,
                userId: targetUserId
            });
            showStatus("Member removed", "success");
            onUpdate?.(res.data.conversation);
        } catch (error: any) {
            showStatus(error.response?.data?.message || "Failed to remove member", "error");
        }
    };

    const handleToggleLock = async () => {
        if (!user?.id) return;
        try {
            setTogglingLock(true);
            const res = await API.post("/conversation/toggleGroupLock", {
                conversationId: chat.conversationId,
                requesterId: user.id
            });
            showStatus(res.data.message, "success");
            onUpdate?.(res.data.conversation);
        } catch (error: any) {
            showStatus(error.response?.data?.message || "Failed to update group lock", "error");
        } finally {
            setTogglingLock(false);
        }
    };

    const openAddMembers = async () => {
        setView("addMembers");
        if (!user?.id) return;
        try {
            setLoadingFriends(true);
            const res = await API.post("/friend/getFriends", { userId: user.id });
            const existingIds = new Set(chat.participants.map((p: any) => p._id));

            const mapped: Friend[] = res.data.friends
                .map((record: any) => {
                    const other = record.requester._id === user.id ? record.recipient : record.requester;
                    return { _id: other._id, username: other.username, profilePicture: other.profilePicture?.url };
                })
                .filter((f: Friend) => !existingIds.has(f._id));

            setFriends(mapped);
        } catch (error) {
            showStatus("Failed to load friends", "error");
        } finally {
            setLoadingFriends(false);
        }
    };

    const toggleSelectFriend = (id: string) => {
        setSelectedToAdd(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleAddSelectedMembers = async () => {
        if (!user?.id || selectedToAdd.size === 0) return;
        try {
            setAddingMembers(true);
            const res = await API.post("/conversation/addParticipants", {
                conversationId: chat.conversationId,
                requesterId: user.id,
                userIds: Array.from(selectedToAdd)
            });
            showStatus("Members added", "success");
            onUpdate?.(res.data.conversation);
            setSelectedToAdd(new Set());
            setView("main");
        } catch (error: any) {
            showStatus(error.response?.data?.message || "Failed to add members", "error");
        } finally {
            setAddingMembers(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-bg/80 backdrop-blur-md p-4">
            <div className="w-full max-w-sm rounded-3xl border border-brand-border bg-brand-surface/60 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center gap-2 px-5 py-4 border-b border-brand-border bg-brand-bg/40 flex-shrink-0">
                    {view !== "main" && (
                        <button onClick={() => setView("main")} className="p-1.5 rounded-lg text-brand-text-muted hover:bg-brand-surface hover:text-brand-text transition-all">
                            <ArrowLeft size={16} />
                        </button>
                    )}
                    <h3 className="text-sm font-bold text-brand-text flex-1">
                        {view === "main" ? (chat.isGroup ? "Group Settings" : "Chat Options") : view === "members" ? "Members" : "Add Members"}
                    </h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-brand-text-muted hover:bg-brand-surface hover:text-brand-text transition-all">
                        <X size={16} />
                    </button>
                </div>

                <div className="overflow-y-auto no-scrollbar flex-1">

                    {view === "main" && (
                        <>
                            {/* Avatar + title */}
                            <div className="flex flex-col items-center gap-2 py-6 border-b border-brand-border/60">
                                <div className="relative h-20 w-20">
                                    <div className="h-20 w-20 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent font-bold text-lg overflow-hidden">
                                        {groupPhotoPreview ? (
                                            <img src={groupPhotoPreview} alt="" className="w-full h-full object-cover" />
                                        ) : chat.profilePicture ? (
                                            <img src={chat.profilePicture} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{chat.avatarLabel}</span>
                                        )}
                                    </div>
                                    {chat.isGroup && isAdmin && (
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingPhoto}
                                            className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-brand-accent text-white flex items-center justify-center shadow-md hover:bg-brand-accent-hover transition-all disabled:opacity-50"
                                        >
                                            <Camera size={13} />
                                        </button>
                                    )}
                                    <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePhotoChange} />
                                </div>
                                <p className="text-sm font-bold text-brand-text">{chat.title}</p>
                                {chat.isGroup ? (
                                    <p className="text-[11px] text-brand-text-muted">{chat.participants.length} members</p>
                                ) : (
                                    chat.otherUserId && (
                                        <p className="text-xs text-brand-text-muted text-center max-w-[240px] px-4">
                                            {chat.participants.find((p: any) => p._id === chat.otherUserId)?.bio || "No bio yet."}
                                        </p>
                                    )
                                )}
                            </div>

                            {/* Actions */}
                            <div className="p-3 space-y-1">
                                {chat.isGroup ? (
                                    <>
                                        <button
                                            onClick={() => setView("members")}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-brand-text hover:bg-brand-surface transition-all"
                                        >
                                            <Users size={15} />
                                            View members
                                            <span className="ml-auto text-brand-text-muted">{chat.participants.length}</span>
                                        </button>

                                        {isAdmin && (
                                            <>
                                                <button
                                                    onClick={openAddMembers}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-brand-text hover:bg-brand-surface transition-all"
                                                >
                                                    <UserPlus size={15} />
                                                    Add members
                                                </button>

                                                <button
                                                    onClick={handleToggleLock}
                                                    disabled={togglingLock}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-brand-text hover:bg-brand-surface transition-all disabled:opacity-50"
                                                >
                                                    {chat.onlyAdminsCanMessage ? <Unlock size={15} /> : <Lock size={15} />}
                                                    {chat.onlyAdminsCanMessage ? "Unlock group (allow everyone to message)" : "Lock group (admins only)"}
                                                </button>
                                            </>
                                        )}

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
                        </>
                    )}

                    {view === "members" && (
                        <div className="p-3 space-y-1">
                            {chat.participants.map((p: any) => {
                                const memberIsAdmin = chat.groupAdmins?.includes(p._id);
                                const isSelf = p._id === user?.id;

                                return (
                                    <div key={p._id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-brand-surface/40 transition-all group">
                                        <div className="h-9 w-9 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-xs font-bold text-brand-text overflow-hidden flex-shrink-0">
                                            {p.profilePicture ? (
                                                <img src={p.profilePicture} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{p.username?.substring(0, 2)}</span>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-semibold text-brand-text truncate">
                                                {p.username}{isSelf ? " (you)" : ""}
                                            </p>
                                            {memberIsAdmin && (
                                                <p className="text-[10px] text-brand-accent font-medium">Admin</p>
                                            )}
                                        </div>

                                        {isAdmin && !isSelf && (
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                                <button
                                                    onClick={() => memberIsAdmin ? handleDemote(p._id) : handlePromote(p._id)}
                                                    title={memberIsAdmin ? "Remove admin" : "Make admin"}
                                                    className="p-1.5 rounded-lg text-brand-text-muted hover:bg-brand-surface hover:text-brand-accent transition-all"
                                                >
                                                    {memberIsAdmin ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveMember(p._id)}
                                                    title="Remove from group"
                                                    className="p-1.5 rounded-lg text-brand-text-muted hover:bg-rose-500/10 hover:text-rose-400 transition-all"
                                                >
                                                    <UserMinus size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {view === "addMembers" && (
                        <div className="flex flex-col h-full">
                            <div className="p-3 space-y-1 flex-1 overflow-y-auto no-scrollbar">
                                {loadingFriends ? (
                                    <p className="text-xs text-brand-text-muted text-center py-8">Loading friends...</p>
                                ) : friends.length === 0 ? (
                                    <p className="text-xs text-brand-text-muted text-center py-8">No friends available to add.</p>
                                ) : (
                                    friends.map((f) => {
                                        const selected = selectedToAdd.has(f._id);
                                        return (
                                            <button
                                                key={f._id}
                                                onClick={() => toggleSelectFriend(f._id)}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                                                    selected ? "bg-brand-accent/10 border border-brand-accent/30" : "hover:bg-brand-surface/40 border border-transparent"
                                                }`}
                                            >
                                                <div className="h-9 w-9 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-xs font-bold text-brand-text overflow-hidden flex-shrink-0">
                                                    {f.profilePicture ? (
                                                        <img src={f.profilePicture} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>{f.username?.substring(0, 2)}</span>
                                                    )}
                                                </div>
                                                <p className="text-xs font-semibold text-brand-text flex-1 text-left truncate">{f.username}</p>
                                                {selected && <span className="h-4 w-4 rounded-full bg-brand-accent flex-shrink-0" />}
                                            </button>
                                        );
                                    })
                                )}
                            </div>

                            {selectedToAdd.size > 0 && (
                                <div className="p-3 border-t border-brand-border/60">
                                    <button
                                        onClick={handleAddSelectedMembers}
                                        disabled={addingMembers}
                                        className="w-full py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white text-xs font-bold transition-all disabled:opacity-50"
                                    >
                                        {addingMembers ? "Adding..." : `Add ${selectedToAdd.size} member${selectedToAdd.size > 1 ? "s" : ""}`}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatSettingsPanel;