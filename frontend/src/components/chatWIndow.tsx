import React, { useState, useRef, useMemo, useEffect } from "react";
import {
    Send, Smile, ChevronDown, Camera, Mic2, Paperclip, MessageSquarePlus, X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useStatus } from "../context/StatusBarContext";
import API from "../api/axios";
import socket from "../socket";
import { MediaCaptureControl } from "./MediaCaptureControl";
import MessageBubble from "./MessageBubble";
import EmojiPicker from "emoji-picker-react";
import {
    type Conversation, type Message, type Attachment,
    getSenderId, getSenderName
} from "../types/chat";

interface ChatWindowProps {
    activeChat: Conversation | null;
    onOpenSettings: () => void;
    onStartNewChat: () => void;
}

const formatLastSeen = (lastSeen?: string) => {
    if (!lastSeen) return "Offline";
    const diffMs = Date.now() - new Date(lastSeen).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Last seen just now";
    if (diffMins < 60) return `Last seen ${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Last seen ${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `Last seen ${diffDays}d ago`;
};

const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const ChatWindow: React.FC<ChatWindowProps> = ({ activeChat, onOpenSettings, onStartNewChat }) => {
    const { user } = useAuth();
    const { showStatus } = useStatus();

    const [messages, setMessages] = useState<Message[]>([]);
    const [typedMessage, setTypedMessage] = useState("");
    const [sendingMessage, setSendingMessage] = useState(false);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const mediaInputRef = useRef<HTMLInputElement>(null);
    const [cameraActive, setCameraActive] = useState(false);

    const mediaPreviewUrl = useMemo(() => {
        if (!mediaFile) return null;
        return URL.createObjectURL(mediaFile);
    }, [mediaFile]);

    useEffect(() => {
        return () => {
            if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl);
        };
    }, [mediaPreviewUrl]);

    const handleMediaDispatched = (_file: File, _type: "image" | "video") => {
        setCameraActive(false);
    };

    // Fetch messages + join the socket room whenever the active chat changes
    useEffect(() => {
        if (!activeChat) {
            setMessages([]);
            return;
        }

        socket.emit("join_chat", activeChat.conversationId);

        const fetchMessages = async () => {
            try {
                const res = await API.post("/conversation/getMessages", {
                    conversationId: activeChat.conversationId
                });
                setMessages(res.data.messages);
            } catch (error) {
                console.log(error);
            }
        };

        fetchMessages();
    }, [activeChat?.conversationId]);

    // Live incoming messages, scoped to whichever chat is currently open
    useEffect(() => {
        if (!activeChat || !user?.id) return;

        const handleNewMessage = (message: Message) => {
            if (message.chatId !== activeChat.conversationId) return;
            setMessages(prev => {
                if (getSenderId(message.sender) === user.id) return prev;
                if (prev.some(msg => msg._id === message._id)) return prev;
                return [...prev, message];
            });
        };

        socket.on("new-message", handleNewMessage);
        return () => {
            socket.off("new-message", handleNewMessage);
        };
    }, [activeChat?.conversationId, user?.id]);

    const shouldAutoScroll = () => {
        const el = chatContainerRef.current;
        if (!el) return true;
        const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
        return distance < 150;
    };

    const scrollToBottom = (smooth = true) => {
        bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    };

    useEffect(() => {
        if (shouldAutoScroll()) scrollToBottom();
    }, [messages]);

    const handleScroll = () => {
        const el = chatContainerRef.current;
        if (!el) return;
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        setShowScrollButton(distanceFromBottom > 250);
    };

    const handleReply = (msg: Message) => {
        setReplyingTo(msg);
        inputRef.current?.focus();
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setRecordingDuration(0);
            setIsRecording(true);

            recordingIntervalRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        } catch (error) {
            showStatus(`Microphone error: ${error}`, "error");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.onstop = null;
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        setAudioBlob(null);
        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeChat) return;
        if (!typedMessage.trim() && !audioBlob && !mediaFile) return;

        const tempId = `temp-${Date.now()}`;
        const textToSend = typedMessage;
        const attachmentBlob = audioBlob;
        const attachmentFile = mediaFile;
        const replyToSend = replyingTo;

        let optimisticAttachment: Attachment | null = null;

        if (attachmentBlob) {
            optimisticAttachment = {
                type: "audio",
                url: URL.createObjectURL(attachmentBlob),
                publicId: ""
            };
        } else if (attachmentFile) {
            optimisticAttachment = {
                type: attachmentFile.type.startsWith("video") ? "video" : "image",
                url: URL.createObjectURL(attachmentFile),
                publicId: "",
                fileName: attachmentFile.name,
                mimeType: attachmentFile.type
            };
        }

        const optimisticMessage: Message = {
            _id: tempId,
            replyTo: replyToSend,
            chatId: activeChat.conversationId,
            sender: {
                _id: user?.id || "",
                username: user?.username || "You",
                profilePicture: user?.profilePicture
            },
            text: textToSend,
            attachment: optimisticAttachment,
            deliveredTo: [],
            readBy: [],
            reactions: [],
            isEdited: false,
            isDeleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: "sending"
        };
        setMessages(prev => [...prev, optimisticMessage]);

        setTypedMessage("");
        setAudioBlob(null);
        setSendingMessage(true);

        try {
            const formData = new FormData();
            formData.append("chatId", activeChat.conversationId);
            formData.append("sender", user?.id || "");
            formData.append("text", textToSend);
            if (replyToSend) formData.append("replyTo", replyToSend._id);

            if (attachmentBlob) {
                const audioFile = new File([attachmentBlob], "voice-message.webm", { type: "audio/webm" });
                formData.append("media", audioFile);
            } else if (attachmentFile) {
                formData.append("media", attachmentFile);
            }

            const res = await API.post("/message/send", formData);
            const realMessage: Message = res.data.newMessage;

            setMessages(prev =>
                prev.map(msg => msg._id === tempId ? { ...realMessage, status: "sent" } : msg)
            );

            setMediaFile(null);
        } catch (error: any) {
            console.log(error.response?.data || error.message);
            setMessages(prev =>
                prev.map(msg => msg._id === tempId ? { ...msg, status: "failed" } : msg)
            );
        } finally {
            setSendingMessage(false);
            setReplyingTo(null);
        }
    };

    if (!activeChat) {
        return (
            <section className="flex flex-col h-full pl-6 overflow-hidden relative">
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
                    <div className="h-24 w-24 rounded-3xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center">
                        <MessageSquarePlus size={40} className="text-violet-400" />
                    </div>
                    <div className="space-y-1.5">
                        <h3 className="text-base font-bold text-slate-200">Your messages live here</h3>
                        <p className="text-xs text-slate-500 max-w-xs">
                            Pick a conversation from the left, or start a new chat with a friend to begin.
                        </p>
                    </div>
                    <button
                        onClick={onStartNewChat}
                        className="mt-2 px-5 py-2.5 rounded-xl bg-violet-600/10 hover:bg-violet-600 border border-violet-500/20 text-violet-400 hover:text-white text-xs font-bold flex items-center gap-2 transition-all"
                    >
                        <MessageSquarePlus size={15} />
                        <span>Start a new chat</span>
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="flex flex-col h-full pl-6 overflow-hidden relative">

            <button
                type="button"
                onClick={onOpenSettings}
                className="pb-4 border-b border-slate-900/60 flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
            >
                <div className="h-8 w-8 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 text-xs font-bold flex-shrink-0">
                    {activeChat.profilePicture ? (
                        <img src={activeChat.profilePicture} alt="image" className="w-full h-full object-cover" />
                    ) : (
                        <span>{activeChat.avatarLabel}</span>
                    )}
                </div>
                <div>
                    <h3 className="text-xs font-bold text-slate-200">{activeChat.title}</h3>
                    {!activeChat.isGroup && (
                        <p className={`text-[10px] flex items-center gap-1 mt-0.5 font-medium ${
                            activeChat.online ? "text-emerald-400" : "text-slate-500"
                        }`}>
                            <span className={`h-1 w-1 rounded-full ${
                                activeChat.online ? "bg-emerald-400 animate-pulse" : "bg-slate-600"
                            }`} />
                            {activeChat.online ? "Online" : formatLastSeen(activeChat.lastSeen)}
                        </p>
                    )}
                </div>
            </button>

            <div
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto no-scrollbar py-6 space-y-4 pr-1"
            >
                {messages.map((msg) => (
                    <MessageBubble
                        key={msg._id}
                        msg={msg}
                        isMe={getSenderId(msg.sender) === user?.id}
                        isGroup={activeChat.isGroup}
                        onReply={handleReply}
                        participants={activeChat.participants || []}
                    />
                ))}
                <div ref={bottomRef} />
            </div>

            {showScrollButton && (
                <button
                    onClick={() => scrollToBottom()}
                    className="absolute bottom-24 right-6 h-11 w-11 rounded-full bg-violet-600 hover:bg-violet-500 shadow-lg flex items-center justify-center transition-all"
                >
                    <ChevronDown size={20} />
                </button>
            )}

            {mediaFile && mediaPreviewUrl && (
                <div className="px-4 pb-2">
                    <div className="relative inline-block rounded-xl overflow-hidden border border-slate-800">
                        {mediaFile.type.startsWith("video") ? (
                            <video src={mediaPreviewUrl} className="h-24 w-24 object-cover" muted />
                        ) : (
                            <img src={mediaPreviewUrl} alt="preview" className="h-24 w-24 object-cover" />
                        )}
                        <button
                            type="button"
                            onClick={() => setMediaFile(null)}
                            className="absolute top-1 right-1 h-5 w-5 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors"
                        >
                            <X size={12} />
                        </button>
                    </div>
                </div>
            )}

            {replyingTo && (
                <div className="px-4 pb-2 flex items-center gap-2">
                    <div className="flex-1 rounded-xl border-l-2 border-violet-500 bg-slate-900/40 px-3 py-2">
                        <p className="text-[10px] text-violet-400 font-semibold">
                            Replying to {getSenderName(replyingTo.sender) || "message"}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{replyingTo.text}</p>
                    </div>
                    <button type="button" onClick={() => setReplyingTo(null)} className="text-slate-500 hover:text-slate-300">
                        <X size={14} />
                    </button>
                </div>
            )}

            <form onSubmit={handleSendMessage} className="pt-4 border-t border-slate-900/60 bg-slate-950">
                <div className="relative flex items-center rounded-2xl border border-slate-900/60 bg-slate-950">
                    {isRecording ? (
                        <div className="w-full flex items-center gap-3 py-2.5 pl-4 pr-14">
                            <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-xs font-semibold text-red-400">Recording...</span>
                            <span className="text-xs text-slate-500 font-mono">{formatDuration(recordingDuration)}</span>
                            <button
                                type="button"
                                onClick={cancelRecording}
                                className="ml-auto text-[10px] text-slate-500 hover:text-slate-300 font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <>
                            <button
                                type="button"
                                className="ml-3 p-2 rounded-xl text-slate-400 hover:bg-slate-800"
                                onClick={() => mediaInputRef.current?.click()}
                            >
                                <Paperclip size={20} />
                            </button>
                            <input
                                type="file"
                                ref={mediaInputRef}
                                accept="image/*, video/*"
                                hidden
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) setMediaFile(file);
                                }}
                            />

                            <div className="py-2 relative">
                                <button
                                    type="button"
                                    onClick={() => setCameraActive(true)}
                                    className=" p-2 rounded-xl text-slate-400 hover:bg-slate-800"
                                >
                                    <Camera size={20} />
                                </button>

                                {cameraActive && (
                                    <MediaCaptureControl
                                        onCaptureComplete={handleMediaDispatched}
                                        onClose={() => setCameraActive(false)}
                                    />
                                )}
                            </div>

                            <button
                                type="button"
                                className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 relative"
                                onClick={() => setShowEmojiPicker(prev => !prev)}
                            >
                                <Smile size={20} />
                            </button>

                            {showEmojiPicker && (
                                <div className="absolute bottom-14 right-0 z-20">
                                    <EmojiPicker
                                        onEmojiClick={(emoji) =>
                                            setTypedMessage(prev => prev + emoji.emoji)
                                        }
                                    />
                                </div>
                            )}

                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Type a message..."
                                className="w-full bg-transparent py-2.5 pl-4 pr-14 text-xs text-slate-200 outline-none placeholder-slate-600"
                                value={typedMessage}
                                onChange={(e) => setTypedMessage(e.target.value)}
                            />
                        </>
                    )}

                    {typedMessage.trim() || audioBlob || mediaFile ? (
                        <button
                            type="submit"
                            disabled={sendingMessage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md shadow-violet-600/20 transition-all hover:scale-[1.05] active:scale-[0.95] disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed"
                        >
                            <Send size={12} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-md transition-all hover:scale-[1.05] active:scale-[0.95] ${
                                isRecording ? "bg-red-500 shadow-red-500/20 animate-pulse" : "bg-violet-600 shadow-violet-600/20"
                            }`}
                        >
                            <Mic2 size={16} />
                        </button>
                    )}
                </div>
            </form>
        </section>
    );
};

export default ChatWindow;