import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Home, MessageSquare, Bell, User, LogOut, Send, Search, CheckCheck, ShieldAlert, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sideBar";

interface DM{
    id: string;
    username: string;
    avatarLetter: string;
    lastMessage: string;
    time: string;
    unread: boolean;
    online: boolean;
}

interface Message {
    id: string;
    sender: string;
    text: string;
    timestamp: string;
}

const MessagePage: React.FC = () => {
    const { user, logout } = useAuth();
    const [activeChat, setActiveChat] = useState<string>("1");
    const [typedMessage, setTypedMessage] = useState<string>("");
    const navigate = useNavigate();

    const [conversations] = useState<DM[]>([
        {
            id: "1",
            username: "cyber_architect",
            avatarLetter: "CA",
            lastMessage: "The Axios intercept i just fixed it right noww!!",
            time: "2m ago",
            unread: true,
            online: true,
        },
        {
            id: "2",
            username: "neon_builder",
            avatarLetter: "NB",
            lastMessage: "Did you push the latest tailwind adjustments?? .. ahhh guyyy",
            time: "1h ago",
            unread: false,
            online: false,
        }
    ]);

    const [messages, setMessages] = useState<Message[]>([
        { id: "1", sender: "cyber_architect", text: "Yo, did you look into the state synchronization bug?", timestamp: "10:14 AM" },
        { id: "2", sender: "me", text: "Yeah, tracked it down to the context re-rendering cycles. Cleared it up completely.", timestamp: "10:15 AM" },
        { id: "3", sender: "cyber_architect", text: "Nice job broooo", timestamp: "10:22 AM" }
    ]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!typedMessage.trim()) return;

        const outboxMsg: Message = {
            id: Date.now().toString(),
            sender: "me",
            text: typedMessage,
            timestamp: new Date().toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})
        }

        setMessages([...messages, outboxMsg]);
        setTypedMessage("");
    };

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
                                    key= {chat.id}
                                    onClick={() => setActiveChat(chat.id)}
                                    className={`w-full text-left p-3.5 rounded-2xl flex items-center gap-3.5 border transition-all ${
                                        activeChat === chat.id
                                            ? "bg-gradient-to-r from-violet-950/30 to-slate-900/40 border-violet-500/30 shadow-md shadow-violet-950/10"
                                            : "bg-transparent border-transparent hover:bg-slate-900/20 hover:border-slate-900"
                                    }`}
                                >
                                    <div className="relative">
                                        <div className="h-10 w-10 rouned-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-sm font-bold text-slate-300">
                                            {chat.avatarLetter}
                                        </div>
                                        {chat.online && (
                                            <span className="absolut -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-bold text-slate-200 truncate">@{chat.username}</h4>
                                            <span className="text-[10px] text-slate-600 font-medium">{chat.time}</span>
                                        </div>
                                        <p className={`text-xs truncate mt-0.5 ${chat.unread ? "text-violet-400 font-semibold" : "text-slate-500"}`}>
                                            {chat.lastMessage}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>
                    

                    {/*Right Inner Panel: Active Message System */}
                    <section className="flex flex-col h-full pl-6 overflow-hidden relative">

                        {/*Header Identity Bar */}
                        <div className="pb-4 border-b border-slate-900/60 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 text-xs font-bold">
                                    CA
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-slate-200">@cyber_architect</h3>
                                    <p className="text-[10px] text-emerald-400 flex items-center pag-1 mt-0.5 font-medium">
                                        <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" /> Online
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/*Chat History Flow Containe*/}
                        <div className="flex-1 overflow-y-auto no-scrollbar py-6 space-y-4 pr-1">
                            {messages.map((msg) => {
                                const isMe = msg.sender === "me";
                                return (
                                    <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                        <div className={`max-w-[70%] rounded-2xl px-4 py-3 text-xs leading-relaxed transition-all ${
                                            isMe
                                                ? "bg-violet-600 text-white rounded-tr-none font-medium shadow-md shadow-violet-600/10"
                                                : "bg-slate-900/60 border border-slate-900 text-slate-300 rounded-tl-none"
                                        }`}>
                                            <p className="whitespace-pre-wrap">{msg.text}</p>
                                        </div>
                                        <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-600 px-1 font-medium">
                                            <span>{msg.timestamp}</span>
                                            {isMe && <CheckCheck size={11} className="text-violet-400" />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/*Anchor Bottom Input Transmitter Form */}
                        <form onSubmit={handleSendMessage} className="pt-4 border-t border-slate-900/60 bg-slate-950">
                            <div className="relative flex items-center rounded-2xl border border-slate-900/60 bg-slate-950">
                                <input 
                                    type="text"
                                    placeholder="Type a message..."
                                    className="w-full bg-transparent py-2.5 pl-4 pr-14 text-xs text-slate-200 outline-none placeholder-slate-600"
                                    value={typedMessage}
                                    onChange={(e) => setTypedMessage(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={!typedMessage.trim()}
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