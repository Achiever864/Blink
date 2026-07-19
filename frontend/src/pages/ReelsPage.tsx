// import React, { useEffect, useRef, useState, useCallback } from "react";
// import { Heart, MessageCircle, Volume2, VolumeX, Play } from "lucide-react";
// import Sidebar from "../components/sideBar";
// import API from "../api/axios";
// import { useAuth } from "../context/AuthContext";
// import { useStatus } from "../context/StatusBarContext";
// import type { Reel } from "../types/reel";

// const ReelsPage: React.FC = () => {
//     const { user } = useAuth();
//     const { showStatus } = useStatus();

//     const [reels, setReels] = useState<Reel[]>([]);
//     const [page, setPage] = useState(1);
//     const [hasMore, setHasMore] = useState(true);
//     const [loading, setLoading] = useState(true);
//     const [activeIndex, setActiveIndex] = useState(0);
//     const [isMuted, setIsMuted] = useState(true);

//     const containerRef = useRef<HTMLDivElement>(null);
//     const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

//     const fetchReels = useCallback(async (pageToFetch: number) => {
//         try {
//             setLoading(true);
//             const res = await API.post(`/post/getReels?page=${pageToFetch}&limit=10`, {});
//             setReels(prev => pageToFetch === 1 ? res.data.reels : [...prev, ...res.data.reels]);
//             setHasMore(res.data.pagination.hasMore);
//         } catch (error: any) {
//             showStatus(error.response?.data?.message || "Failed to load reels", "error");
//         } finally {
//             setLoading(false);
//         }
//     }, [showStatus]);

//     useEffect(() => {
//         fetchReels(1);
//     }, [fetchReels]);

//     // Play whichever reel is currently in view, pause everything else
//     useEffect(() => {
//         const container = containerRef.current;
//         if (!container) return;

//         const observer = new IntersectionObserver(
//             (entries) => {
//                 entries.forEach((entry) => {
//                     const video = entry.target as HTMLVideoElement;
//                     const reelId = video.dataset.reelId;
//                     if (!reelId) return;

//                     if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
//                         video.play().catch(() => {});
//                         const index = reels.findIndex(r => r._id === reelId);
//                         if (index !== -1) setActiveIndex(index);
//                     } else {
//                         video.pause();
//                     }
//                 });
//             },
//             { threshold: [0, 0.6, 1] }
//         );

//         videoRefs.current.forEach((video) => observer.observe(video));

//         return () => observer.disconnect();
//     }, [reels]);

//     // Infinite scroll: load next page once user nears the bottom of what's loaded
//     const handleScroll = () => {
//         const container = containerRef.current;
//         if (!container || loading || !hasMore) return;

//         const nearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - window.innerHeight;
//         if (nearBottom) {
//             const nextPage = page + 1;
//             setPage(nextPage);
//             fetchReels(nextPage);
//         }
//     };

//     const toggleLike = async (postId: string) => {
//         if (!user?.id) return;

//         setReels(prev => prev.map(reel => {
//             if (reel._id !== postId) return reel;
//             const alreadyLiked = reel.likes.includes(user.id);
//             return {
//                 ...reel,
//                 likes: alreadyLiked
//                     ? reel.likes.filter(id => id !== user.id)
//                     : [...reel.likes, user.id]
//             };
//         }));

//         try {
//             await API.post("/post/like", { postId, userId: user.id });
//         } catch (error: any) {
//             setReels(prev => prev.map(reel => {
//                 if (reel._id !== postId) return reel;
//                 const alreadyLiked = reel.likes.includes(user.id);
//                 return {
//                     ...reel,
//                     likes: alreadyLiked
//                         ? reel.likes.filter(id => id !== user.id)
//                         : [...reel.likes, user.id]
//                 };
//             }));
//             showStatus(error.response?.data?.message || "Failed to like", "error");
//         }
//     };

//     const primaryVideo = (reel: Reel) => reel.media.find(m => m.type === "video");

//     return (
//         <div className="min-h-screen bg-black text-slate-100 flex justify-center overflow-hidden">
//             <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-[80px_1fr] px-4 gap-6 relative z-10">
//                 <Sidebar />

//                 <main
//                     ref={containerRef}
//                     onScroll={handleScroll}
//                     className="h-screen py-4 overflow-y-scroll snap-y snap-mandatory no-scrollbar flex flex-col items-center gap-4"
//                 >
//                     {reels.map((reel, index) => {
//                         const video = primaryVideo(reel);
//                         const isLiked = user?.id ? reel.likes.includes(user.id) : false;

//                         return (
//                             <div
//                                 key={reel._id}
//                                 className="relative w-full max-w-[420px] h-[calc(100vh-2rem)] snap-center rounded-3xl overflow-hidden bg-slate-950 border border-slate-900 flex-shrink-0"
//                             >
//                                 {video && (
//                                     <video
//                                         ref={(el) => {
//                                             if (el) videoRefs.current.set(reel._id, el);
//                                             else videoRefs.current.delete(reel._id);
//                                         }}
//                                         data-reel-id={reel._id}
//                                         src={video.url}
//                                         loop
//                                         muted={isMuted}
//                                         playsInline
//                                         onClick={() => setIsMuted(m => !m)}
//                                         className="w-full h-full object-cover cursor-pointer"
//                                     />
//                                 )}

//                                 {/* Mute toggle */}
//                                 <button
//                                     onClick={() => setIsMuted(m => !m)}
//                                     className="absolute top-4 right-4 h-9 w-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white"
//                                 >
//                                     {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
//                                 </button>

//                                 {/* Author + caption overlay */}
//                                 <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
//                                     <div className="flex items-center gap-2 mb-2">
//                                         <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold overflow-hidden">
//                                             {reel.author?.profilePicture?.url ? (
//                                                 <img src={reel.author.profilePicture.url} alt="" className="w-full h-full object-cover" />
//                                             ) : (
//                                                 <span>{reel.author?.username?.substring(0, 2) || "??"}</span>
//                                             )}
//                                         </div>
//                                         <span className="text-xs font-bold">{reel.author?.username || "Unknown"}</span>
//                                     </div>
//                                     <p className="text-xs text-slate-200 leading-relaxed break-words line-clamp-2">
//                                         {reel.caption}
//                                     </p>
//                                 </div>

//                                 {/* Like / comment rail */}
//                                 <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5 text-white">
//                                     <button onClick={() => toggleLike(reel._id)} className="flex flex-col items-center gap-1">
//                                         <Heart
//                                             size={26}
//                                             className={isLiked ? "fill-rose-500 stroke-rose-500" : "fill-none"}
//                                         />
//                                         <span className="text-[10px] font-bold">{reel.likes?.length ?? 0}</span>
//                                     </button>
//                                     <button className="flex flex-col items-center gap-1">
//                                         <MessageCircle size={26} />
//                                         <span className="text-[10px] font-bold">{reel.commentsCount ?? 0}</span>
//                                     </button>
//                                 </div>
//                             </div>
//                         );
//                     })}

//                     {loading && (
//                         <div className="text-xs text-slate-500 font-mono py-6">Loading reels...</div>
//                     )}

//                     {!hasMore && reels.length > 0 && (
//                         <div className="text-xs text-slate-600 font-mono py-6">You've reached the end.</div>
//                     )}

//                     {!loading && reels.length === 0 && (
//                         <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
//                             <Play size={32} className="text-slate-700" />
//                             <p className="text-sm text-slate-400 font-medium">No reels yet</p>
//                         </div>
//                     )}
//                 </main>
//             </div>
//         </div>
//     );
// };

// export default ReelsPage;