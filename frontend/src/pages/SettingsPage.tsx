import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    User, Palette, ArrowLeft, Lock, Bell, Globe, Check, Briefcase, MapPin, Cake, Tag, LogOut
} from "lucide-react";
import {
    useTheme, type ThemeMode
}   from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

type SettingsTab = "profile" | "appearance" | "security" | "notifications";

const SettingsPage: React.FC = () => {
    const { theme, setTheme } = useTheme();
    const { user, updateUser, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
    const navigate = useNavigate();

    const [profile, setProfile] = useState({
        username: user?.username || "",
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        bio: user?.bio || "",
        website: user?.website || "",
        dateOfBirth: user?.dateOfBirth || "",
        occupation: user?.occupation || "",
        nationality: user?.nationality || "",
        city: user?.city || "",
        interests: user?.interests?.join(", ") || ""
    });

    const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
    const profilePicPreview = useMemo(() => {
        if (!profilePictureFile) return null;
        return URL.createObjectURL(profilePictureFile);
    }, [profilePictureFile]);

    useEffect(() => {
        return () => {
            if (profilePicPreview) URL.revokeObjectURL(profilePicPreview);
        };
    }, [profilePicPreview]);

    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [notifications, setNotifications] = useState({
        dmAlerts: true,
        groupAlerts: false,
        statusIndicator: true
    });

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setShowSuccess(false);

        try {
            const formData = new FormData();
            formData.append("userId", user?.id || "");
            formData.append("username", profile.username);
            formData.append("firstName", profile.firstName);
            formData.append("lastName", profile.lastName);
            formData.append("bio", profile.bio);
            formData.append("website", profile.website);
            formData.append("dateOfBirth", profile.dateOfBirth);
            formData.append("occupation", profile.occupation);
            formData.append("nationality", profile.nationality);
            formData.append("city", profile.city);
            formData.append("interests", profile.interests);

            if (profilePictureFile) {
                formData.append("profilePicture", profilePictureFile);
            }

            const res = await API.patch("/user/update", formData);
            setShowSuccess(true);

            if (res.data?.user) {
                updateUser({
                    username: res.data.user.username,
                    firstName: res.data.user.firstName,
                    lastName: res.data.user.lastName,
                    bio: res.data.user.bio,
                    website: res.data.user.website,
                    dateOfBirth: res.data.user.dateOfBirth,
                    occupation: res.data.user.occupation,
                    nationality: res.data.user.nationality,
                    city: res.data.user.city,
                    interests: res.data.user.interests,
                    profilePicture: res.data.user.profilePicture?.url || res.data.user.profilePicture || "",
                });
            }
        } catch (error: any) {
            console.log(error.response?.data || error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordUpdate = (e: React.FormEvent) =>  {
        e.preventDefault();
        console.log("Re-authenticating access token and updating credentials");
    };

    return(
        <div className="min-h-screen bg-brand-bg text-brand-text flex justify-center py-6 sm:py-10 px-2 sm:px-4 md:px-8">
            <div className="w-full max-w-5xl bg-brand-surface/40 border border-brand-border rounded-3xl flex flex-col md:flex-row overflow-hidden backdrop-blur-md min-h-[70vh]">

                <aside className="w-full md:w-64 bg-brand-bg/60 p-4 sm:p-6 border-b md:border-b-0 md:border-r border-brand-border/60 flex flex-col gap-1">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 h-10 w-10 pl-2 rounded-3xl bg-brand-surface border border-brand-border hover:border-brand-accent/40 transition-all mb-2"
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <div className="mb-6 px-2">
                        <h2 className="text-sm font-black tracking-wider text-brand-text uppercase">User Control Access</h2>
                        <p className="text-[10px] text-brand-text-muted font-mono">Profile Configuration</p>
                    </div>

                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all ${activeTab === "profile" ? "bg-brand-accent/10 text-brand-accent border border-brand-accent/20" : "text-brand-text-muted hover:text-brand-text border border-transparent" }`}
                    >
                        <User size={15} />
                        <span>Update Profile</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("appearance")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all ${activeTab === "appearance" ? "bg-brand-accent/10 text-brand-accent border border-brand-accent/20" : "text-brand-text-muted hover:text-brand-text border border-transparent"}`}
                    >
                        <Palette size={15} />
                        <span>Themes</span>
                    </button>

                    <button
                        onClick ={() => setActiveTab("security")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all ${activeTab === 'security' ? "bg-brand-accent/10 text-brand-accent border border-brand-accent/20" : "text-brand-text-muted hover:text-brand-text border border-transparent"}`}
                    >
                        <Lock size={15} />
                        <span>Password & Security</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("notifications")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all ${activeTab === 'notifications' ? "bg-brand-accent/10 text-brand-accent border border-brand-accent/20" : "text-brand-text-muted hover:text-brand-text border border-transparent"}`}
                    >
                        <Bell size={15} />
                        <span>Notifications</span>
                    </button>

                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide text-rose-400 hover:bg-rose-950/20 transition-all mt-auto"
                    >
                        <LogOut size={15} />
                        <span>Logout</span>
                    </button>
                </aside>

                <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto">
                    {activeTab === "profile" && (
                        <form onSubmit={handleProfileSave} className="space-y-6 max-w-xl">
                            <div>
                                <h3 className="text-md font-black text-brand-text">Update User Profile</h3>
                                <p className="text-xs text-brand-text-muted">Update your profile information</p>
                            </div>

                            {/* Profile picture */}
                            <div className="flex items-center gap-4">
                                <div className="relative h-16 w-16 rounded-2xl overflow-hidden bg-brand-surface border border-brand-border flex-shrink-0">
                                    {profilePicPreview ? (
                                        <img src={profilePicPreview} alt="preview" className="h-full w-full object-cover" />
                                    ) : user?.profilePicture ? (
                                        <img src={user.profilePicture} alt="current" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-brand-text-muted text-xs font-bold uppercase">
                                            {profile.username.substring(0, 2)}
                                        </div>
                                    )}
                                </div>

                                <label className="cursor-pointer px-4 py-2 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-accent/40 text-xs font-bold text-brand-text transition-all">
                                    Change Photo
                                    <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) setProfilePictureFile(file);
                                        }}
                                    />
                                </label>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-brand-text-muted font-mono">First Name</label>
                                    <input
                                        type="text"
                                        value={profile.firstName}
                                        onChange={e => setProfile({...profile, firstName: e.target.value})}
                                        className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-2.5 text-xs text-brand-text focus:border-brand-accent/40 outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-brand-text-muted font-mono">Last Name</label>
                                    <input
                                        type="text"
                                        value={profile.lastName}
                                        onChange={e => setProfile({...profile, lastName: e.target.value})}
                                        className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-2.5 text-xs text-brand-text focus:border-brand-accent/40 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-brand-text-muted font-mono">Operator Handle</label>
                                <input 
                                    type="text"
                                    value={profile.username}
                                    onChange={e => setProfile({...profile, username: e.target.value.replace(/\s/g, "")})}
                                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-2.5 text-xs text-brand-text focus:border-brand-accent/40 outline-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-brand-text-muted font-mono">COMS LINK (EMAIL)</label>
                                <input
                                    type="text"
                                    value={profile.email}
                                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-2.5 text-xs text-brand-text-muted cursor-not-allowed outline-none"
                                    disabled
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-brand-text-muted font-mono flex items-center gap-1.5">
                                        <Briefcase size={11} /> Occupation
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.occupation}
                                        onChange={e => setProfile({...profile, occupation: e.target.value})}
                                        className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-2.5 text-xs text-brand-text focus:border-brand-accent/40 outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-brand-text-muted font-mono flex items-center gap-1.5">
                                        <MapPin size={11} /> City
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.city}
                                        onChange={e => setProfile({...profile, city: e.target.value})}
                                        className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-2.5 text-xs text-brand-text focus:border-brand-accent/40 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-brand-text-muted font-mono">Nationality</label>
                                    <input
                                        type="text"
                                        value={profile.nationality}
                                        onChange={e => setProfile({...profile, nationality: e.target.value})}
                                        className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-2.5 text-xs text-brand-text focus:border-brand-accent/40 outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-brand-text-muted font-mono flex items-center gap-1.5">
                                        <Cake size={11} /> Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        value={profile.dateOfBirth}
                                        onChange={e => setProfile({...profile, dateOfBirth: e.target.value})}
                                        className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-2.5 text-xs text-brand-text focus:border-brand-accent/40 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-brand-text-muted font-mono flex items-center gap-1.5">
                                    <Tag size={11} /> Interests (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={profile.interests}
                                    onChange={e => setProfile({...profile, interests: e.target.value})}
                                    placeholder="coding, music, hiking"
                                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-2.5 text-xs text-brand-text focus:border-brand-accent/40 outline-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-brand-text-muted font-mono">Bio (about me):</label>
                                <textarea
                                    rows={3}
                                    value={profile.bio}
                                    onChange={e => setProfile({...profile, bio: e.target.value})}
                                    maxLength={200}
                                    className="w-full bg-brand-bg border border-brand-border rounded-xl p-4 text-xs text-brand-text focus:border-brand-accent/40 outline-none resize-none"
                                />
                                <p className="text-[10px] text-brand-text-muted text-right">{profile.bio.length}/200</p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-brand-text-muted font-mono">External Uplink (Portfolio)</label>
                                <div className="relative flex items-center">
                                    <Globe size={13} className="absolute left-4 text-brand-text-muted" />
                                    <input 
                                        type="text"
                                        value={profile.website}
                                        onChange={e => setProfile({...profile, website: e.target.value})}
                                        className="w-full bg-brand-bg border border-brand-border rounded-xl pl-10 pr-4 py-2.5 text-brand-text focus:border-brand-accent/40 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-5 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white text-xs font-bold transition-all shadow-md shadow-brand-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? "Saving..." : "Update Changes"}
                                </button>

                                {showSuccess && (
                                    <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                                        <Check size={14} /> Saved
                                    </span>
                                )}
                            </div>
                        </form>
                    )}

                    {activeTab === "appearance" && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-md font-black text-brand-text">Visual Mode Configuration</h3>
                                <p className="text-xs text-brand-text-muted">Modify global color tokens across layout view containers</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {(["light", "dark", "cyberpunk", "rose"] as ThemeMode[]).map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => setTheme(mode)}
                                        className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-28 relative group transition-all capitalize ${theme === mode ? "bg-brand-bg border-brand-accent shadow-md shadow-brand-accent/40 text-brand-text" : "bg-brand-bg/40 border-brand-border text-brand-text-muted hover:border-brand-border"}`}
                                    >
                                        <div className="flex justify-between items-start w-full">
                                            <span className="text-xs font-bold tracking-wide">{mode} Mode</span>
                                            {theme === mode && (
                                                <span className="p-1 rounded-md bg-brand-accent/10 border border-brand-accent/30 text-brand-accent">
                                                    <Check size={10} />
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-1.5">
                                            <div className={`h-3 w-3 rounded-full ${mode === "light" ? "bg-slate-200" : mode === "dark" ? "bg-brand-bg border border-brand-border" : "bg-purple-950"}`} />
                                            <div className={`h-3 w-3 rounded-full ${mode === "light"  ? "bg-purple-600" : mode === "dark" ? "bg-violet-500" : "bg-teal-400"}`} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "security" && (
                        <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-xl">
                            <div>
                                <h3 className="text-md font-black text-brand-text ">Access Verification Keys</h3>
                                <p className="text-xs text-brand-text-muted">Cycle active credentials to isolate profile access channels.</p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-brand-text-muted font-mono">Current Access Key</label>
                                <input 
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-2.5 text-xs text-brand-text focus:border-brand-accent/40 outline-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-brand-text-muted font-mono">NEW ACCREDITED PASS KEY</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-2.5 text-xs text-brand-text focus:border-brand-accent/40 outline-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-brand-text-muted font-mono">Confirm New Passkey</label>
                                <input 
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-2.5 text-xs text-brand-text focus:border-brand-accent/40 outline-none" 
                                />
                            </div>

                            <button type="submit" className="px-5 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white text-xs font-bold transition-all">
                                Update Access Credentials
                            </button>
                        </form>
                    )}

                    {activeTab === "notifications" && (
                        <div className="space-y-6 max-w-xl">
                            <div>
                                <h3 className="text-md font-black text-brand-text">Signal Routing Metrics</h3>
                                <p className="text-xs text-brand-text-muted">Configure layout parameters for alerts and peripheral statuses.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-bg/40 border border-brand-border">
                                    <div className="pr-4">
                                        <h4 className="text-xs font-bold text-brand-text">Incoming Signal Alerts</h4>
                                        <p  className="text-[11px] text-brand-text-muted mt-0.5">Push peripheral desktop banners when incoming real-time direct packet data transfers land.</p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setNotifications({...notifications, dmAlerts: !notifications.dmAlerts})}
                                        className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 outline-none flex-shrink-0 ${notifications.dmAlerts ? "bg-brand-accent" : "bg-brand-surface"}`}
                                    >
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ease-in-out ${notifications.dmAlerts ? "translate-x-5" : "translate-x-0"}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default SettingsPage;