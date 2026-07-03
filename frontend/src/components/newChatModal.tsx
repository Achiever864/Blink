import React, { useEffect, useState } from "react";
import { X, Search, MessageCirclePlus } from "lucide-react";
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
}

const NewChatModal: React.FC<NewChatModalProps> = ({
    isOpen,
    onClose,
    onStartChat,
}) => {
    const { user } = useAuth();

    const [directory, setDirectory] = useState<ContactUser[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            <div
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                onClick={onClose}
            />

            <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">

                {/* Header */}

                <div className="flex items-center justify-between p-5 border-b border-slate-800">

                    <div>

                        <h3 className="text-white font-black">
                            Start New Chat
                        </h3>

                        <p className="text-xs text-slate-500">
                            Select one of your friends.
                        </p>

                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-slate-800"
                    >
                        <X size={16} />
                    </button>

                </div>

                {/* Search */}

                <div className="p-4 border-b border-slate-800">

                    <div className="relative">

                        <Search
                            size={15}
                            className="absolute left-3 top-3 text-slate-500"
                        />

                        <input
                            value={searchQuery}
                            onChange={(e) =>
                                setSearchQuery(e.target.value)
                            }
                            placeholder="Search friend..."
                            className="w-full rounded-xl bg-slate-950 border border-slate-800 py-3 pl-10 pr-3 text-sm outline-none"
                        />

                    </div>

                </div>

                {/* Friends */}

                <div className="max-h-[420px] overflow-y-auto p-3 space-y-2">

                    {loading ? (

                        <div className="text-center py-10 text-slate-500 text-sm">
                            Loading friends...
                        </div>

                    ) : filteredContacts.length === 0 ? (

                        <div className="text-center py-10 text-slate-500 text-sm">
                            No friends found.
                        </div>

                    ) : (

                        filteredContacts.map((contact) => (

                            <div
                                key={contact.id}
                                className="flex items-center justify-between rounded-xl p-3 hover:bg-slate-800 transition"
                            >

                                <div className="flex items-center gap-3">

                                    {contact.profilePicture ? (

                                        <img
                                            src={contact.profilePicture}
                                            className="w-10 h-10 rounded-xl object-cover"
                                        />

                                    ) : (

                                        <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center font-bold uppercase">
                                            {contact.avatarLabel}
                                        </div>

                                    )}

                                    <div>

                                        <h4 className="text-sm font-semibold">
                                            {contact.displayName}
                                        </h4>

                                        <p className="text-xs text-slate-500">
                                            @{contact.username}
                                        </p>

                                    </div>

                                </div>

                                <button
                                    disabled={isSubmitting}
                                    onClick={() =>
                                        handleSelectContact(contact.id)
                                    }
                                    className="p-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40"
                                >
                                    <MessageCirclePlus size={14} />
                                </button>

                            </div>

                        ))

                    )}

                </div>

            </div>

        </div>
    );
};

export default NewChatModal;