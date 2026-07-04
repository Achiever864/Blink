import React, { useState } from "react";
import {
    User, Palette, Lock, Bell, Globe, Shield, Check
} from "lucide-react";
import {
    useTheme, ThemeMode
}   from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

type SettingsTab = "profile" | "appearance" | "security" | "notifications";

const SettingsPage: React.FC = () => {
    const { theme, setTheme } = useTheme();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

    //Identity Matrix & uplinks state
    const [profile, setProfile] = useState({
        displayName: user?.displayName || "Alex Rivers",
        username: user?.username || "cyber_architect",
        email: user?.email || "architect@blink.dev",
        bio: "Building the future of decentralized interfaces.",
        website: "https://blink.dev/architect"
    });

    //Security state
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

    const handleProfileSave = (e: React.FormEvent) =>  {
        e.preventDefault();
        console.stringify("Syncing profile changes", profile);
    };

    const handlePasswordUpdate = (e: React.FormEvent) =>  {
        e.preventDefault();
        console.log("Re-authenticating access token and updating credentials");
    };

    return(
        <div className="min-h-screen bg-slate-950 text-slate-200 flex justify-center py-10 px-4 md:px-8">
            <div className="w-full max-w-5xl bg-slate-900/40 border border-slate-900 rounded-3xl flex flex-col md:flex-row overflow-hidden backdrop-blur-md min-h-[70vh]">

                {/*Left Navigation Rail */}
                <aside className="w-full md:w-64 bg-slate-950/60 p-6 border-b md:border-b-0 md:border-r border-slate-900/60 flex flex-col gap-1">
                    <div className="mb-6 px-2">
                        <h2 className="text-sm font-black tracking-wider text-white uppercase">Control Center</h2>
                        <p className="text-[10px] text-slate-500 font-mono">System Configuration Matrix</p>
                    </div>

                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all ${activeTab === "profile" ? "bg-violet-600/10 text-violet-400 border border-violet-500/20" : "text-slate-400 hover:text-slate-200 border border-transparent" }`}
                    >
                        <User size={15} />
                        <span>Identity Matrix</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("appearance")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all ${activeTab === "appearance" ? "bg-violet-600/10 text-violet-400 border border-violet-500/20" : "text-slate-400 hover:text-slate-200 border border-transparent"}`}
                    >
                        <Palette size={15} />
                        <span>Visual Engine</span>
                    </button>

                    <button
                        onClick ={() => setActiveTab("security")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all ${activeTab === 'notifications' ? "bg-violet-600/10 text-violet-4000 border border-violet-500/20" : "text-slate-400 hover:text-slate-200 border border-transparent"}`}
                    >
                        <Bell size={15} />
                        <span>Signal Filters</span>
                    </button>
                </aside>

                {/*Right panel workspace */}
                <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                    {/*Identity Matrix */}
                    {activeTab === "profile" && (
                        <form onSubmit={handleProfileSave} className="space-y-6 max-w-xl">
                            <div>
                                <h3 className="text-md font-black text-white">Identify Configuration</h3>
                                <p className="text-xs text-slate-500">Update your profile metadata parameters</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 font-mono"> Display Name</label>
                                    <input
                                        type="text"
                                        value={profile.displayName}
                                        onChange={e => setProfile({...profile, displayName: e.target.value})}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:border-violet-500/40 outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 font-mono">Operator Handle</label>
                                    <div className="relative flex items-center">
                                        <span className="absolute left=4 text-xs font-mono text-slate-600">@</span>
                                        <input 
                                            type="text"
                                            value={profile.username}
                                            onChange={e => setProfile({...profile, username: e.target.value})}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-2.5 text-xs text-slate-200 focus:border-violet-500/40 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-400 font-mono">COMS LINK (EMAIL)</label>
                                <input
                                    type="text"
                                    value={profile.email}
                                    onChange={e => setProfile({...profile, email: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-400 cursor-not-allowed outline-none"
                                    disabled
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-400 font-mono">Bio (about me):</label>
                                <textarea
                                    rows={3}
                                    value={profile.bio}
                                    onChange={e => setProfile({...profile, bio: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 focus:border-violet-500/40 outline-none resize-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-400 font-mono">External Uplink (Portfolio)</label>
                                <div className="relative flex items-center">
                                    <Globe size={13} className="absolute left-4 text-xs text-slate-600" />
                                    <input 
                                        type="text"
                                        value={profile.website}
                                        onChange={e => setProfile({...profile, website: e.target.value})}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 focus:border-violet-500/40 outline-none"
                                    />
                                </div>
                            </div>

                            <button type="submit" className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md shadow-violet-950/20">
                                Synchronize Profile Changes
                            </button>
                        </form>
                    )}
                </main>
            </div>
        </div>
    )
}