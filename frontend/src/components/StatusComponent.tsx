import React, { useState } from "react";
import { 
  Heart, MessageSquare, Share2, Bookmark, 
  Image as ImageIcon, Send, MoreHorizontal, Sparkles 
} from "lucide-react";

export interface Post {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  media?: string;
  timestamp: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

interface FeedStreamProps {
  /** "full" for main FeedPage, "compact" for sidebars in MessagePage */
  variant?: "full" | "compact"; 
  /** Whether to render the post creation box at the top */
  showComposer?: boolean; 
  /** Optional initial posts array or custom posts passed from parent */
  initialPosts?: Post[]; 
  /** Filter tag or title header (e.g. "Shared Media", "Activity") */
  title?: string;
}

// Default mock feed data if none is supplied
const DEFAULT_POSTS: Post[] = [
  {
    id: "1",
    author: {
      name: "Ada Lovelace",
      username: "ada_codes",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    },
    content: "Just deployed the new glassmorphic UI updates for Blink! Excited to see how the team uses the new state engine. 🚀✨",
    media: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    timestamp: "10m ago",
    likes: 42,
    comments: 8,
    isLiked: true,
  },
  {
    id: "2",
    author: {
      name: "Marcus Vance",
      username: "marcus_v",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
    content: "Clean architecture is worth the extra 20 minutes of planning. Decoupling components keeps things flying smooth! 💡",
    timestamp: "1h ago",
    likes: 19,
    comments: 3,
  },
];

const FeedStream: React.FC<FeedStreamProps> = ({
  variant = "full",
  showComposer = true,
  initialPosts = DEFAULT_POSTS,
  title,
}) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [newPostText, setNewPostText] = useState("");

  const handleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === id) {
          return {
            ...post,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !post.isLiked,
          };
        }
        return post;
      })
    );
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newPost: Post = {
      id: Date.now().toString(),
      author: {
        name: "You",
        username: "current_user",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      },
      content: newPostText,
      timestamp: "Just now",
      likes: 0,
      comments: 0,
    };

    setPosts([newPost, ...posts]);
    setNewPostText("");
  };

  const isCompact = variant === "compact";

  return (
    <div className={`w-full space-y-4 ${isCompact ? "text-xs" : "text-sm"}`}>
      {/* Optional Title Bar (e.g. for Message Sidebar) */}
      {title && (
        <div className="flex items-center justify-between pb-2 border-b border-brand-border">
          <h3 className="font-extrabold tracking-tight text-brand-text flex items-center gap-2">
            <Sparkles size={16} className="text-brand-accent" /> {title}
          </h3>
        </div>
      )}

      {/* COMPOSER BOX */}
      {showComposer && (
        <form 
          onSubmit={handleCreatePost}
          className={`rounded-3xl border border-brand-border bg-brand-glass backdrop-blur-xl transition-all ${
            isCompact ? "p-3" : "p-4"
          }`}
        >
          <div className="flex gap-3">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
              alt="User" 
              className={`rounded-full object-cover ${isCompact ? "h-8 w-8" : "h-10 w-10"}`}
            />
            <textarea
              rows={isCompact ? 2 : 3}
              placeholder="What's happening?"
              className="w-full bg-transparent text-brand-text placeholder:text-brand-text-muted outline-none resize-none"
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
            />
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-brand-border/50 pt-3">
            <button 
              type="button" 
              className="text-brand-text-muted hover:text-brand-accent transition flex items-center gap-1"
            >
              <ImageIcon size={isCompact ? 16 : 18} />
              {!isCompact && <span className="text-xs font-semibold">Media</span>}
            </button>

            <button
              type="submit"
              disabled={!newPostText.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-brand-accent px-4 py-1.5 font-semibold text-brand-text disabled:opacity-50 hover:bg-brand-accent-hover transition shadow-md shadow-violet-600/20"
            >
              <span>Post</span>
              <Send size={14} />
            </button>
          </div>
        </form>
      )}

      {/* POSTS LIST */}
      <div className="space-y-4">
        {posts.map((post) => (
          <article 
            key={post.id}
            className={`rounded-3xl border border-brand-border bg-brand-glass backdrop-blur-xl text-brand-text transition-all ${
              isCompact ? "p-3 space-y-2.5" : "p-5 space-y-4"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img 
                  src={post.author.avatar} 
                  alt={post.author.name} 
                  className={`rounded-full object-cover ${isCompact ? "h-7 w-7" : "h-10 w-10"}`}
                />
                <div>
                  <h4 className="font-bold leading-tight hover:underline cursor-pointer">
                    {post.author.name}
                  </h4>
                  <p className="text-brand-text-muted text-[11px]">
                    @{post.author.username} • {post.timestamp}
                  </p>
                </div>
              </div>
              <button className="text-brand-text-muted hover:text-brand-text">
                <MoreHorizontal size={16} />
              </button>
            </div>

            {/* Content Body */}
            <p className="leading-relaxed whitespace-pre-line">{post.content}</p>

            {/* Attached Media */}
            {post.media && (
              <div className="overflow-hidden rounded-2xl border border-brand-border/50">
                <img 
                  src={post.media} 
                  alt="Post attachment" 
                  className="w-full object-cover max-h-80 hover:scale-105 transition-transform duration-500" 
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between border-t border-brand-border/40 pt-2 text-brand-text-muted">
              <button 
                onClick={() => handleLike(post.id)}
                className={`flex items-center gap-1.5 transition ${
                  post.isLiked ? "text-rose-500 font-bold" : "hover:text-rose-500"
                }`}
              >
                <Heart size={isCompact ? 14 : 18} fill={post.isLiked ? "currentColor" : "none"} />
                <span>{post.likes}</span>
              </button>

              <button className="flex items-center gap-1.5 hover:text-brand-accent transition">
                <MessageSquare size={isCompact ? 14 : 18} />
                <span>{post.comments}</span>
              </button>

              <button className="hover:text-brand-accent transition">
                <Share2 size={isCompact ? 14 : 18} />
              </button>

              <button className="hover:text-brand-accent transition">
                <Bookmark size={isCompact ? 14 : 18} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default FeedStream;