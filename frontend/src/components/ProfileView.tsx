import { useEffect, useState } from "react";
import API from "../api/axios";
import { X } from "lucide-react";
import { useStatus } from "../context/StatusBarContext";

interface UserProfileModalProps {
    userId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

interface UserProfile {
    userId: string;
    username: string;
    fullname: string;
    bio: string;
    occupation: string;
    city: string;
    nationality: string;
    profilePicture: {
        url: string;
        publicId: string;
    };
    coverPhoto: string;
    friendsCount: number;
    postsCount: number;
    mutualFriends: string[];
    badges: string[];
    isFriend: boolean;
    friendRequestSent: boolean;
    hasBlocked: boolean;
    blockedMe: boolean;
    joinedAt: string;
    lastSeen: string;
    online: boolean;
}



const ProfileView: React.FC<UserProfileModalProps> = ({
    userId,
    isOpen,
    onClose
}) =>  {
    if (!isOpen) return null;
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const { showStatus } = useStatus();

    useEffect(() => {
        if (!isOpen || !userId) return;
        const fetchUser = async() => {
        try {
            if (!userId) return;
            setProfile(null);
            setLoading(true);

            const res = await API.get(`/user/getProfile/${userId}`);

            setProfile(res.data);
        } catch (error) {
            showStatus("unable to fetch user profile");
        } finally{
            setLoading(false);
        }
    }

    fetchUser();
    }, [isOpen, userId]);

    if (loading){
        return(
            <div className="fixed inset-0">
                    Loading.... Couldn't animate bear with me please

            </div>
        )
    }

    return(
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            {/*Modal */}
            <div className="w-full max-w-4xl h-[90vh] bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                {/*Cover Photo */}
                <div className="relative h-52 bg-gradient-to-r from-violet-700 via-indigo-600 to-fuchsia-600">
                    <button className="absolute top-5 right-5 h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center"
                        onClick={onClose}
                    >
                        <X size={22} />
                    </button>
                </div>

                {/*Body ni sha */}
                <div className="flex-1 overflow-y-auto">
                    {/*profile section */}
                    <div className="px-8">
                        <div className="mt-16 flex items-end justify-between">
                            <div className="h-32 w-32 rounded-3xl border-4 border-slate-950 overflow-hidden bg-slate-900 shadow-xl">
                                <img 
                                    src={profile?.profilePicture?.url}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                            </div>

                            {/*Action Button */}
                            <div className="flex gap-3">
                                <button className="px-5 py-2 rounded-xl border border-slate-700 hover:border-violet-500 transition">
                                    Message
                                </button>

                                <button className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 transition font-semibold">
                                    Add Friend
                                </button>
                            </div>
                        </div>

                        {/*User Info */}
                        <div className="mt-5">
                            <h1 className="text-3xl font-black text-white">
                                Achiever
                            </h1>

                            <p className="text-slate-500 text-sm">
                                @achieverConcept
                            </p>

                            <p className="mt-4 text-slate-300 leading-relaxed max-w-2xl">
                                Backend Engineer || AI Enthusiast || Building the future of social learning through Ariston Arena
                            </p>
                        </div>

                        {/*Quick Info */}
                        <div className="flex flex-wrap gap-6 mt-5 text-sm text-slate-400">
                            <span> Lagos, Nigeria</span>
                            <span> University of Ibadan</span>
                            <span> Backend Engineer </span>
                            <span> Joined July 2026 </span>
                        </div>

                        {/*Stats */}
                        <div className="grid grid-cols-4 gap-4 mt-8">
                            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 text-center">
                                <h2 className="text-3xl font-black text-white">
                                    248
                                </h2>

                                <p className="text-xs text-slate-500 mt-1">
                                    Friends
                                </p>
                            </div>

                            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 text-center">
                                <h2 className="text-3xl font-black text-white">
                                    124
                                </h2>

                                <p className="text-xs text-slate-500 mt-1">
                                    Posts
                                </p>
                            </div>

                            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 text-center">
                                <h2 className="text-3xl font-black text-white">
                                    31
                                </h2>

                                <p className="text-xs text-slate-500 mt-1">
                                    Mutual Friends
                                </p>
                            </div>

                            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 text-center">
                                <h2 className="text-3xl font-black text-emerald-400">
                                    Online
                                </h2>

                                <p className="text-xs text-slate-500 mt-1">
                                    Status
                                </p>
                            </div>

                        </div>

                        <div className="flex gap-8 mt-10 border-b border-slate-800">
                            <button className="pb-4 border-b-2 border-violet-500 text-white font-semibold">
                                Posts
                            </button>

                            <button className="pb-4 text-slate-500 hover:text-white">
                                Media
                            </button>

                            <button className="pb-4 text-slate-500 hover:text-white">
                                Friends
                            </button>

                            <button className="pb-4 text-slate-500 hover:text-white">
                                About
                            </button>
                        </div>

                        {/*Content */}
                        <div className="space-y-4 py-8">
                            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
                                Recent Post Card
                            </div>

                            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
                                Recent Post Card
                            </div>

                            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
                                Recent Post Card
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )}

export default ProfileView;