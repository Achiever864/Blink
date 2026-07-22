import React, {useEffect, useRef} from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { useCall } from "../context/callContext";

const ActiveCallModal: React.FC = () => {
    const {
        callStatus, callType, localStream, remoteStream, remoteUsername,
        isMicMuted, isCameraOff, toggleMic, toggleCamera, endCall
    } = useCall();

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const remoteAudioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (localVideoRef.current && localStream){
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (callType === "video" && remoteVideoRef.current && remoteStream){
            remoteVideoRef.current.srcObject = remoteStream;
        }

        if(callType === "audio" && remoteAudioRef.current && remoteStream){
            remoteAudioRef.current.srcObject = remoteStream;
        }
    }, [remoteStream, callType]);

    if (callStatus === "idle" || callStatus === "ringing") return null;

    return(
        <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950">
            {callType === "video" ? (
                <div className="relative flex-1 bg-black">
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <video
                        ref={localVideoRef} 
                        autoPlay
                        playsInline
                        muted
                        className="absolute top-4 right-4 w-28 h-40 rounded-2xl object-cover border border-white/20 shadow-xl"
                    />
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                    <audio ref={remoteAudioRef} autoPlay />
                    <div className="h-24 w-24 rounded-full bg-brand-accent/10 border-brand-accent/20 flex items-center justify-center text-2xo font-black text-brand-accent uppercase">
                        {remoteUsername?.substring(0,2) || "??"}
                    </div>
                    <h3 className="text-lg font-bold text-white">{remoteUsername}</h3>
                    <p className="text-xs text-slate-500 font-mono">
                        {callStatus === "calling" ? "Calling..." : "In call"}
                    </p>
                </div>
            )}

            <div className="p-6 flex items-center justify-center gap-4 bg-slate-950/80">
                <button
                    onClick={toggleMic}
                    className={`h-12 w-12 rounded-full flex items-center justify-center transiton-all ${
                        isMicMuted ? "bg-white text-slate-950" : "bg-white/10 text-white"
                    }`}
                >
                    {isMicMuted ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                {callType === "video" && (
                    <button
                        onClick={toggleCamera}
                        className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${
                            isCameraOff ? "bg-white text-slate-950" : "bg-white/10 text-white"
                        }`}
                    >
                        {isCameraOff ? <VideoOff size={18} /> : <Video size={18} />}
                    </button>
                )}
                <button
                    onClick={endCall}
                    className="h-14 w-14 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center text-white shadow-lg transition-all"
                >
                    <PhoneOff size={22} />
                </button>
            </div>
        </div>
    );
};

export default ActiveCallModal;