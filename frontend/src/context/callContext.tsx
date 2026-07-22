import React, { createContext, useContext, useState, useRef, useCallback } from "react";
import socket from "../socket";
import { useAuth } from "./AuthContext";

type CallType = "audio" | "video";
type CallStatus = "idle" | "calling" | "ringing" | "active";

interface IncomingCall {
    from: string;
    fromUsername: string;
    offer: RTCSessionDescriptionInit;
    callType: CallType;
}

interface CallContextType {
    callStatus: CallStatus;
    callType: CallType | null;
    incomingCall: IncomingCall | null;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    startCall: (targetUserId: string, targetUsername: string, type: CallType) => Promise<void>;
    acceptCall: () => Promise<void>;
    rejectCall: () => void;
    endCall: () => void;
    isMicMuted: boolean;
    isCameraOff: boolean;
    toggleMic: () => void;
    toggleCamera: () => void;
    remoteUsername: string | null;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

// Free public STUN server — helps peers discover their public IP for NAT traversal.
// For production reliability behind stricter NATs/firewalls, you'll eventually
// want a TURN server too (e.g. via a service like Twilio or coturn self-hosted).
const ICE_SERVERS = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();

    const [callStatus, setCallStatus] = useState<CallStatus>("idle");
    const [callType, setCallType] = useState<CallType | null>(null);
    const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [remoteUsername, setRemoteUsername] = useState<string | null>(null);

    const peerRef = useRef<RTCPeerConnection | null>(null);
    const targetUserIdRef = useRef<string | null>(null);
    const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

    const cleanup = useCallback(() => {
        localStream?.getTracks().forEach(track => track.stop());
        peerRef.current?.close();
        peerRef.current = null;
        targetUserIdRef.current = null;
        pendingCandidatesRef.current = [];
        setLocalStream(null);
        setRemoteStream(null);
        setCallStatus("idle");
        setCallType(null);
        setIncomingCall(null);
        setIsMicMuted(false);
        setIsCameraOff(false);
        setRemoteUsername(null);
    }, [localStream]);

    const createPeerConnection = useCallback((targetUserId: string) => {
        const peer = new RTCPeerConnection(ICE_SERVERS);

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("call:ice-candidate", { to: targetUserId, candidate: event.candidate });
            }
        };

        peer.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
        };

        peer.onconnectionstatechange = () => {
            if (peer.connectionState === "disconnected" || peer.connectionState === "failed") {
                cleanup();
            }
        };

        return peer;
    }, [cleanup]);

    const startCall = useCallback(async (targetUserId: string, targetUsername: string, type: CallType) => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: type === "video"
        });

        setLocalStream(stream);
        setCallType(type);
        setCallStatus("calling");
        setRemoteUsername(targetUsername);
        targetUserIdRef.current = targetUserId;

        const peer = createPeerConnection(targetUserId);
        stream.getTracks().forEach(track => peer.addTrack(track, stream));
        peerRef.current = peer;

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        socket.emit("call:offer", {
            to: targetUserId,
            from: user?.id,
            offer,
            callType: type
        });
    }, [user?.id, createPeerConnection]);

    const acceptCall = useCallback(async () => {
        if (!incomingCall) return;

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: incomingCall.callType === "video"
        });

        setLocalStream(stream);
        setCallType(incomingCall.callType);
        setCallStatus("active");
        setRemoteUsername(incomingCall.fromUsername);
        targetUserIdRef.current = incomingCall.from;

        const peer = createPeerConnection(incomingCall.from);
        stream.getTracks().forEach(track => peer.addTrack(track, stream));
        peerRef.current = peer;

        await peer.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));

        //flush any ICE candidate that arrived before we were ready
        for (const candidate of pendingCandidatesRef.current){
            await peer.addIceCandidate(new RTCIceCandidate(candidate));
        }
        pendingCandidatesRef.current = [];
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        socket.emit("call:answer", { to: incomingCall.from, answer });
        setIncomingCall(null);
    }, [incomingCall, createPeerConnection]);

    const rejectCall = useCallback(() => {
        if (incomingCall) {
            socket.emit("call:reject", { to: incomingCall.from });
        }
        setIncomingCall(null);
    }, [incomingCall]);

    const endCall = useCallback(() => {
        if (targetUserIdRef.current) {
            socket.emit("call:end", { to: targetUserIdRef.current });
        }
        cleanup();
    }, [cleanup]);

    const toggleMic = useCallback(() => {
        if (!localStream) return;
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            setIsMicMuted(!audioTrack.enabled);
        }
    }, [localStream]);

    const toggleCamera = useCallback(() => {
        if (!localStream) return;
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            setIsCameraOff(!videoTrack.enabled);
        }
    }, [localStream]);

    // Wire up socket listeners once, on mount
    React.useEffect(() => {
        socket.on("call:incoming", ({ from, offer, callType }) => {
            // We don't have the caller's username from this payload alone —
            // MessagePage/ChatWindow should pass it in via a lookup, or the
            // backend's call:offer relay should include it. Flagged below.
            setIncomingCall({ from, fromUsername: "Someone", offer, callType });
            setCallStatus("ringing");
        });

        socket.on("call:answer", async ({ answer }) => {
            if (peerRef.current) {
                await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));

                //flush here too
                for (const candidate of pendingCandidatesRef.current){
                    await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                }
                pendingCandidatesRef.current = [];
                setCallStatus("active");
            }
        });

        socket.on("call:ice-candidate", async ({ candidate }) => {
            if (peerRef.current && peerRef.current.remoteDescription) {
                try {
                    await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (err) {
                    console.error("Failed to add ICE candidate:", err);
                }
            } else {
                pendingCandidatesRef.current.push(candidate);
            }
        });

        socket.on("call:ended", () => {
            cleanup();
        });

        socket.on("call:rejected", () => {
            cleanup();
        });

        return () => {
            socket.off("call:incoming");
            socket.off("call:answer");
            socket.off("call:ice-candidate");
            socket.off("call:ended");
            socket.off("call:rejected");
        };
    }, [cleanup]);

    return (
        <CallContext.Provider value={{
            callStatus, callType, incomingCall, localStream, remoteStream,
            startCall, acceptCall, rejectCall, endCall,
            isMicMuted, isCameraOff, toggleMic, toggleCamera, remoteUsername
        }}>
            {children}
        </CallContext.Provider>
    );
};

export const useCall = () => {
    const context = useContext(CallContext);
    if (!context) throw new Error("useCall must be used inside a CallProvider");
    return context;
};