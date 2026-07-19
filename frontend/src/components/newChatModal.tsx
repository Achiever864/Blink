import React, { useEffect, useState } from "react";
import { X, Search, MessageCirclePlus, Users, Check } from "lucide-react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

interface ContactUser {
    id: string;
    username: string;
    displayName: string;
    avatarLabel: string;
    profilePicture?: string;
}

interface NewChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStartChat: (userId: string) => Promise<void>;
    onCreateGroup: (roomName: string, participantIds: string[]) => Promise<void>;
}

const NewChatModal: React.FC<NewChatModalProps> = ({
    isOpen,
    onClose,
    onStartChat,
    onCreateGroup,
}) => {
    const { user } = useAuth();

    const [mode, setMode] = useState<"direct" | "group">("direct");
    const [directory, setDirectory] = useState<ContactUser[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);

    // Group-mode only state
    const [groupName, setGroupName] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchFriends = async () => {
            if (!isOpen || !user) return;

            setLoading(true);

            try {
                const response = await API.post("/friend/getFriends", {
                    userId: user.id,
                });

                const friends = response.data.friends.map((friendship: any) => {

                    const friend =
                        friendship.requester._id === user.id
                            ? friendship.recipient
                            : friendship.requester;

                    return {
                        id: friend._id,
                        username: friend.username,
                        displayName: friend.username,
                        profilePicture: friend.profilePicture,
                        avatarLabel: friend.username
                            .substring(0, 2)
                            .toUpperCase(),
                    };
                });

                setDirectory(friends);

            } catch (error) {
                console.error("Unable to fetch friends", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFriends();
    }, [isOpen, user]);

    // Reset group-mode state whenever the modal closes, so re-opening starts fresh
    useEffect(() => {
        if (!isOpen) {
            setMode("direct");
            setGroupName("");
            setSelectedIds(new Set());
            setSearchQuery("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const filteredContacts = directory.filter(
        (contact) =>
            contact.username
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            contact.displayName
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
    );

    const handleSelectContact = async (userId: string) => {
        setIsSubmitting(true);

        try {
            await onStartChat(userId);
            setSearchQuery("");
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleSelected = (userId: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(userId)) {
                next.delete(userId);
            } else {
                next.add(userId);
            }
            return next;
        });
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim() || selectedIds.size < 2) return;

        setIsSubmitting(true);

        try {
            await onCreateGroup(groupName.trim(), Array.from(selectedIds));
            setGroupName("");
            setSelectedIds(new Set());
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            <div
                className="absolute inset-0 bg-brand-bg/60 backdrop-blur-md"
                onClick={onClose}
            />

            <div className="relative z-10 w-full max-w-md bg-brand-surface border border-brand-border rounded-3xl overflow-hidden shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-brand-border">
                    <div>
                        <h3 className="text-white font-black">
                            {mode === "direct" ? "Start New Chat" : "Create Group"}
                        </h3>
                        <p className="text-xs text-brand-text-muted">
                            {mode === "direct"
                                ? "Select one of your friends."
                                : "Pick at least 2 friends and name your group."}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-brand-surface-hover"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Mode toggle */}
                <div className="flex gap-2 p-4 pb-0">
                    <button
                        onClick={() => setMode("direct")}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                            mode === "direct"
                                ? "bg-brand-accent text-white"
                                : "bg-brand-bg text-brand-text-muted border border-brand-border"
                        }`}
                    >
                        Direct
                    </button>
                    <button
                        onClick={() => setMode("group")}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                            mode === "group"
                                ? "bg-brand-accent text-white"
                                : "bg-brand-bg text-brand-text-muted border border-brand-border"
                        }`}
                    >
                        <Users size={12} />
                        Group
                    </button>
                </div>

                {/* Group name input, only shown in group mode */}
                {mode === "group" && (
                    <div className="p-4 pb-0">
                        <input
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="Group name..."
                            className="w-full rounded-xl bg-brand-bg border border-brand-border py-3 px-4 text-sm outline-none focus:border-brand-accent/40"
                        />
                    </div>
                )}

                {/* Search */}
                <div className="p-4 border-b border-brand-border">
                    <div className="relative">
                        <Search
                            size={15}
                            className="absolute left-3 top-3 text-brand-text-muted"
                        />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search friend..."
                            className="w-full rounded-xl bg-brand-bg border border-brand-border py-3 pl-10 pr-3 text-sm outline-none"
                        />
                    </div>
                </div>

                {/* Friends */}
                <div className="max-h-[360px] overflow-y-auto p-3 space-y-2">
                    {loading ? (
                        <div className="text-center py-10 text-brand-text-muted text-sm">
                            Loading friends...
                        </div>
                    ) : filteredContacts.length === 0 ? (
                        <div className="text-center py-10 text-brand-text-muted text-sm">
                            No friends found.
                        </div>
                    ) : (
                        filteredContacts.map((contact) => (
                            <div
                                key={contact.id}
                                onClick={() => mode === "group" && toggleSelected(contact.id)}
                                className={`flex items-center justify-between rounded-xl p-3 transition ${
                                    mode === "group" ? "cursor-pointer" : ""
                                } ${
                                    mode === "group" && selectedIds.has(contact.id)
                                        ? "bg-brand-accent/10 border border-brand-accent/30"
                                        : "hover:bg-brand-surface-hover border border-transparent"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    {contact.profilePicture ? (
                                        <img
                                            src={contact.profilePicture}
                                            className="w-10 h-10 rounded-xl object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-xl bg-brand-accent flex items-center justify-center font-bold uppercase">
                                            {contact.avatarLabel}
                                        </div>
                                    )}

                                    <div>
                                        <h4 className="text-sm font-semibold">
                                            {contact.displayName}
                                        </h4>
                                        <p className="text-xs text-brand-text-muted">
                                            {contact.username}
                                        </p>
                                    </div>
                                </div>

                                {mode === "direct" ? (
                                    <button
                                        disabled={isSubmitting}
                                        onClick={() => handleSelectContact(contact.id)}
                                        className="p-2 rounded-lg bg-brand-accent hover:bg-brand-accent-hover disabled:opacity-40"
                                    >
                                        <MessageCirclePlus size={14} />
                                    </button>
                                ) : (
                                    <div className={`h-5 w-5 rounded-md flex items-center justify-center border transition-all ${
                                        selectedIds.has(contact.id)
                                            ? "bg-brand-accent border-violet-600"
                                            : "border-brand-border"
                                    }`}>
                                        {selectedIds.has(contact.id) && <Check size={12} className="text-white" />}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Group create button — only in group mode */}
                {mode === "group" && (
                    <div className="p-4 border-t border-brand-border">
                        <button
                            disabled={isSubmitting || !groupName.trim() || selectedIds.size < 2}
                            onClick={handleCreateGroup}
                            className="w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accent-hover disabled:opacity-30 disabled:cursor-not-allowed font-bold text-sm transition-all"
                        >
                            Create Group ({selectedIds.size} selected)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewChatModal;