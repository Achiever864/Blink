import React, { useId } from "react";

interface BLoaderProps {
    size?: "xs" | "sm" | "md" | "lg";
    variant?: "white" | "primary" | "slate" | "gold";
    className?: string;
}

const SIZE_MAP = {
    xs: { box: 20, stroke: 1.5, font: 13 },
    sm: { box: 28, stroke: 2, font: 18 },
    md: { box: 42, stroke: 2.5, font: 27 },
    lg: { box: 60, stroke: 3, font: 38 },
};

const VARIANT_MAP = {
    white: { ring: "#ffffff", letter: "#ffffff" },
    primary: { ring: "var(--brand-accent, #8b5cf6)", letter: "var(--brand-accent, #8b5cf6)" },
    slate: { ring: "#94a3b8", letter: "#94a3b8" },
    gold: { ring: "#c9a84c", letter: "#c9a84c" },
};

const BLoader: React.FC<BLoaderProps> = ({
    size = "sm",
    variant = "primary",
    className = "",
}) => {
    const uid = useId().replace(/:/g, "");
    const { box, stroke, font } = SIZE_MAP[size];
    const colors = VARIANT_MAP[variant];

    const radius = (box - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const arcLength = circumference * 0.24; // visible portion of the ring

    return (
        <div
            className={`relative inline-flex items-center justify-center ${className}`}
            style={{ width: box, height: box }}
            role="status"
            aria-label="Loading"
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&display=swap');

                @keyframes bl-spin-${uid} {
                    to { transform: rotate(360deg); }
                }
                @keyframes bl-breathe-${uid} {
                    0%, 100% { opacity: 0.55; transform: scale(0.94); }
                    50% { opacity: 1; transform: scale(1); }
                }
                .bl-ring-${uid} {
                    animation: bl-spin-${uid} 1.1s linear infinite;
                    transform-origin: 50% 50%;
                }
                .bl-letter-${uid} {
                    animation: bl-breathe-${uid} 1.6s ease-in-out infinite;
                    transform-origin: 50% 50%;
                }
                @media (prefers-reduced-motion: reduce) {
                    .bl-ring-${uid}, .bl-letter-${uid} { animation: none; }
                }
            `}</style>

            <svg
                width={box}
                height={box}
                viewBox={`0 0 ${box} ${box}`}
                className={`absolute inset-0 bl-ring-${uid}`}
            >
                <circle
                    cx={box / 2}
                    cy={box / 2}
                    r={radius}
                    fill="none"
                    stroke={colors.ring}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={`${arcLength} ${circumference - arcLength}`}
                    opacity={0.9}
                />
            </svg>

            <span
                className={`absolute inset-0 flex items-center justify-center bl-letter-${uid} select-none`}
            >
                <span
                    style={{
                        fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
                        fontStyle: "italic",
                        fontWeight: 500,
                        fontSize: font,
                        lineHeight: 1,
                        color: colors.letter,
                        transform: "translateY(-1px)",
                    }}
                >
                    B
                </span>
            </span>

            <span className="sr-only">Loading...</span>
        </div>
    );
};

export default BLoader;