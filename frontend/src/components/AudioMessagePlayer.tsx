import React, { useRef, useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";

interface AudioMessagePlayerProps {
    url: string;
    isMe: boolean;
}

const AudioMessagePlayer: React.FC<AudioMessagePlayerProps> = ({ url, isMe }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleLoadedMetadata = () => setDuration(audio.duration);
        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
            audio.removeEventListener("ended", handleEnded);
        };
    }, []);

    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const progressPercent = duration ? (currentTime / duration) * 100 : 0;

    return (
        <div className="flex items-center gap-2.5 mt-1 min-w-[200px]">
            <audio ref={audioRef} src={url} preload="metadata" />

            <button
                type="button"
                onClick={togglePlay}
                className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                    isMe ? "bg-white/20 hover:bg-white/30" : "bg-brand-accent hover:bg-brand-accent-hover"
                }`}
            >
                {isPlaying ? (
                    <Pause size={14} className="text-white" fill="currentColor" />
                ) : (
                    <Play size={14} className="text-white ml-0.5" fill="currentColor" />
                )}
            </button>

            <div className="flex-1 flex flex-col gap-1">
                <div
                    className={`h-1 rounded-full overflow-hidden cursor-pointer ${
                        isMe ? "bg-white/20" : "bg-slate-700"
                    }`}
                    onClick={(e) => {
                        const audio = audioRef.current;
                        if (!audio || !duration) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickRatio = (e.clientX - rect.left) / rect.width;
                        audio.currentTime = clickRatio * duration;
                    }}
                >
                    <div
                        className={`h-full rounded-full transition-all ${isMe ? "bg-white" : "bg-violet-400"}`}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                <span className={`text-[10px] font-mono ${isMe ? "text-white/70" : "text-brand-text-muted"}`}>
                    {formatTime(isPlaying || currentTime > 0 ? currentTime : duration)}
                </span>
            </div>
        </div>
    );
};

export default AudioMessagePlayer;