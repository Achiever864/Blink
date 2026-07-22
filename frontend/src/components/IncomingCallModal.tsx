import React from "react";
import { Phone, PhoneOff, Video } from "lucide-react";
import { useCall } from "../context/callContext";

const IncomingCallModal: React.FC = () => {
    const { incomingCall, acceptCall, rejectCall, callType } = useCall();

    if (!incomingCall) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
            <div className="w-full max-w-sm rounded-3xl border border-brand-border bg-brand-surface/60 shadow-2xl p-8 text-center space-y-6">
                <div className="h-20 w-20 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center mx-auto animate-pulse">
                    {callType === "video" ? <Video size={28} className="text-brand-accent" /> : <Phone size={28} className="text-brand-accent" />}
                </div>

                <div>
                    <p className="text-xs text-brand-text-muted font-mono uppercase tracking-wider mb-1">
                        Incoming {callType} call
                    </p>
                    <h3 className="text-lg font-bold text-brand-text">{incomingCall.fromUsername}</h3>
                </div>

                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={rejectCall}
                        className="h-14 w-14 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center text-white shadow-lg transition-all hover:scale-105 active:scale-95"
                    >
                        <PhoneOff size={22} />
                    </button>
                    <button
                        onClick={acceptCall}
                        className="h-14 w-14 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white shadow-lg transition-all hover:scale-105 active:scale-95"
                    >
                        <Phone size={22} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IncomingCallModal;