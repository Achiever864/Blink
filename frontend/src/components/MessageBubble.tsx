import React, { useRef, useState } from "react";
import { CheckCheck, CornerUpLeft } from "lucide-react";
import AudioMessagePlayer from "./AudioMessagePlayer";

interface Attachment {
    type: "image" | "video" | "audio" | "file";
    url: string;
    publicId: string;
    fileName?: string;
    mimeType?: string;
    size?: number;
    duration?: number;
}

interface Participant {
    _id: string;
    username: string;
    profilePicture?: string;
}

interface Message {
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

interface MessageBubbleProps {
    msg: Message;
    isMe: boolean;
    isGroup: boolean;
    participants: Participant[];
    onReply: (msg: Message) => void;
}

const DRAG_THRESHOLD = 50; // px of drag before releasing counts as "swipe to reply"
const MAX_DRAG = 80; // px cap so the bubble can't be dragged off-screen

// sender can be a raw id string (unpopulated reference, common on nested replyTo.sender)
// or a populated object (top-level sender, fresh optimistic sends). When it's a raw
// string, fall back to resolving it against the conversation's known participants,
// since the backend doesn't currently nest-populate replyTo.sender.
const getSenderName = (sender: Message["sender"], participants: Participant[]) => {
    if (typeof sender !== "string") return sender?.username || "Unknown";
    const match = participants.find((p) => p._id === sender);
    return match?.username || "Unknown";
};

const attachmentPreviewLabel = (attachment?: Attachment | null) => {
    if (!attachment) return null;
    switch (attachment.type) {
        case "image": return "📷 Photo";
        case "video": return "🎥 Video";
        case "audio": return "🎤 Voice message";
        case "file": return `📎 ${attachment.fileName || "File"}`;
        default: return null;
    }
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ msg, isMe, isGroup, participants, onReply }) => {
    const [dragX, setDragX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const startXRef = useRef(0);
    const rowRef = useRef<HTMLDivElement>(null);

    const handlePointerDown = (e: React.PointerEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest("button, audio, video, a, input")){
            return;
        }

        startXRef.current = e.clientX;
        setIsDragging(true);
        rowRef.current?.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;

        const delta = e.clientX - startXRef.current;
        const clamped = Math.min(Math.max(delta, 0), MAX_DRAG);
        setDragX(clamped);
    };

    const handlePointerUp = () => {
        if (isDragging && dragX >= DRAG_THRESHOLD) {
            onReply(msg);
        }
        setIsDragging(false);
        setDragX(0);
    };

    const replyProgress = Math.min(dragX / DRAG_THRESHOLD, 1);

    return (
        <div className="relative">
            <div
                className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 rounded-full bg-brand-accent/20 transition-opacity"
                style={{ opacity: replyProgress }}
            >
                <CornerUpLeft size={14} className="text-brand-accent" />
            </div>

            <div
                ref={rowRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                style={{
                    transform: `translateX(${dragX}px)`,
                    transition: isDragging ? "none" : "transform 0.2s ease-out",
                    touchAction: "pan-y"
                }}
                className={`flex flex-col cursor-grab active:cursor-grabbing ${isMe ? "items-end" : "items-start"}`}
            >
                {isGroup && !isMe && (
                    <span className="text-[10px] font-bold text-brand-accent mb-0.5 px-1">
                        {getSenderName(msg.sender, participants)}
                    </span>
                )}

                <div className={`max-w-[70%] rounded-2xl px-4 py-3 text-xs leading-relaxed transition-all ${
                    isMe
                        ? "bg-brand-accent text-white rounded-tr-none font-medium shadow-md shadow-brand-accent/10"
                        : "bg-brand-surface/60 border border-brand-border text-brand-text rounded-tl-none"
                }`}>
                    <div className="whitespace-pre-wrap">
                        {msg.replyTo && (
                            <div className={`mb-2 pl-2 border-l-2 rounded-r-md py-1 px-2 ${
                                isMe ? "border-white/40 bg-white/10" : "border-brand-accent/50 bg-brand-bg/40"
                            }`}>
                                <p className={`text-[10px] font-bold ${isMe ? "text-white/80" : "text-brand-accent"}`}>
                                    {getSenderName(msg.replyTo.sender, participants)}
                                </p>
                                <p className={`text-[10px] truncate ${isMe ? "text-white/60" : "text-brand-text-muted"}`}>
                                    {msg.replyTo.text || attachmentPreviewLabel(msg.replyTo.attachment)}
                                </p>
                            </div>
                        )}

                        {msg.isDeleted && (
                            <p className="italic text-brand-text-muted">
                                ∅ This message was deleted.
                            </p>
                        )}

                        {msg.text && (
                            <p className="break-words">
                                {msg.text}
                                {msg.isEdited && (
                                    <span className="ml-2 text-[10px]">edited</span>
                                )}
                            </p>
                        )}

                        {msg.attachment?.type === "image" && (
                            <div className="mt-2 rounded-xl overflow-hidden max-w-xs bg-brand-surface-hover/50">
                                <img
                                    src={msg.attachment.url}
                                    alt=""
                                    loading="lazy"
                                    className="w-full max-h-[320px] object-cover transition duration-300 hover:scale-[1.02] hover:brightness-95 cursor-pointer"
                                    onClick={() => window.open(msg.attachment?.url, "_blank")}
                                />
                            </div>
                        )}

                        {msg.attachment?.type === "video" && (
                            <video
                                src={msg.attachment?.url}
                                controls
                                playsInline
                                preload="metadata"
                                className="rounded-xl mt-2 max-w-xs max-h-[320px] w-full object-cover bg-black"
                            />
                        )}

                        {msg.attachment?.type === "audio" && (
                            <AudioMessagePlayer url={msg.attachment.url} isMe={isMe} />
                        )}

                        {msg.attachment?.type === "file" && (
                            <a
                                href={msg.attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-brand-accent underline"
                            >
                                {msg.attachment?.fileName}
                            </a>
                        )}

                        <div className="flex gap-1">
                            {msg.reactions?.map(r => (
                                <span key={r.user}>{r.emoji}</span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1 mt-1 text-[9px] text-brand-text-muted px-1 font-medium">
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    {isMe && msg.status === "sending" && (
                        <span className="text-brand-text-muted italic">Sending...</span>
                    )}
                    {isMe && msg.status === "failed" && (
                        <span className="text-red-400 font-semibold">Failed to send</span>
                    )}
                    {isMe && (msg.status === "sent" || !msg.status) && (
                        <CheckCheck size={11} className="text-brand-accent" />
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;