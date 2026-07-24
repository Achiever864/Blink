import React from "react";

interface MediaItem {
    url: string;
    publicId: string;
    type: "image" | "video" | "audio";
}

interface PostMediaProps {
    media: MediaItem[];
}

const MediaCard = ({
    item,
    className = "",
}: {
    item: MediaItem;
    className?: string;
}) => {
    if (item.type === "video") {
        return (
            <video
                src={item.url}
                controls
                playsInline
                className={`h-full w-full object-cover ${className}`}
            />
        );
    }

    return (
        <img
            src={item.url}
            alt=""
            loading="lazy"
            className={`h-full w-full object-cover transition duration-300 hover:scale-105 ${className}`}
        />
    );
};

const PostMedia: React.FC<PostMediaProps> = ({ media }) => {

    if (!media || media.length === 0) return null;

    // 1 media
    if (media.length === 1) {
        return (
            <div className="overflow-hidden rounded-3xl">
                <MediaCard
                    item={media[0]}
                    className="max-h-[520px]"
                />
            </div>
        );
    }

    // 2 media
    if (media.length === 2) {
        return (
            <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-3xl">
                {media.map((item) => (
                    <MediaCard
                        key={item.publicId}
                        item={item}
                        className="aspect-square"
                    />
                ))}
            </div>
        );
    }

    // 3 media
    if (media.length === 3) {
        return (
            <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-3xl">
                <MediaCard
                    item={media[0]}
                    className="row-span-2 h-full"
                />

                <MediaCard
                    item={media[1]}
                    className="aspect-square"
                />

                <MediaCard
                    item={media[2]}
                    className="aspect-square"
                />
            </div>
        );
    }

    // 4 media
    if (media.length === 4) {
        return (
            <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-3xl">
                {media.map((item) => (
                    <MediaCard
                        key={item.publicId}
                        item={item}
                        className="aspect-square"
                    />
                ))}
            </div>
        );
    }

    // 5+
    const visible = media.slice(0, 4);

    return (
        <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-3xl">

            {visible.map((item, index) => {

                const remaining = media.length - 4;

                return (
                    <div
                        key={item.publicId}
                        className="relative"
                    >
                        <MediaCard
                            item={item}
                            className="aspect-square"
                        />

                        {index === 3 && remaining > 0 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">

                                <span className="text-3xl font-black text-white">
                                    +{remaining}
                                </span>

                            </div>
                        )}
                    </div>
                );

            })}

        </div>
    );
};

export default PostMedia;