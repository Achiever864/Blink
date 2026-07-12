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

interface Message {
    _id: string;
    chatId: string;
    sender: string | {
        _id: string;
        username: string;
        profilePicture?: { url: string; publicId: string } | "";
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
    onReply: (msg: Message) => void;
}

const DRAG_THRESHOLD = 50; // px of drag before releasing counts as "swipe to reply"
const MAX_DRAG = 80; // px cap so the bubble can't be dragged off-screen

// sender can be a raw id string (fresh optimistic sends) or a populated object (fetched/socket messages)
const getSenderName = (sender: Message["sender"]) =>
    typeof sender === "string" ? "Unknown" : sender?.username || "Unknown";

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

const MessageBubble: React.FC<MessageBubbleProps> = ({ msg, isMe, isGroup, onReply }) => {
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
        // Only allow dragging rightward (positive delta), clamp at MAX_DRAG
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
            {/* Reply icon revealed behind the bubble as it's dragged */}
            <div
                className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 rounded-full bg-violet-600/20 transition-opacity"
                style={{ opacity: replyProgress }}
            >
                <CornerUpLeft size={14} className="text-violet-400" />
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
                    touchAction: "pan-y" // allow vertical scroll, we handle horizontal ourselves
                }}
                className={`flex flex-col cursor-grab active:cursor-grabbing ${isMe ? "items-end" : "items-start"}`}
            >
                {/* Sender name — only shown in group chats, and never for your own messages */}
                {isGroup && !isMe && (
                    <span className="text-[10px] font-bold text-violet-400 mb-0.5 px-1">
                        {getSenderName(msg.sender)}
                    </span>
                )}

                <div className={`max-w-[70%] rounded-2xl px-4 py-3 text-xs leading-relaxed transition-all ${
                    isMe
                        ? "bg-violet-600 text-white rounded-tr-none font-medium shadow-md shadow-violet-600/10"
                        : "bg-slate-900/60 border border-slate-900 text-slate-300 rounded-tl-none"
                }`}>
                    <div className="whitespace-pre-wrap">
                        {/* Quoted reply preview, if this message is replying to another */}
                        {msg.replyTo && (
                            <div className={`mb-2 pl-2 border-l-2 rounded-r-md py-1 px-2 ${
                                isMe ? "border-white/40 bg-white/10" : "border-violet-500/50 bg-slate-950/40"
                            }`}>
                                <p className={`text-[10px] font-bold ${isMe ? "text-white/80" : "text-violet-400"}`}>
                                    {getSenderName(msg.replyTo.sender)}
                                </p>
                                <p className={`text-[10px] truncate ${isMe ? "text-white/60" : "text-slate-500"}`}>
                                    {msg.replyTo.text || attachmentPreviewLabel(msg.replyTo.attachment)}
                                </p>
                            </div>
                        )}

                        {msg.isDeleted && (
                            <p className="italic text-slate-500">
                                ∅ This message was deleted.
                            </p>
                        )}

                        {msg.text && (
                            <p>
                                {msg.text}
                                {msg.isEdited && (
                                    <span className="ml-2 text-[10px]">edited</span>
                                )}
                            </p>
                        )}

                        {msg.attachment?.type === "image" && (
                            <div className="mt-2 rounded-xl overflow-hidden max-w-xs bg-slate-800/50">
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
                                className="text-violet-400 underline"
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

                <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-600 px-1 font-medium">
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    {isMe && msg.status === "sending" && (
                        <span className="text-slate-500 italic">Sending...</span>
                    )}
                    {isMe && msg.status === "failed" && (
                        <span className="text-red-400 font-semibold">Failed to send</span>
                    )}
                    {isMe && (msg.status === "sent" || !msg.status) && (
                        <CheckCheck size={11} className="text-violet-400" />
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;