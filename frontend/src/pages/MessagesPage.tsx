import React, { act, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import 
    { Home, MessageSquare, Bell, User, LogOut, Send, ChevronDown, Search, CheckCheck, Paperclip, ShieldAlert, Sparkles, MessageSquarePlus }
    from "lucide-react";
import Sidebar from "../components/sideBar";
import API from "../api/axios";
import { useEffect } from "react";
import NewChatModal from "../components/newChatModal";
import socket from "../socket";

interface DM{
    id: string;
    username: string;
    avatarLetter: string;
    lastMessage: string;
    time: string;
    unread: boolean;
    online: boolean;
}

interface Participant {
    _id: string;
    username: string;
    profilePicture?: {
        url: string;
        publicId: string;
    } | "";
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
    avatarLabel: string;
    participants: Participant[];
    latestMessage?: Message
    updatedAt: string;
}

interface Message {
    _id: string;
    chatId: string;
    sender: {
        _id: string;
        username: string;
        profilePicture?: {
            url: string;
            publicId: string;
        } | "";
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
}

const MessagePage: React.FC = () => {
    const { user } = useAuth();
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

    const handleScroll = () => {
        const el = chatContainerRef.current;

        if (!el) return;

        const distanceFromBottom =
            el.scrollHeight - el.scrollTop - el.clientHeight;

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
            const response = await API.post("/conversation/create", {
                isGroupChat: false,
                participants: [
                    targetUserId,
                    user!.id
                ]
            });
            console.log("Conversation Initialized: ", response.data);

            fetchConversation()

        } catch (error) {
            console.error("Failed to initialize conversation:", error);
            throw error;
        }
    };

    const fetchConversation = async () => {
        console.log("trying to fetch conversation");
        if(!user?.id) return;

        try {
            const res = await API.post("/conversation/getConversation", {
                userId: user?.id
            })

            console.log("Fetched response:", res);
            const mapped = res.data.conversation.map((converse: any) => {
                //find the other person in this chat context (don't really know if this works sha but..)
                const otherUser = converse.participant.find(
                    (p: any) => p._id !== user?.id
                );

                //Resolve if it shows group name or the friend username
                const chatTitle = converse.isGroupChat
                    ? (converse.roomName || "Untitled Group")
                    : `@${otherUser?.username || "deleted_user"}`;

                //mapping the layout
                const avatar = converse.isGroupChat
                        ? chatTitle.substring(0,2)
                        : (otherUser?.username?.substring(0,2) || "??");

                return {
                    conversationId: converse._id,
                    isGroup: converse.isGroupChat,
                    title: chatTitle,
                    avatarLabel: avatar,
                    participants: converse.participant,
                    profilePicture:
                        converse.isGroupChat
                            ? ""
                            : otherUser?.profilePicture?.url || "",
                    latestMessage: converse.latestMessage || null,
                    updatedAt: converse.updatedAt
                };
            });

            setConversations(mapped);
        } catch (error) {
            console.log(error);
        }
    };

   const handleSendMessage = async (
    e: React.FormEvent
) => {
    e.preventDefault();

    if (!activeChat) return;

    if (!typedMessage.trim()) return;

    setSendingMessage(true);

    try {
        const res = await API.post("/message/send", {
            chatId: activeChat.conversationId,
            sender: user?.id,
            text: typedMessage
        });

        //setMessages(prev => [...prev, res.data.newMessage]);

        setTypedMessage("");

        fetchConversation();
    } catch (error) {
        console.log(error);
    } finally {
        setSendingMessage(false);
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
                setMessages(prev => [...prev, message]);
            });

            return() => {
                socket.off("new-message");
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
            <div className="w-full max-w-7xl grid grid-cols-1 md: grid-cols-[80px_1fr] lg:grid-cols-[260px_1fr] px-4 gap-6 relative z-10">
                {/*Sidebar Navigation */}
                <Sidebar />

                {/*messaging subsystem platform ??? What!! */}
                <main className="py-6 grid grid-cols-1 lg:grid-cols-[340px_1fr] overflow-hidden max-h-screen">

                    {/*Left Inner Panel: conversation directory */}
                    <section className="border-r border-slate-900/60 pr-4 flex flex-col h-full overflow-hidden">
                        <div className="mb-4 space-y-4">
                            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                                Chats
                            </h1>

                            {/*Search Terminal Bar*/}
                            <div className="relative flex items-center">
                                <Search className="absolute left-4 text-slate-600" size={16} />
                                <input type="text"
                                    placeholder="Search a friend..."
                                    className="w-full text-xs rounded-xl border border-slate-900 bg-slate-950 py-3 pl-11 pr-4 text-white placholder-slate-600 outline-none transition-all focus:border-violet-500/40"
                                    />
                            </div>
                        </div>

                        {/*List Stream  */}
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
                                        <div className="h-10 w-10 rouned-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-sm font-bold text-slate-300">
                                            {chat.avatarLabel}
                                        </div>
                                        {chat.online && (
                                            <span className="absolut -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
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

                        {/*Pinned footer to open the lookup modal on click */}
                        <div className="p-3 border-t border-slate-900/80 bg-slate-950">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="w-full py-3 px-4 rounded-xl bg-violet-600/10 hover:bg-violet-600 border border-violet-500/20 text-violet-400 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
                            >
                                <MessageSquarePlus size={15} />
                                <span>Chat with Friends</span>
                            </button>
                        </div>

                        {/*Modal Component Injector */}
                        <NewChatModal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            onStartChat={handleStartNewChat}
                        />
                    </section>
                    

                    {/*Right Inner Panel: Active Message System */}
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
                                    <p className="text-[10px] text-emerald-400 flex items-center pag-1 mt-0.5 font-medium">
                                        <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" /> Online
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/*Chat History Flow Containe*/}
                        <div 
                        ref={chatContainerRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto no-scrollbar py-6 space-y-4 pr-1">
                            {messages.map((msg) => {
                                const senderId =
                                    typeof msg.sender === "string"
                                        ? msg.sender
                                        : msg.sender?._id;

                                const isMe = senderId === user?.id;  
                                return (
                                    <div key={msg._id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                        <div className={`max-w-[70%] rounded-2xl px-4 py-3 text-xs leading-relaxed transition-all ${
                                            isMe
                                                ? "bg-violet-600 text-white rounded-tr-none font-medium shadow-md shadow-violet-600/10"
                                                : "bg-slate-900/60 border border-slate-900 text-slate-300 rounded-tl-none"
                                        }`}>
                                            <div className="whitespace-pre-wrap">
                                                {msg.isDeleted && (
                                                        <p className="italic text-slate-500">
                                                            ∅ This message was deleted.
                                                        </p>
                                                )}

                                                {msg.text && (
                                                    <p>
                                                        {msg.text}

                                                        {msg.isEdited && (
                                                        <span className="ml-2 text-[10px]">
                                                            edited
                                                        </span>
                                                        )}
                                                    </p>

                                                    
                                                )}

                                                {msg.attachment?.type === "image" && (
                                                    <img
                                                        src={msg.attachment.url}
                                                        alt="image"
                                                        className="rounded-xl mt-2 max-w-xs"
                                                    />
                                                )}

                                                {msg.attachment?.type === "video" && (
                                                    <video
                                                        controls
                                                        className="rounded-xl mt-2"
                                                    >
                                                        <source src={msg.attachment.url} />
                                                    </video>
                                                )}

                                                {msg.attachment?.type === "audio" && (
                                                    <audio 
                                                        controls
                                                    >
                                                        <source src={msg.attachment.url} />
                                                    </audio>
                                                )}

                                                {msg.attachment?.type === "file" && (
                                                    <a 
                                                    href={msg.attachment.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-violet-400 underline"
                                                    >
                                                        {msg.attachment.fileName}
                                                    </a>
                                                )}
                                                

                                                {/*I hope I did the reaction rendering properly sha.. we'll find out*/}
                                                <div className="flex gap-1">
                                                    {msg.reactions?.map(r => (
                                                        <span key={r.user}>
                                                            {r.emoji}
                                                        </span>
                                                    ))}
                                                </div>


                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-600 px-1 font-medium">
                                            <span>{new Date(msg.createdAt).toLocaleTimeString([],{
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            })}</span>
                                            {isMe && <CheckCheck size={11} className="text-violet-400" />}
                                        </div>
                                    </div>
                                );
                                
                            })}

                            <div ref={bottomRef} />
                        </div>
                        
                        {/*Down button to get to latest chat */}
                        {showScrollButton && (
                            <button
                                onClick={() => scrollToBottom()}
                                className="absolute bottom-24 right-6 h-11 w-11 rounded-full bg-violet-600 hover:bg-violet-500 shadow-lg flex items-center justify-center transition-all"
                            >
                                <ChevronDown size={20} />
                            </button>
                        )}

                        {/*Anchor Bottom Input Transmitter Form */}
                        <form onSubmit={handleSendMessage} className="pt-4 border-t border-slate-900/60 bg-slate-950">
                            <div className="relative flex items-center rounded-2xl border border-slate-900/60 bg-slate-950">
                                <Paperclip size={12} />
                                <input 
                                    ref={inputRef}
                                    disabled={!activeChat}
                                    type="text"
                                    placeholder="Type a message..."
                                    className="w-full bg-transparent py-2.5 pl-4 pr-14 text-xs text-slate-200 outline-none placeholder-slate-600"
                                    value={typedMessage}
                                    onChange={(e) => setTypedMessage(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={!typedMessage.trim() || !activeChat || sendingMessage}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md shadow-violet-600/20 transition-all hover:scale-[1.05] active:scale-[0.95] disabled: opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed"
                                >
                                    <Send size={12} />
                                </button>
                            </div>
                        </form>
                    </section>
                </main>
            </div>

        </div>
    );
};

export default MessagePage;