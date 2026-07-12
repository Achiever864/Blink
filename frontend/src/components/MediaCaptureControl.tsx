import React, { useState, useRef, useEffect } from "react";
import { Camera, Video, RotateCw, Trash2, Check, X, ShieldAlert, Sparkles } from "lucide-react";
import { useStatus } from "../context/StatusBarContext";

interface MediaCaptureControlProps {
    onCaptureComplete: (file: File, type: "image" | "video") => void;
    onClose: () => void;
}

type FilterType = "none" | "grayscale" | "sepia" | "vinatage" | "invert";

export const MediaCaptureControl: React.FC<MediaCaptureControlProps> = ({
    onCaptureComplete,
    onClose,
}) => {
    const [mode, setMode] = useState<"image" | "video">("image");
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [permissionError, setPermissionError] = useState<string | null>(null);

    //recording states
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);

    const [previewUrl, setPreviewUrl] = useState<string | null> (null);
    const [rotation, setRotation] = useState<number>(0);
    const [activeFilter, setActiveFilter] = useState<FilterType>("none");

    //DOM Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const videoChunksRef = useRef<Blob[]>([]);
    const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const { showStatus } = useStatus();

    useEffect(() => {
        initCamera();
        return () => stopStream();
    }, [mode]);

    useEffect(() => {
        if(isRecording){
            durationIntervalRef.current = setInterval(() => {
                setRecordingDuration((prev) => prev + 1);
            }, 1000);
        } else{
            if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
            setRecordingDuration(0);
        }
        return () => {
            if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
        };
    }, [isRecording]);

    const initCamera = async () => {
        stopStream();
        setPermissionError(null);
        try{
            const constraints: MediaStreamConstraints = {
                video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: mode === 'video',
            };

            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(mediaStream);
            if (videoRef.current){
                videoRef.current.srcObject = mediaStream;
            }
        } catch(error){
            showStatus("Camera access failure!")
            setPermissionError("Could not access device camera or audio. Check your system permission.")
        }
    };

    const stopStream = () => {
        if (stream){
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current) return;
        const video = videoRef.current;

        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');

        if (ctx){
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
            setPreviewUrl(dataUrl);
            stopStream();
        }
    };

    const startRecording = () => {
        if (!stream) return;
        videoChunksRef.current = [];

        const options = { mimeType: "video/webm;codecs=v9,opus" };
        //Fallback if browser doesn't render v9
        const recorder = MediaRecorder.isTypeSupported(options.mimeType)
            ? new MediaRecorder(stream, options)
            : new MediaRecorder(stream);

        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0){
                videoChunksRef.current.push(e.data);
            }
        };

        recorder.onstop = () => {
            const videoBlob = new Blob(videoChunksRef.current, { type: "video/mp4" });
            const videoUrl = URL.createObjectURL(videoBlob);

            setPreviewUrl(videoUrl);
            stopStream();
        };

        recorder.start();
        setIsRecording(true);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop ();
            setIsRecording(false);
        }
    };

    const handleCommitMedia = async () => {
        if (!previewUrl) return;

        if (mode === 'image'){
            const img = new Image();
            img.src = previewUrl;
            img.onload= () => {
                const canvas = document.createElement("canvas");
                const isRotatedOrtho = rotation === 90 || rotation === 270;

                canvas.width = isRotatedOrtho ? img.height : img.width;
                canvas.height = isRotatedOrtho ? img.width : img.height;

                const ctx = canvas.getContext('2d');
                if (ctx){
                    let filterString = "";
                    if (activeFilter === "grayscale") filterString = "grayscale(100%)";
                    if (activeFilter === "sepia") filterString = "sepia(100%)";
                    if (activeFilter === "vinatage") filterString = "sepia(50%) contrast(120%) hue-rotate(-20deg)";
                    if (activeFilter === "invert") filterString = "invert(100%)";
                    ctx.filter = filterString;

                    ctx.translate(canvas.width/2, canvas.height/2);
                    ctx.rotate((rotation * Math.PI) / 180);
                    ctx.drawImage(img, -img.width / 2, -img.height / 2);

                    canvas.toBlob((blob) => {
                        if (blob){
                            const file = new File([blob], `snap_${Date.now()}.jpg`, { type: "image/jpeg" });
                            onCaptureComplete(file, "image");
                        }
                    }, "image/jpeg", 0.9)
                };
            }
        } else{
            //for video clips, we fetch back the compiled video blob pointer
            const response = await fetch(previewUrl);
            const blob = await response.blob();
            const file = new File([blob], `clip_${Date.now()}.mp4`, {type: "video/mp4" });
            onCaptureComplete(file, "video");
        }
    };

    const resetCaptureZone = () => {
        setPreviewUrl(null);
        setRotation(0);
        setActiveFilter("none");
        initCamera();
    };

    const getFilterCSS = () => {
        if (activeFilter === "grayscale") return "grayscale";
        if (activeFilter === "sepia") return "sepia";
        if (activeFilter === "vinatage") return "sepia-[0.5] contrast-125 hue-rotate-[-20deg]";
        if (activeFilter === "invert") return "invert";
        return "";
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-900 bg-slate-900/40 shadow-2xl flex flex-col relative">

                {/*Header Segment */}
                <div className="flex items-center justify-between border-b border-slate-900 px-6 py-4 bg-slate-950/40">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold font-mono tracking-tight text-slate-200">
                            {previewUrl ? "Edit & Polish Media" : "Live Media Capture"}
                        </h3>
                        </div>
                        <button onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-900 hover:text-slate-200 transition-all outline-none">
                            <X size={16} />
                        </button>
                    </div>

                    <div className="bg-slate-950 relative aspect-video flex items-center justify-center overflow-hidden">
                        {permissionError && (
                            <div className="flex flex-col items-center gap-3 max-w-sm px-6 text-center">
                                <ShieldAlert className="text-rose-500" size={32} />
                                <p className="text-xs font-mono text-slate-400">{permissionError}</p>
                                <button onClick={initCamera} className="mt-2 text-xs font-bold text-violet-400 hover:underline">Retry Connection</button>
                            </div>
                        )}

                        {!previewUrl && !permissionError && (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover scale-x-[-1]"
                            />
                        )}

                        {/*Recapture or Preview modification stage */}
                        {previewUrl && (
                            <div className="w-full h-full flex items-center justify-center bg-slate-950">
                                {mode === "image" ? (
                                    <img 
                                        src={previewUrl}
                                        alt="Capture Video"
                                        style={{ transform: `rotate(${rotation}deg)`}}
                                        className={`w-full h-full object-contain transition-transform duration-200 ${getFilterCSS()}`}
                                    />
                                ) : (
                                    <video src={previewUrl} autoPlay loop controls className="w-full h-full object-contain" />
                                )}
                            </div>
                        )}

                        {isRecording && (
                            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 font-mono text-[10px] text-rose-400 font-bold tracking-widest uppercase animate-pulse">
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                <span>REC 00:{recordingDuration.toString().padStart(2, "0")}</span>
                            </div>
                        )}
                    </div>

                    {/*Control Hub */}
                    <div className="p-6 bg-slate-950/40 border-t border-slate-900 space-y-4">
                        {/*Phase A: Live stream */}
                        {!previewUrl && !permissionError && (
                            <div className="flex items-center justify-between">
                                <div className="flex bg-slate-950 border border-slate-900 rounded-xl p-1">
                                    <button
                                        type="button"
                                        disabled={isRecording}
                                        onClick={() => setMode("image")}
                                        className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all outline-none disabled:opacity-30 ${
                                            mode === "image" ? "bg-slate-900 text-white border border-slate-800/60 shadow" : "text-slate-500 hover:text-slate-300"
                                        }`}
                                    >
                                        <Camera size={13} />
                                        Photo
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isRecording}
                                        onClick={() => setMode('video')}
                                        className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all outline-none disabled:opacity-30 ${
                                            mode === "video" ? "bg-slate-900 text-white border border-slate-800/60 shadow" : "text-slate-500 hover:text-slate-300"
                                        }`}
                                    >
                                        <Video size={13} />
                                        Video
                                    </button>
                                </div>

                                <div>
                                    {mode === "image" ? (
                                        <button 
                                            onClick={capturePhoto}
                                            className="h-14 w-14 rounded-full border-4 border-slate-900 bg-white shadow-xl shadow-slate-950 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 outline-none"
                                        />
                                    ) : (
                                        <button 
                                            onClick={isRecording ? stopRecording : startRecording}
                                            className={`h-14 w-14 rounded-full border-4 border-slate-900 shadow-xl shadow-slate-950 flex items-center justify-center transition-all hover:scale-105 active:scale-95 outline-none ${
                                                isRecording ? "bg-rose-500 rounded-2xl scale-95" : "bg-indigo-600"
                                            }`}
                                        />
                                    )}
                                </div>
                                <div className="w-24" />
                            </div>
                        )}

                        {previewUrl && (
                            <div className="space-y-4">
                                {mode === "image" && (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                                            {(["none", "grayscale", "sepia", "vintage", "invert"] as FilterType[]).map((filter) => (
                                                <button
                                                    key={filter}
                                                    onClick={() => setActiveFilter(filter)}
                                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold capitalize transition-all border outline-none whitespace-nowrap ${
                                                        activeFilter === filter
                                                            ? "bg-violet-600 border-violet-400/40 text-white"
                                                            : "bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200" 
                                                    }`}
                                                >
                                                    {filter}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-900 rounded-xl text-[10px] font-bold font-mono text-slate-400 hover:text-slate-200 transition-all outline-none"
                                            >
                                                <RotateCw size={11} />
                                                Rotate 90 deg
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-2 border-t border-slate-900/60">
                                    <button
                                        onClick={resetCaptureZone}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-slate-400 hover:text-rose-400 border border-slate-800/40 rounded-xl text-xs font-bold transition-all outline-none"
                                    >
                                        <Trash2 size={13} />
                                        Delete
                                    </button>

                                    <button
                                        onClick={handleCommitMedia}
                                        className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl text-xs font-bold text-white shadow-lg shadow-violet-600/10 transition-all hover:scale-[1.01] active:scale-[0.99] outline-none font-mono"
                                    >
                                        <Check size={13} />
                                        Process & Send
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
    );
};