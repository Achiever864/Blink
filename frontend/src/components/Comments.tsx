import React, { useState, useEffect } from "react";
import { Send, CornerDownRight, Loader2, MessageSquare } from "lucide-react";
import { useStatus } from "../context/StatusBarContext";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

interface Comment {
    _id: string;
    user: {
        username: string;
        profilePicture?: { url: string } | string;
    };
    content: string;
    createdAt: string;
}

interface PostCommentProps {
    postId: string;
    onCommentAdded?: () => void;
}

export const PostComments: React.FC<PostCommentProps> = ({ postId, onCommentAdded }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useAuth();
    const { showStatus } = useStatus();

    useEffect(() => {
        const fetchComments = async (postId: string) => {
            setIsLoading(true);
            try {
                const res = await API.get(`/comment/get?postId=${postId}`);
                console.log("fetched comment", res.data);

                const list = Array.isArray(res.data)
                    ? res.data
                    : Array.isArray(res.data?.comments)
                        ? res.data.comments
                        : [];

                setComments(list);
            } catch (err) {
                showStatus("Failed to load comments!");
                setComments([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchComments(postId);
    }, [postId]);

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const res = await API.post("/comment/create", {
                postId: postId,
                userId: user?.id,
                content: newComment
            });
            const saved = res.data.comment;

            const createdComment: Comment = {
                _id: saved._id,
                user: {
                    username: user?.username || "You",
                    profilePicture: user?.profilePicture || undefined
                },
                content: saved.content,
                createdAt: saved.createdAt,
            };

            setComments((prev) => [createdComment, ...prev]);
            setNewComment("");
            if (onCommentAdded) onCommentAdded();
        } catch (err) {
            showStatus("Comment failed to send!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getAvatarUrl = (profilePicture?: { url: string } | string) => {
        if (!profilePicture) return "";
        return typeof profilePicture === "string" ? profilePicture : profilePicture.url;
    };

    return (
        <div className="mt-2 ml-4 md:ml-8 rounded-2xl border border-slate-900/60 bg-slate-950/40 p-4 space-y-4 shadow-inner relative overflow-hidden transition-all duration-300 animate-fadeIn">
            <div className="absolute top-0 left-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-500/20 to-transparent pointer-events-none" />

            <form onSubmit={handlePostComment} className="flex items-center gap-2 relative">
                <div className="absolute left-3 text-slate-600">
                    <CornerDownRight size={14} />
                </div>
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Enter new comment..."
                    className="w-full bg-slate-950/80 border border-slate-900 rounded-xl pl-9 pr-12 py-2.5 text-xs text-slate-300 placeholder-slate-700 outline-none focus:border-violet-500/40 transition-all font-mono"
                />
                <button
                    type="submit"
                    disabled={!newComment.trim() || isSubmitting}
                    className="absolute right-2 p-1.5 rounded-lg text-slate-500 hover:text-violet-400 disabled:opacity-20 disabled:hover:text-slate-500 transition-colors outline-none"
                >
                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
            </form>

            <div className="space-y-3 pt-2">
                {isLoading ? (
                    <div className="flex items-center justify-center py-6 text-slate-600 gap-2 font-mono text-[11px]">
                        <Loader2 size={12} className="animate-spin" />
                        <span>Loading comments...</span>
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-4 text-slate-600 font-mono text-[10px] flex flex-col items-center gap-1">
                        <MessageSquare size={14} className="opacity-40" />
                        <span>No comments Found. Be the first to comment!</span>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[320px] overflow-y-auto no-scrollbar pr-1">
                        {comments.map((comment) => (
                            <div key={comment._id} className="flex gap-3 text-xs border-b border-slate-900/30 pb-3 last:border-0 last:pb-0">

                                <div className="h-6 w-6 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-[9px] uppercase font-mono font-bold text-violet-400 flex-shrink-0">
                                    {getAvatarUrl(comment.user?.profilePicture) ? (
                                        <img src={getAvatarUrl(comment.user?.profilePicture)} alt="" className="w-full h-full object-cover rounded-md" />
                                    ) : (
                                        <span>{comment.user?.username?.substring(0, 2) || "??"}</span>
                                    )}
                                </div>

                                <div className="space-y-0.5 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-300">{comment.user?.username || "Unknown"}</span>
                                        <span className="text-[10px] text-slate-600 font-mono">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-slate-400 leading-relaxed text-[13px]">{comment.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};