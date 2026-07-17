import React, { useState, useRef, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import 
    { Send, Smile, ChevronDown, Camera, Search, Mic2, Paperclip, MessageSquarePlus, X }
    from "lucide-react";
import Sidebar from "../components/sideBar";
import API from "../api/axios";
import { useEffect } from "react";
import { useStatus } from "../context/StatusBarContext";
import NewChatModal from "../components/newChatModal";
import socket from "../socket";
import {MediaCaptureControl} from "../components/MediaCaptureControl";
import MessageBubble from "../components/MessageBubble";
import EmojiPicker from "emoji-picker-react";

interface Participant {
    _id: string;
    username: string;
    profilePicture?: string;
}

interface Attachment {
    type: "image" | "video" | "audio" | "file";
    url: string;
    publicId: string;
    fileName?: string;
    mimeType?: string;
    size?: number;
    duration?: number;
}

interface Conversation {
    conversationId: string;
    isGroup: boolean;
    title: string;
    profilePicture?: string;
    avatarLabel: string | React.ReactNode;
    participants: Participant[];
    otherUserId?: string;
    latestMessage?: Message;
    updatedAt: string;
    online?: boolean;
    lastSeen?: string;
    unread?: boolean;
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
    reactions: {
        user: string;
        emoji: string;
    }[];
    isEdited: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    status?: "sending" | "sent" | "failed";
}

const MessagePage: React.FC = () => {
    const { user } = useAuth();
    const { showStatus } = useStatus();
    const [activeChat, setActiveChat] = useState<Conversation | null>(null);
    const [typedMessage, setTypedMessage] = useState<string>("");
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [ showScrollButton, setShowScrollButton ] = useState(false);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    
    //audio handling
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    //media handling
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const mediaInputRef = useRef<HTMLInputElement>(null);

    const [cameraActive, setCameraActive] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleMediaDispatched = (file: File, type: "image" | "video") => {
        const dataNode = new FormData();
        dataNode.append("file", file);
        dataNode.append("resource_type", type);
        setCameraActive(false);
    }

    const getSenderId = (sender: Message["sender"]) =>
        typeof sender === "string" ? sender : sender?._id;

    const getSenderName = (sender: Message["sender"]) =>
        typeof sender === "string" ? "them" : sender?.username;

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

    const mediaPreviewUrl = useMemo(() => {
        if (!mediaFile) return null;
        return URL.createObjectURL(mediaFile);
    }, [mediaFile]);

    useEffect(() =>{
        return () => {
            if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl);
        }
    }, [mediaPreviewUrl]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });

            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0){
                    audioChunksRef.current.push(event.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(
                    audioChunksRef.current,
                    {
                        type: "audio/webm"
                    }
                );
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start()
            setRecordingDuration(0);
            setIsRecording(true);

            recordingIntervalRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);

        } catch(error){
            showStatus(`Microphone error: ${error}`, "error");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current){
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        };

        if (recordingIntervalRef.current){
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
        };
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive"){
            mediaRecorderRef.current.onstop = null;
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        setAudioBlob(null);
        if (recordingIntervalRef.current){
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor (seconds/60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    }

    const handleScroll = () => {
        const el = chatContainerRef.current;
        if (!el) return;
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        setShowScrollButton(distanceFromBottom > 250);
    }

    const shouldAutoScroll = () => {
        const el = chatContainerRef.current;
        if (!el) return true;
        const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
        return distance < 150;
    };

    const handleStartNewChat = async(targetUserId: string) => {
        try {
            await API.post("/conversation/create", {
                isGroupChat: false,
                participants: [
                    targetUserId,
                    user!.id
                ]
            });
            fetchConversation()
        } catch (error) {
            console.error("Failed to initialize conversation:", error);
            throw error;
        }
    };

    const handleReply = (msg: Message) => {
        setReplyingTo(msg);
        inputRef.current?.focus();
    }

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
    }

    // Fetch the current online/lastSeen snapshot for a single user
    const fetchOnlineStatus = async (userId: string) => {
        try {
            const res = await API.get(`/user/getOnlineStatus/${userId}`);
            return { online: res.data.isOnline as boolean, lastSeen: res.data.lastSeen as string };
        } catch {
            return { online: false, lastSeen: undefined };
        }
    };

    const fetchConversation = async () => {
        if(!user?.id) return;

        try {
            const res = await API.post("/conversation/getConversation", {
                userId: user?.id
            })

            const mapped = res.data.conversation.map((converse: any) => {
                const otherUser = converse.participant.find(
                    (p: any) => p._id !== user?.id
                );

                const chatTitle = converse.isGroupChat
                    ? (converse.roomName || "Untitled Group")
                    : `${otherUser?.username || "deleted_user"}`;

                const avatar = converse.isGroupChat
                        ? (converse.groupvatar?.url ? <img src={converse.groupvatar.url} alt="image" className="w-full h-full object-cover rounded-xl" /> : chatTitle.substring(0,2))
                        : (otherUser.profilePicture ? <img src={otherUser?.profilePicture?.url} alt="image" className="w-full h-full object-cover rounded-xl" /> : otherUser?.username.substring(0,2));

                return {
                    conversationId: converse._id,
                    isGroup: converse.isGroupChat,
                    title: chatTitle,
                    avatarLabel: avatar,
                    participants: converse.participant,
                    otherUserId: converse.isGroupChat ? undefined : otherUser?._id,
                    profilePicture:
                        converse.isGroupChat
                            ? ""
                            : otherUser?.profilePicture?.url || "",
                    latestMessage: converse.latestMessage || null,
                    updatedAt: converse.updatedAt
                };
            });

            // Attach live online/lastSeen for each direct (non-group) chat
            const withStatus: Conversation[] = await Promise.all(
                mapped.map(async (chat: Conversation) => {
                    if (chat.isGroup || !chat.otherUserId) return chat;
                    const status = await fetchOnlineStatus(chat.otherUserId);
                    return { ...chat, online: status.online, lastSeen: status.lastSeen };
                })
            );

            setConversations(withStatus);

            // Keep the currently open chat's header in sync too
            setActiveChat(prev => {
                if (!prev) return prev;
                const updated = withStatus.find(c => c.conversationId === prev.conversationId);
                return updated || prev;
            });
        } catch (error) {
            console.log(error);
        }
    };

   const handleSendMessage = async (
    e: React.FormEvent
) => {
    e.preventDefault();

    if (!activeChat) return;

    if (!typedMessage.trim() && !audioBlob && !mediaFile) return;

    const tempId = `temp-${Date.now()}`;
    const textToSend = typedMessage;
    const attachmentBlob = audioBlob;
    const attachmentFile = mediaFile;
    const replyToSend = replyingTo;

    let optimisticAttachment: Attachment | null = null;
    
    if (attachmentBlob){
        optimisticAttachment = {
            type: "audio",
            url: URL.createObjectURL(attachmentBlob),
            publicId: ""
        };
    } else if (attachmentFile){
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
    setMessages(prev =>[...prev, optimisticMessage]);

    setTypedMessage("");
    setAudioBlob(null);
    setSendingMessage(true);

    try {
        const formData = new FormData();
        formData.append("chatId", activeChat.conversationId);
        formData.append("sender", user?.id || "");
        formData.append("text", textToSend);
        if (replyToSend) formData.append("replyTo", replyToSend._id);

        if(attachmentBlob){
            const audioFile = new File(
                [attachmentBlob],
                "voice-message.webm",
                { type: "audio/webm" }
            );
            formData.append("media", audioFile);
            }else if(attachmentFile){
                formData.append("media", attachmentFile);
            }

        const res = await API.post("/message/send", formData);
        const realMessage: Message = res.data.newMessage;

        setMessages(prev => 
            prev.map(msg => msg._id === tempId ? {...realMessage, status: "sent" } : msg)
        );

        setTypedMessage("");
        setAudioBlob(null);
        setMediaFile(null);
        fetchConversation();
    } catch (error: any) {
        console.log(error.response?.data || error.message);

        setMessages(prev =>
            prev.map(msg => msg._id === tempId ? {...msg, status: "failed" } : msg)
        );
    } finally {
        setSendingMessage(false);
        setReplyingTo(null);
    }
};

    const handleOpenConversation = async (chat: any) => {
        setActiveChat(chat);

        socket.emit("join_chat", chat.conversationId);

        try{
            const res = await API.post("/conversation/getMessages", {
                conversationId: chat.conversationId
            });

            setMessages(res.data.messages);
        } catch (error){
            console.log(error);
        }
    }

    useEffect(() => {
            if(!user?.id) return;

            socket.emit("setup", user.id);
            fetchConversation();
            
            socket.on("new-message", (message) => {
                setMessages(prev => {
                    if (getSenderId(message.sender) === user?.id) return prev;
                    if (prev.some(msg => msg._id === message._id)) return prev;
                    return [...prev, message];
                });
            });

            // Live presence updates — update both the sidebar list and the
            // open chat's header without needing a refetch.
            socket.on("user-online", ({ userId }: { userId: string }) => {
                setConversations(prev =>
                    prev.map(c => c.otherUserId === userId ? { ...c, online: true } : c)
                );
                setActiveChat(prev =>
                    prev && prev.otherUserId === userId ? { ...prev, online: true } : prev
                );
            });

            socket.on("user-offline", ({ userId, lastSeen }: { userId: string; lastSeen: string }) => {
                setConversations(prev =>
                    prev.map(c => c.otherUserId === userId ? { ...c, online: false, lastSeen } : c)
                );
                setActiveChat(prev =>
                    prev && prev.otherUserId === userId ? { ...prev, online: false, lastSeen } : prev
                );
            });

            return() => {
                socket.off("new-message");
                socket.off("user-online");
                socket.off("user-offline");
            }
        }, [user?.id]);

    const scrollToBottom = (smooth = true) => {
        bottomRef.current?.scrollIntoView({
            behavior: smooth ? "smooth": "auto"
        });
    };

    useEffect(() => {
        if(shouldAutoScroll()){
            scrollToBottom();
        }
    }, [messages]);

    return(
        <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center overflow-hidden">

            {/*Background Ambience Accent */}
            <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-indigo-600/5 blur-[130px] pointer-events-none "/>
            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-[80px_1fr] lg:grid-cols-[260px_1fr] px-4 gap-6 relative z-10">
                <Sidebar />

                <main className="py-6 grid grid-cols-1 lg:grid-cols-[340px_1fr] overflow-hidden max-h-screen">

                    <section className="border-r border-slate-900/60 pr-4 flex flex-col h-full overflow-hidden">
                        <div className="mb-4 space-y-4">
                            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                                Chats
                            </h1>

                            <div className="relative flex items-center">
                                <Search className="absolute left-4 text-slate-600" size={16} />
                                <input type="text"
                                    placeholder="Search a friend..."
                                    className="w-full text-xs rounded-xl border border-slate-900 bg-slate-950 py-3 pl-11 pr-4 text-white placeholder-slate-600 outline-none transition-all focus:border-violet-500/40"
                                    />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1">
                            {conversations.map((chat) => (
                                <button
                                    key= {chat.conversationId}
                                    onClick={() => handleOpenConversation(chat)}
                                    className={`w-full text-left p-3.5 rounded-2xl flex items-center gap-3.5 border transition-all ${
                                        activeChat?.conversationId === chat.conversationId
                                            ? "bg-gradient-to-r from-violet-950/30 to-slate-900/40 border-violet-500/30 shadow-md shadow-violet-950/10"
                                            : "bg-transparent border-transparent hover:bg-slate-900/20 hover:border-slate-900"
                                    }`}
                                >
                                    <div className="relative">
                                        <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-sm font-bold text-slate-300">
                                            {chat.avatarLabel}
                                        </div>
                                        {chat.online && (
                                            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-bold text-slate-200 truncate">{chat.title}</h4>
                                            <span className="text-[10px] text-slate-600 font-medium">{new Date(chat.updatedAt).toLocaleTimeString()}</span>
                                        </div>
                                        <p className={`text-xs truncate mt-0.5 ${chat.unread ? "text-violet-400 font-semibold" : "text-slate-500"}`}>
                                            {chat.latestMessage?.text || "No messages yet"}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="p-3 border-t border-slate-900/80 bg-slate-950">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="w-full py-3 px-4 rounded-xl bg-violet-600/10 hover:bg-violet-600 border border-violet-500/20 text-violet-400 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
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
                    

                    <section className="flex flex-col h-full pl-6 overflow-hidden relative">

                        {/*Header Identity Bar */}
                        <div className="pb-4 border-b border-slate-900/60 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 text-xs font-bold">
                                    {activeChat?.profilePicture ? (
                                        <img src={activeChat.profilePicture} alt="image" className="w-full h-full object-cover" />
                                    ) : (
                                        <span>
                                            {activeChat?.avatarLabel}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-slate-200">
                                        {activeChat?.title || "Select a conversation to start chatting..."}
                                    </h3>
                                    {activeChat && !activeChat.isGroup && (
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
                            </div>
                        </div>

                        <div 
                        ref={chatContainerRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto no-scrollbar py-6 space-y-4 pr-1">
                            {messages.map((msg) => (
                                <MessageBubble
                                    key={msg._id}
                                    msg={msg}
                                    isMe={(typeof msg.sender === "string" ? msg.sender : msg.sender?._id) === user?.id}
                                    isGroup={activeChat?.isGroup || false}
                                    onReply={handleReply}
                                    participants={activeChat?.participants || []}
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
                                ): (
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

                                        <div className="py-2">
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

                                        {/*try adding the emoji picker here first */}
                                        <Smile
                                            onClick={() => setShowEmojiPicker(prev => !prev)}
                                        />

                                        {showEmojiPicker && (
                                            <EmojiPicker
                                                onEmojiClick={(emoji) =>
                                                    setTypedMessage(prev => prev + emoji.emoji)
                                                }
                                            />
                                        )}

                                        <input
                                            ref={inputRef}
                                            disabled={!activeChat}
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
                                        disabled={!activeChat || sendingMessage}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md shadow-violet-600/20 transition-all hover:scale-[1.05] active:scale-[0.95] disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed"
                                    >
                                        <Send size={12} />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={!activeChat}
                                        onClick={isRecording ? stopRecording : startRecording}
                                        className={`absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-md transition-all hover:scale-[1.05] active:scale-[0.95] disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed ${
                                            isRecording ? "bg-red-500 shadow-red-500/20 animate-pulse" : "bg-violet-600 shadow-violet-600/20"
                                        }`}
                                    >
                                        <Mic2 size={16} />
                                    </button>
                                )}
                            </div>
                        </form>
                    </section>
                </main>
            </div>

        </div>
    );
};

export default MessagePage;