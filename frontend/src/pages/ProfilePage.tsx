import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
    Home, MessageSquare, Bell, User, LogOut, Camera,
    Settings, Shield, Save, CheckCircle, Globe, Link2
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfilePage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    //Tabs state: "activity" or "settings"
    const [activeTab, setActiveTab] = useState<"activity" | "settings">("activity");

    //Form states for updating information
    const [username, setUsername] = useState(user?.username || "cyber_architect");
    const [displayName, setDisplayName] = useState("Alex Rivers");
    const [bio, setBio] = useState("Building the future of decentralized interfaces. Hyper-focused on design systems, web logic, and low-level engineering.");
    const [website, setWebsite] = useState("blink.dev/architect");

    //UI Status states
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleUpdateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);


    };

    return(
        <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center overflow-hidden">
            {/*Ambient Background Glows */}
            <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-o left-1/4 h-[600px] w-[600px] rounded-full bg-violet-600/5 blur-[150px] pointer-events-none" />

            <div className="w-ful max-w-7xl grid grid-cols-1 md:grid-cols-[80px_1fr] lg:grid-cols-[240px_1fr_360px] px-4 gap-6 relative z-10">
                {/*Left Column: same main app sidebar Navigation (I should make this into a reusable component later on) */}
                <aside className="hidden md:flex flex-col justify-between py-6 border-r border-slate-900/60 pr-4">
                    <div className="space-y-8">
                        {/*Top Badge*/}
                        <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-lg shadow-violet-600/20 lg:mx-0 mx-auto cursor-pointer"
                            onClick={() => navigate("/feed")}
                        >
                            <span className="text-xl font-black text-white transform -skew-x-3">B</span>
                            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-white" />
                        </div>

                        {/*Nav Stack */}
                        <nav className="space-y-2">
                            <button onClick={() => navigate("/feed")} className="flex items-center gap-4 w-full p-3 rounded-xl text-slate-400 hover:bg-slate-900/50 hover:text-slate-200 transition-all">
                                <Home size={22} />
                                <span className="hidden lg:inline text-sm">Timeline</span>
                            </button>

                            <button onClick={() => navigate("/message")} className="flex items-center gap-4 w-full p-3 rounded-xl text-slate-400 hover:bg-slate-900/50 hover:text-slate-200 transition-all">
                                <MessageSquare size={22} />
                                <span className="hidden lg:inline text-sm">Message</span>
                            </button>

                            <button className="flex items-center gap-4 w-full p-3 rounded-xl text-slate-400 hover:bg-slate-900/50 hover:text-slate-200 transition-all">
                                <Bell size={22} />
                                <span className="hidden lg:inline text-sm">Notifications</span>
                            </button>

                            <button className="flex items-center gap-4 w-full p-3 rounded-xl bg-violet-600/10 text-violet-400 font-semibold transition-all">
                                <User size={22} />
                                <span className="hidden lg:inline text-sm">Profile</span>
                            </button>
                        </nav>
                    </div>

                    {/*Logout segment */}
                    <button onClick={logout} className="flex items-center gap-4 w-full p-3 rounded-xl text-rose-400 hover:bg-rose-950/20 transition-all duration-200">
                        <LogOut size={22} />
                        <span className="hidden lg:inline text-sm font-medium">Logout</span>
                    </button>
                </aside>


                {/*Middle column: profile Interface & Form Logic*/}
                <main className="py-6 overflow-y-auto max-h-screen no-scrollbar space-y-6">
                    {/*Hero Header Banner Card */}
                    <div className="relative rounded-3xl border border-slate-900 bg-slate-900/10 backdrop-blur-md overflow-hidden p-6 pb-4">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-violet-900/40 via-indigo-900/20 to-transparent border-b border-slate-900/40" />

                        {/*Profile Identity Layour */}
                        <div className="relative flex flex-col sm:flex-row items-start sm:itemss-end justify-between gap-4 mt-8">
                            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                                {/*Avater with overlay edit trigger */}
                                <div className="relative group h-20 w-20 rounded-2xl bg-graditent-to-tr from-violet-600 to-indigo-600 border border-violet-400/30 flex items-center justify-center text-white font-black text-2xl uppercase shadow-xl shadow-violet-950/50">
                                    {username.substring(0,2)}
                                    <div className="absolute inset-0 bg-slate-950/70 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <Camera size={18} className="text-slate-200" />
                                    </div>
                                </div>

                                <div className="pb-1">
                                    <h2 className="text-xl font-bold text-white tracking-tight">{displayName}</h2>
                                    <p className="text-sm text-violet-400 font-medium">@{username}</p>
                                </div>
                            </div>

                            {/*View selector tabs right in the hero banner */}
                            <div className="flex bg-slate-950 border border-slate-900 rounded-xl p-1 w-full sm:w-auto">
                                <button onClick={() => setActiveTab("settings")}
                                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === "settings" ? "bg-slate-900 text-white shadow" : "text-slate-500 hover:text-slate-300"}`}
                                    >
                                        <Settings size={13} />
                                        Settings
                                </button>
                            </div>
                        </div>

                        {/*Static Iddentity Elements */}
                        <div className="mt-6 pt-4 border-t border-slate-900/60 space-y-3">
                            <p className="text-sm text-slate-300 leading-relaxed max-w-xl">{bio}</p>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                {website && (
                                    <a href={`https://${website}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-violet-400 transition-colors">
                                        <Link2 size={13} />
                                        <span>{website}</span>
                                    </a>
                                )}

                                <span className="flex items-center gap-1">
                                    <Shield size={13} className="text-violet-500/80" />
                                    <span>Verified Operator</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/*Dynamic Tab Engine Content Rendering */}
                    {activeTab === "activity" ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Personal Transmissions</h3>
                            </div>


                            {/*Empty state stream representation */}
                            <div className="rounded-3xl border border-slate-900/60 bg-slate-900/5 p-8 text-center space-y-2">
                                <p className="text-sm text-slate-400 font-medium">No archived broadcasts found on this terminal loop.</p>
                                <p className="text-xs text-slate-600">Transmissions you post to your stram will mirror back onto this sector.</p>
                            </div>
                        </div>
                    ): (
                        /*Update profile information module */
                        <form onSubmit={handleUpdateProfile} className="space-y-6 animate-fade-in">
                            <div className="rounded-3xl border border-slate-900 bg-slate-950 p-6 space-y-6 shadow-xl">
                                <div>
                                    <h3 className="text-base font-bold text-slate-200">System Information</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Configure parameters mapped directly to your user token profile.</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/*Display Name Input */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Display Name</label>
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            className="w-full bg-slate-900/40 border border-slate-900 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-700 outline-none focus:border-violet-500/40 transition-all"
                                            required
                                        />
                                    </div>

                                    {/*Handle username input */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">System Handle</label>

                                        <div className="relative flex items-center">
                                            <span className="absolute left-4 text-sm font-semibold text-slate-600">@</span>
                                            <input 
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="w-full bg-slate-900/40 border border-slate-900 rounded-xl pl-8 pr-4 py-3 text-sm text-slate-200 outline-none focus:border-violet-500/40 transition-all"
                                                required    
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/*Link input */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide "> Eternal Broadcast Link (Website)</label>
                                    <div className="relative flex items-center">
                                        <Globe size={14} className="absolute left-4 text-slate-600" />
                                        <input
                                            type="text"
                                            value={website}
                                            onChange={(e) => setWebsite(e.target.value)}
                                            placeholder="yourportfolio.dev"
                                            className="w-full bg-slate-900/40 border border-slate-900 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-200 outline-none focus:border-violet-500/40 transition-all"   
                                        />
                                    </div>
                                </div>

                                {/*Bio Input */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">User Transmission Bio</label>
                                    <textarea 
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        rows={4}
                                        className="w-full bg-slate-900/40 border border-slate-900 rounded-xl p-4 text-sm text-slate-200 outline-none focus:border-violet-500/40 transition-all resize-none leading-relaxed"
                                    />
                                </div>

                                {/*Form Submit Strip */}
                                <div className="flex items-center justify-between pt-4 border-t border-slate-900/60">
                                    <div>
                                        {showSuccess && (
                                            <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold animate-pulse">
                                                <CheckCircle size={14} />
                                                <span>Profile records successfully synced.</span>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl text-xs font-bold text-white shadow-lg shadow-violet-600/10 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Save size={14} />
                                        <span>{isSaving ? "Syncing Parameters..." : "Commit Modifications"}</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </main>

                {/*Right Column: static status monitoring sidebar */}
                <aside className="hidden lg:block py-6 border-l border-slate-900/60 pl-6 space-y-6">
                    <div className="rounded-3xl border border-slate-900 bg-slate-900/10 p-5 space-y-4">
                        <h3 className="text-sm font-bold text-slate-200 trcking-wide">Data Node Metrics</h3>

                        <div className="space-y-3">
                            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-900 flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-medium">Node Security Level</span>
                                <span className="text-violeet-400 font-bold uppercase tracking-wider">Level 3</span>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-900 flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-medium">Memory footprint</span>
                                <span className="text-slate-300 font-semibold font-mono">0.14MB</span>
                            </div>
                        </div>
                    </div>
                </aside>


            </div>
        </div>
    )
};

export default ProfilePage;