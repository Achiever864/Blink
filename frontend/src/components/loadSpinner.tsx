import React from "react";

interface BloaderProps {
    size?: "xs" | "sm" | "md" | "lg";
    variant?: "white"| "primary" | "slate" | "gold";
    className?: string;
}

const BLoader: React.FC<BloaderProps> = ({
    size = "sm",
    variant = "primary",
    className = "",
}) => {
    const sizeMap = {
        xs: { container: "w-[20px] h-[20px]", letter: "text-[18px]", dot:"w-[4px] h-[4px]" },
        sm: { container: "w-[28px] h-[28px]", letter: "text-[26px]", dot: "w-[5px] h-[5px]" },
        md: { container: "w-[42px] h-[42px]", letter: "text-[40px]", dot: "w-[7px] h-[7px]" },
        lg: { container: "w-[60px] h-[60px]", letter: "text-[58px]", dot: "w-[10px] h-[10px]" },
    };

    const variantMap = {
        white: {letter: "text-white", dot: "bg-white" },
        primary: { letter: "text-violet-500", dot: "bg-violet-500" },
        slate: { letter: "text-slate-400", dot: "bg-slate-400" },
        gold: { letter: "text-[#c9a84c]", dot: "bg-[#c9a84c]" },
    };

    return (
        <div
            className={`relative inline-block ${sizeMap[size].container} ${className}`}
            role="status"
            aria-label="Loading"
        >
            {/*track Line... wait what?? */}
            <span
                className="absolute -bottom-1 left-[-10%] w-[120%] h-[1.5px] rounded opacity-15"
                style={{ background: "currentColor" }}
            />

            <span
                className={`inline-block leading-none font-bold animate-bRoll ${sizeMap[size].letter} ${variantMap[variant].letter}`}
                style={{ fontFamily: " 'Cormorant Garamond', Georgia, serif", transformOrigin: "center center"}}
            >
                B
            </span>

            <span
                className={`absolute rounded-full animate-dotOrbit ${sizeMap[size].dot} ${variantMap[variant].dot}`}
            />

            <span className="sr-only"> Loading...</span>
        </div>
    )
}

export default BLoader;