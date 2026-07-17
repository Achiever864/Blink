import type { ReactNode } from "react";

export interface Participant {
    _id: string;
    username: string;
    profilePicture?: string;
}

export interface Attachment {
    type: "image" | "video" | "audio" | "file";
    url: string;
    publicId: string;
    fileName?: string;
    mimeType?: string;
    size?: number;
    duration?: number;
}

export interface Conversation {
    conversationId: string;
    isGroup: boolean;
    title: string;
    profilePicture?: string;
    avatarLabel: string | ReactNode;
    participants: Participant[];
    otherUserId?: string;
    latestMessage?: Message;
    updatedAt: string;
    online?: boolean;
    lastSeen?: string;
    unread?: boolean;
}

export interface Message {
    _id: string;
    chatId: string;
    sender: string | {
        _id: string;
        username: string;
        profilePicture?: string;
    };
    text: string;
    attachment?: Attachment | null;
    replyTo?: Message | null;
    deliveredTo: string[];
    readBy: string[];
    reactions: { user: string; emoji: string }[];
    isEdited: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    status?: "sending" | "sent" | "failed";
}

export const getSenderId = (sender: Message["sender"]) =>
    typeof sender === "string" ? sender : sender?._id;

export const getSenderName = (sender: Message["sender"]) =>
    typeof sender === "string" ? "them" : sender?.username;