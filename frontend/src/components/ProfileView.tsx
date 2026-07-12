import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import API from "../api/axios";
import { X } from "lucide-react";
import { useStatus } from "../context/StatusBarContext";
import { useAuth } from "../context/AuthContext";

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
    const {user: currentUser} = useAuth();
    const { showStatus } = useStatus();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        if (!isOpen || !userId) return;
        const fetchUser = async() => {
        try {
            setProfile(null);
            setLoading(true);

            const res = await API.get(`/user/getProfile/${userId}`, {
                params: { viewerId: currentUser?.id }
            });

            setProfile(res.data);
        } catch (error) {
            showStatus("unable to fetch user profile", "error");
        } finally{
            setLoading(false);
        }
    }

    fetchUser();
    }, [isOpen, userId, currentUser?.id]);

    if (!isOpen) return null;

    if (loading || !profile){
        return createPortal(
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="flex flex-col items-center gap-3 text-slate-400">
                    <div className="h-10 w-10 rounded-full border-2 border-slate-700 border-t-violet-500 animate-spin" />
                    <span className="text-sm font-medium"> Loading Profile...</span>
                </div>
            </div>,
            document.body
        );
    }

     return createPortal(
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            {/*Modal */}
            <div className="w-full max-w-4xl h-[90vh] bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                {/*Cover Photo */}
                <div className="relative h-52 bg-gradient-to-r from-violet-700 via-indigo-600 to-fuchsia-600">
                    {profile.coverPhoto && (
                        <img
                            src={profile.coverPhoto}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    )}
                    <button
                        className="absolute top-5 right-5 h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center"
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
                                    src={profile.profilePicture?.url}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                            </div>

                            {/*Action Button */}
                            {profile.userId !== currentUser?.id && (
                                <div className="flex gap-3">
                                    <button className="px-5 py-2 rounded-xl border border-slate-700 hover:border-violet-500 transition">
                                        Message
                                    </button>

                                    {profile.isFriend ? (
                                        <button className="px-5 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-default">
                                            Friends
                                        </button>
                                    ) : profile.friendRequestSent ? (
                                        <button className="px-5 py-2 rounded-xl bg-slate-800 text-slate-400 font-semibold cursor-default">
                                            Request Sent
                                        </button>
                                    ) : (
                                        <button className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 transition font-semibold">
                                            Add Friend
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/*User Info */}
                        <div className="mt-5">
                            <h1 className="text-3xl font-black text-white">
                                {profile.fullname || profile.username}
                            </h1>

                            <p className="text-slate-500 text-sm">
                                {profile.username}
                            </p>

                            {profile.bio && (
                                <p className="mt-4 text-slate-300 leading-relaxed max-w-2xl">
                                    {profile.bio}
                                </p>
                            )}
                        </div>

                        {/*Quick Info */}
                        <div className="flex flex-wrap gap-6 mt-5 text-sm text-slate-400">
                            {profile.city && <span>{profile.city}</span>}
                            {profile.occupation && <span>{profile.occupation}</span>}
                            {profile.nationality && <span>{profile.nationality}</span>}
                            <span>Joined {new Date(profile.joinedAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</span>
                        </div>

                        {/*Stats */}
                        <div className="grid grid-cols-4 gap-4 mt-8">
                            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 text-center">
                                <h2 className="text-3xl font-black text-white">
                                    {profile.friendsCount}
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">Friends</p>
                            </div>

                            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 text-center">
                                <h2 className="text-3xl font-black text-white">
                                    {profile.postsCount}
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">Posts</p>
                            </div>

                            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 text-center">
                                <h2 className="text-3xl font-black text-white">
                                    {profile.mutualFriends.length}
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">Mutual Friends</p>
                            </div>

                            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 text-center">
                                <h2 className={`text-3xl font-black ${profile.online ? "text-emerald-400" : "text-slate-500"}`}>
                                    {profile.online ? "Online" : "Offline"}
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">Status</p>
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

                        {/*Content — still placeholder, needs actual post fetching */}
                        <div className="space-y-4 py-8">
                            <p className="text-sm text-slate-500 text-center py-8">
                                Recent posts will appear here once wired up.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ProfileView;