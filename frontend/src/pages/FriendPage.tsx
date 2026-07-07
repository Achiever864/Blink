import React, { useState } from "react";
import { 
    Search, UserPlus, Check, X, Flame, Radio, Sparkles, Sliders 
} from "lucide-react";
import Sidebar from "../components/sideBar.tsx";
import API from "../api/axios";
import { useEffect } from "react";
import { useStatus }  from "../context/StatusBarContext.tsx";
import { useAuth } from "../context/AuthContext";

interface NetworkUser {
    id: string;
    username: string;
    displayName: string;
    avatarLabel: string;
    vibeMatch: number; 
    currentActivity?: string; 
    streak?: number; 
}

const FriendsPage: React.FC = () => {
    // Search Query State
    const [searchQuery, setSearchQuery] = useState("");
    const { showStatus } = useStatus();
    //get the logged in user
    const { user } = useAuth();

    const fetchRequest = async() => {
        try {
            const res = await API.post("/friend/getPending",{
               recipientId: user?.id,
                }
            );

            const mapped = res.data.relation.map((request:any) => ({
                id: request.requester._id,
                username: request.requester.username,
                avatarLabel:
                    request.requester.username
                        .substring(0,2)
                        .toUpperCase(),

                vibeMatch: 100,
            }));

            setPendingRequests(mapped);
        } catch (error) {
            showStatus(error);
        }
    }

    const fetchFriends = async() => {
        try {
        const res = await API.post("/friend/getFriends", {
           userId: user?.id,
        });

        const mapped = res.data.friends.map((friend:any) => {
            const otherUser =
                friend.requester._id === user?.id
                    ? friend.recipient
                    : friend.requester;
            
            return{
                id: otherUser._id,
                username: otherUser.username,
                avatarLabel: otherUser.username.substring(0,2).toUpperCase(),
                displayName: otherUser.username,
                vibeMatch: 92,
                streak: 0
            }
        });

        setMyCircle(mapped);
    } catch (error) {
        showStatus(error);
    }
    }

    useEffect(() => {
        if(!user?.id) return;
        fetchRequest();
        fetchFriends();

    }, [user?.id]);

    const [pendingRequests, setPendingRequests] = useState<NetworkUser[]>([]);
    const [myCircle, setMyCircle] = useState<NetworkUser[]>([]);
    const [suggestions, setSuggestions] = useState<NetworkUser[]>([]);

    // Action Handlers
    const handleAcceptRequest = async (requestId: string) => {
        try {
            const res = await API.post("/friend/accept",{
                requesterId: requestId,
                recipientId: user?.id
            })

            fetchRequest();
            fetchFriends();

            showStatus("User Added Successfully", "success");
        } catch (error) {
            showStatus("Unable to add user");
        }
    };

    const handleDeclineRequest = (id: string) => {
        setPendingRequests(pendingRequests.filter(r => r.id !== id));
    };

    // Filter circle based on search query
    const filteredCircle = myCircle.filter(friend => 
        friend.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        friend.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center overflow-hidden">
            

            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-[80px_1fr] lg:grid-cols-[260px_1fr_360px] px-4 gap-6 relative z-10">
                
                {/* LEFT SIDEBAR: Centralized Component */}
                <Sidebar />

                {/* MIDDLE MAIN SECTOR: Connections Control Grid */}
                <main className="py-6 overflow-y-auto max-h-screen no-scrollbar space-y-6">
                    
                    {/* Header Stack + Interactive Search Block */}
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                                Personal Grid <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">{myCircle.length} Operators</span>
                            </h2>
                            <p className="text-xs text-slate-500">Manage real-time communication bridges and proximity nodes.</p>
                        </div>

                        {/* Cyber Search Bar */}
                        <div className="relative flex items-center">
                            <Search size={16} className="absolute left-4 text-slate-600" />
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search handles, names, or vibe codes..."
                                className="w-full bg-slate-900/30 border border-slate-900/80 rounded-2xl pl-11 pr-12 py-3.5 text-sm text-slate-200 placeholder-slate-700 outline-none focus:border-violet-500/30 backdrop-blur-sm transition-all"
                            />
                            <button className="absolute right-3 p-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-500 hover:text-slate-300 transition-colors">
                                <Sliders size={14} />
                            </button>
                        </div>
                    </div>

                    {/* PENDING REQUESTS SECTOR */}
                    {pendingRequests.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-1.5 px-1">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Request</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {pendingRequests.map((request) => (
                                    <div key={request.id} className="rounded-2xl border border-indigo-500/10 bg-gradient-to-br from-indigo-950/10 via-slate-900/20 to-slate-900/40 backdrop-blur-md p-4 flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm uppercase shadow-md shadow-indigo-950/50">
                                                {request.avatarLabel}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-200 leading-tight">@{request.username}</h4>
                                                <p className="text-[11px] text-indigo-400 font-semibold">{request.vibeMatch}% Vibe Match</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-1.5">
                                            <button 
                                                onClick={() => handleAcceptRequest(request.id)}
                                                className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                            >
                                                <Check size={14} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeclineRequest(request.id)}
                                                className="p-2 rounded-xl bg-slate-900 border border-slate-800/80 text-slate-500 hover:text-rose-400 hover:border-rose-950 transition-all"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* MAIN FRIENDS SEGMENT: The Circle */}
                    <div className="space-y-3">
                        <div className="px-1">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Circle</h3>
                        </div>

                        {filteredCircle.length === 0 ? (
                            <div className="rounded-2xl border border-slate-900 bg-slate-900/5 p-8 text-center text-xs text-slate-600">
                                No network connections match your parameter filters.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {filteredCircle.map((friend) => (
                                    <div key={friend.id} className="rounded-2xl border border-slate-900 bg-slate-900/10 backdrop-blur-sm p-4 space-y-4 hover:border-slate-800 transition-all group relative overflow-hidden">
                                        {friend.streak !== undefined && friend.streak >= 10 && (
                                            <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-amber-500/5 to-transparent rounded-bl-full pointer-events-none" />
                                        )}

                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 font-bold text-sm uppercase group-hover:border-violet-500/30 transition-colors">
                                                    {friend.avatarLabel}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-200">{friend.displayName}</h4>
                                                    <p className="text-xs text-slate-500">@{friend.username}</p>
                                                </div>
                                            </div>

                                            {friend.streak !== undefined && friend.streak > 0 && (
                                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black font-mono">
                                                    <Flame size={11} className="fill-amber-500" />
                                                    <span>{friend.streak}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Context Layer: Live Action Activity Status */}
                                        <div className="pt-3 border-t border-slate-900/60 flex items-center justify-between text-[11px]">
                                            <div className="flex items-center gap-1.5 text-slate-400 max-w-[70%] truncate">
                                                {friend.currentActivity ? (
                                                    <>
                                                        <span className="relative flex h-1.5 w-1.5">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-500"></span>
                                                        </span>
                                                        <span className="truncate italic font-medium text-slate-400">{friend.currentActivity}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-slate-600 font-mono">offline</span>
                                                )}
                                            </div>
                                            
                                            <span className="text-slate-600 text-[10px] font-semibold">{friend.vibeMatch}% sync</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>

                {/* RIGHT SIDEBAR: Discovery Panel & Spatial Audio Rooms */}
                <aside className="hidden lg:block py-6 border-l border-slate-900/60 pl-6 space-y-6">
                    
                    {/* Live Proximity Spatial Rooms */}
                    <div className="rounded-2xl border border-slate-900 bg-gradient-to-b from-slate-900/30 to-transparent p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Radio size={14} className="text-violet-500" />
                                Live Spatial Rooms
                            </h3>
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">Hop instantly into your friends audio frequencies and screenshare nodes.</p>
                        
                        <div className="space-y-2">
                            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-900/80 hover:border-slate-800 transition-all flex items-center justify-between cursor-pointer group">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-300 group-hover:text-violet-400 transition-colors">⚡ General Sync Space</h4>
                                    <p className="text-[10px] text-slate-600 mt-0.5">Owen K. & Amina are inside</p>
                                </div>
                                <span className="text-[10px] bg-slate-900 px-2 py-1 rounded-md text-slate-400 font-bold border border-slate-800 group-hover:bg-violet-600 group-hover:text-white transition-all">Join</span>
                            </div>
                        </div>
                    </div>

                    {/* Algorithmic Suggested Profiles Module */}
                    <div className="space-y-4">
                        <div className="px-1">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Suggested Operators</h3>
                        </div>

                        <div className="space-y-2.5">
                            {suggestions.map((user) => (
                                <div key={user.id} className="p-3 rounded-xl bg-slate-900/10 border border-slate-900 flex items-center justify-between hover:border-slate-800/80 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-xs text-slate-400 font-bold uppercase">
                                            {user.avatarLabel}
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-200">@{user.username}</h4>
                                            <p className="text-[10px] text-violet-400 font-medium">{user.vibeMatch}% Compatibility</p>
                                        </div>
                                    </div>
                                    <button className="p-2 rounded-lg bg-violet-600/10 hover:bg-violet-600 text-violet-400 hover:text-white transition-all border border-violet-500/10">
                                        <UserPlus size={13} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

            </div>
        </div>
    );
};

export default FriendsPage;