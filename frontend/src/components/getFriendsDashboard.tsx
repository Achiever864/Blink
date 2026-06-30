import React, { useState, useEffect, useRef, useCallback } from "react";
import { UserPlus, Check, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

interface NetworkUser {
    id: string;
    username: string;
    avatarLetter: string;
    mutualConnections: number;
    isFollowing: boolean;
}

interface GetFriendsDashboardProps {
    isEmbedded?: boolean;
}

const GetFriendsDashboard: React.FC<GetFriendsDashboardProps> = ({ isEmbedded = false }) => {
    const { user } = useAuth();  //pull current logged-in user context
    const [users, setUsers] = useState<NetworkUser[]>([]);
    const [offset, setOffset] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);

    const loadingRef = useRef(false);
    const scrollContainer = useRef<HTMLDivElement | null>(null);
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        const reachedEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth -200;

        if(reachedEnd && hasMore && !isLoading){
            fetchNetworkBatch(offset);
        }
    }
    const limit = 10; //Batch size per fetch

    //simulated backend API caller using our limit and offset rules
    const fetchNetworkBatch = useCallback(async (currentOffset: number) => {
        if(loadingRef.current || !user?.id) return;

        loadingRef.current = true;
        setIsLoading(true);

        try{
            //POST request
            console.log(user.id);
            const res = await API.post("/getBetaUser", {
                userId: user.id
            }, {
                params: {
                    offset: currentOffset,
                    limit: limit
                }
            });
            console.log(res);

            const { users: backendUsers, hasMore: backendHasMore } = res.data;
            if(backendUsers && backendUsers.length > 0){
                //map backend info into our UI
                const mappedUsers: NetworkUser[] = backendUsers.map((u: any) => ({
                    id: u.id || u._id,
                    username: u.username,
                    avatarLetter: u.username ? u.username.charAt(0).toUpperCase() : "U",
                    mutualConnections: u.mutualConnections || 0,
                    isFollowing: u.isFollowing || false,
                }));

                setUsers((prev) => [...prev, ...mappedUsers]);
                setOffset((prevOffset) => prevOffset + backendUsers.length);
            }

            //update inifint scrole boundary flag based on backend confirmation
            setHasMore(backendHasMore);
        } catch(error) {
            console.error("Failed to sync connection recommendations via API endpoint:", error);
        } finally {
            loadingRef.current = false;
            setIsLoading(false);
        }
    }, [user?.id]);

    //Hook it up cleanly
    useEffect(() => {
        if (user?.id){
            fetchNetworkBatch(0)
        }
    }, [user?.id, fetchNetworkBatch]);

    const toggleFollow = (userId: string) => {
        setUsers((prevUsers) =>
        prevUsers.map((u) =>
            u.id === userId ? {...u, isFollowing: !u.isFollowing } : u
        )
        );
    };

return(
    <div className={`rounded-3xl border border-slate-900 bg-slate-950/40 backdrop-blur-md transition-all ${
        isEmbedded ? "p-5 my-6 border-violet-900/30 bg-gradient-to-b from-slate-950 to-slate-900/20" : "p-8"
    }`}>
        {/*Header */}
        <div className="flex items-center justify-between mb-6">
            <div>
                <h3 className="text-sm font-black tracking-wide text-white flex items-center gap-2">
                    Expand Your Network
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Related Profiles, Connect Now!</p>
            </div>
        </div>

        {/*Grid wrapper */}
        <div
            ref={scrollContainer}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto whitespace-nowrap w-full no-scrollbar"
        >
            {users.map((item) => (
                <div
                    key={item.id}
                    className="min-w-[250px] max-w-[250px] flex-shrink-0 rounded-2xl border border-slate-900 bg-slate-950 p-4 flex flex-col justify-between items-center text-center group hover:border-slate-800 transition-all duration-300 relative overflow-hidden"
                >
                    <div  className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600/0 via-violet-500/20 to-violet-600/0 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex flex-col items-center mt-2">
                        <div className="h-12 w-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 text-sm font-bold shadow-inner mb-3">
                            {item.avatarLetter}
                        </div>

                        <h4 className="text-xs font-bold text-slate-200">
                            @{item.username}
                        </h4>

                        <p className="text-[10px] text-slate-600 mt-1">
                            {item.mutualConnections} mutual connections
                        </p>
                    </div>

                <button
                    onClick={() => toggleFollow(item.id)}
                    className={`mt-4 w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.97] ${
                        item.isFollowing
                            ? "bg-slate-900 text-slate-400 border border-slate-800"
                            : "bg-white text-slate-950 hover:bg-slate-200" 
                    }`}
                >
                    {item.isFollowing ? (
                        <>
                            <Check size={12} />
                            <span>Connected</span>
                        </>
                    ) : (
                        <>
                            <UserPlus size={12} />
                            <span>Connect</span>
                        </>
                    )}
                </button>
                </div>
            ))}

            {isLoading && (
                <div className="flex items-center gap-2 text-xs text-slate-500 px-3">
                    <Loader2 size={14} 
                        className="animate-spin text-violet-500"
                    />
                    Loading...
                </div>
            )}

            {!hasMore && users.length > 0 && (
                <div className="text-xs text-slate-600 flex items-center px-3">
                    End of recommendations
                </div>
            )}
    </div>
</div>
)};

export default GetFriendsDashboard;