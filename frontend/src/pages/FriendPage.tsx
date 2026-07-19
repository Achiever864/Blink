import React, { useState } from "react";
import { 
    Search, UserPlus, Check, X, Flame, Radio, Sliders 
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
    avatarUrl?: string;
    vibeMatch: number; 
    currentActivity?: string; 
    streak?: number; 
}

const FriendsPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const { showStatus } = useStatus();
    const { user } = useAuth();

    const [pendingRequests, setPendingRequests] = useState<NetworkUser[]>([]);
    const [myCircle, setMyCircle] = useState<NetworkUser[]>([]);
    const [suggestions] = useState<NetworkUser[]>([]);

    const fetchRequest = async() => {
        try {
            const res = await API.post("/friend/getPending",{
               recipientId: user?.id,
                }
            );

            const mapped = res.data.relation.map((request:any) => ({
                id: request.requester._id,
                username: request.requester.username,
                displayName: request.requester.username,
                avatarUrl: request.requester.profilePicture?.url,
                vibeMatch: 100,
            }));

            setPendingRequests(mapped);
        } catch (error) {
            showStatus("Unable to fetch feed!");
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
                avatarUrl: otherUser.profilePicture?.url,
                displayName: otherUser.username,
                vibeMatch: 92,
                streak: 0
            }
        });

        setMyCircle(mapped);
    } catch (error) {
        showStatus("Unable to Fetch Friends!");
    }
    }

    useEffect(() => {
        if(!user?.id) return;
        fetchRequest();
        fetchFriends();

    }, [user?.id]);

    const handleAcceptRequest = async (requestId: string) => {
        try {
            await API.post("/friend/accept",{
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

    const handleDeclineRequest = async (id: string) => {
        try {
            await API.post("/friend/reject", {
                requesterId: id,
                recipientId: user?.id
            });
            setPendingRequests(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            showStatus("Unable to decline request", "error");
        }
    };

    const filteredCircle = myCircle.filter(friend => 
        friend.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        friend.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="relative min-h-screen bg-brand-bg text-brand-text flex justify-center overflow-hidden">

            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-[80px_1fr] lg:grid-cols-[260px_1fr_360px] px-2 sm:px-4 lg:px-6 gap-3 lg:gap-6 relative z-10">
                
                <Sidebar />

                <main className="py-4 sm:py-6 md:overflow-y-auto md:max-h-screen no-scrollbar space-y-4 sm:space-y-6 w-full min-w-0">
                    
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-xl font-black text-brand-text tracking-tight flex items-center gap-2 flex-wrap">
                                Manage Friends <span className="text-xs font-medium px-2 py-0.5 rounded-sm bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">{myCircle.length} friends</span>
                            </h2>
                            <p className="text-xs text-brand-text-muted">Handle friend connection with users across the globe</p>
                        </div>

                        <div className="relative flex items-center">
                            <Search size={16} className="absolute left-4 text-brand-text-muted" />
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search a user..."
                                className="w-full bg-brand-surface/30 border border-brand-border/80 rounded-2xl pl-11 pr-12 py-3.5 text-sm text-brand-text placeholder-slate-700 outline-none focus:border-brand-accent/30 backdrop-blur-sm transition-all"
                            />
                            <button className="absolute right-3 p-1.5 rounded-lg bg-brand-surface/60 border border-brand-border text-brand-text-muted hover:text-brand-text transition-colors">
                                <Sliders size={14} />
                            </button>
                        </div>
                    </div>

                    {pendingRequests.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-1.5 px-1">
                                <h3 className="text-xs font-bold text-brand-text-muted uppercase tracking-wider">Pending Request</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {pendingRequests.map((request) => (
                                    <div key={request.id} className="rounded-2xl border border-indigo-500/10 bg-gradient-to-br from-indigo-950/10 via-brand-surface/20 to-brand-surface/40 backdrop-blur-md p-4 flex items-center justify-between gap-2 group">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm uppercase shadow-md shadow-indigo-950/50 overflow-hidden flex-shrink-0">
                                                {request.avatarUrl ? (
                                                    <img src={request.avatarUrl} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <span>{request.username?.substring(0, 2) || "??"}</span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-bold text-brand-text leading-tight truncate">{request.username}</h4>
                                                <p className="text-[11px] text-indigo-400 font-semibold">{request.vibeMatch}% Vibe Match</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            <button 
                                                onClick={() => handleAcceptRequest(request.id)}
                                                className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                            >
                                                <Check size={14} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeclineRequest(request.id)}
                                                className="p-2 rounded-xl bg-brand-surface border border-brand-border/80 text-brand-text-muted hover:text-rose-400 hover:border-rose-950 transition-all"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <div className="px-1">
                            <h3 className="text-xs font-bold text-brand-text-muted uppercase tracking-wider">Friends List:</h3>
                        </div>

                        {filteredCircle.length === 0 ? (
                            <div className="rounded-2xl border border-brand-border bg-brand-surface/5 p-8 text-center text-xs text-brand-text-muted">
                                No result matches your search
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {filteredCircle.map((friend) => (
                                    <div key={friend.id} className="rounded-2xl border border-brand-border bg-brand-surface/10 backdrop-blur-sm p-4 space-y-4 hover:border-brand-border transition-all group relative overflow-hidden">
                                        {friend.streak !== undefined && friend.streak >= 10 && (
                                            <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-amber-500/5 to-transparent rounded-bl-full pointer-events-none" />
                                        )}

                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="h-10 w-10 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-brand-text-muted font-bold text-sm uppercase group-hover:border-brand-accent/30 transition-colors overflow-hidden flex-shrink-0">
                                                    {friend.avatarUrl ? (
                                                        <img src={friend.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>{friend.username?.substring(0, 2) || "??"}</span>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-sm font-bold text-brand-text truncate">{friend.displayName}</h4>
                                                    <p className="text-xs text-brand-text-muted truncate">{friend.username}</p>
                                                </div>
                                            </div>

                                            {friend.streak !== undefined && friend.streak > 0 && (
                                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black font-mono flex-shrink-0">
                                                    <Flame size={11} className="fill-amber-500" />
                                                    <span>{friend.streak}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between text-[11px] gap-2">
                                            <div className="flex items-center gap-1.5 text-brand-text-muted max-w-[70%] truncate">
                                                {friend.currentActivity ? (
                                                    <>
                                                        <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-500"></span>
                                                        </span>
                                                        <span className="truncate italic font-medium text-brand-text-muted">{friend.currentActivity}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-brand-text-muted font-mono">offline</span>
                                                )}
                                            </div>
                                            
                                            <span className="text-brand-text-muted text-[10px] font-semibold flex-shrink-0">{friend.vibeMatch}% sync</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>

                <aside className="hidden lg:block py-6 border-l border-brand-border/60 pl-6 space-y-6">
                    
                    <div className="rounded-2xl border border-brand-border bg-gradient-to-b from-brand-surface/30 to-transparent p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-brand-text-muted uppercase tracking-wider flex items-center gap-1.5">
                                <Radio size={14} className="text-brand-accent" />
                                Live Spatial Rooms
                            </h3>
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <p className="text-[11px] text-brand-text-muted leading-relaxed">Hop instantly into your friends audio frequencies and screenshare nodes.</p>
                        
                        <div className="space-y-2">
                            <div className="p-3 rounded-xl bg-brand-bg/60 border border-brand-border/80 hover:border-brand-border transition-all flex items-center justify-between cursor-pointer group">
                                <div>
                                    <h4 className="text-xs font-bold text-brand-text group-hover:text-brand-accent transition-colors">⚡ General Sync Space</h4>
                                    <p className="text-[10px] text-brand-text-muted mt-0.5">Owen K. & Amina are inside</p>
                                </div>
                                <span className="text-[10px] bg-brand-surface px-2 py-1 rounded-md text-brand-text-muted font-bold border border-brand-border group-hover:bg-brand-accent group-hover:text-white transition-all">Join</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="px-1">
                            <h3 className="text-xs font-bold text-brand-text-muted uppercase tracking-wider">Suggested Operators</h3>
                        </div>

                        <div className="space-y-2.5">
                            {suggestions.map((suggested) => (
                                <div key={suggested.id} className="p-3 rounded-xl bg-brand-surface/10 border border-brand-border flex items-center justify-between hover:border-brand-border/80 transition-all gap-2">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-8 w-8 rounded-lg bg-brand-surface border border-brand-border flex items-center justify-center text-xs text-brand-text-muted font-bold uppercase overflow-hidden flex-shrink-0">
                                            {suggested.avatarUrl ? (
                                                <img src={suggested.avatarUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{suggested.username?.substring(0, 2) || "??"}</span>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-xs font-bold text-brand-text truncate">{suggested.username}</h4>
                                            <p className="text-[10px] text-brand-accent font-medium">{suggested.vibeMatch}% Compatibility</p>
                                        </div>
                                    </div>
                                    <button className="p-2 rounded-lg bg-brand-accent/10 hover:bg-brand-accent text-brand-accent hover:text-white transition-all border border-brand-accent/10 flex-shrink-0">
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