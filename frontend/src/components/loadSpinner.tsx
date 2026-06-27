import React from "react";

interface SpinnerProps {
    size?: "xs" | "sm" | "md" | "lg";
    variant?: "white" | "primary" | "slate";
    className?: string; //Allows overriding or adding extername margins/layout
}

const Spinner: React.FC<SpinnerProps> = ({
    size = "sm",
    variant = "white",
    className = "",
}) => {
    const sizeClasses = {
        xs: "h-3 w-3 border-[2px]",
        sm: "h-4 w-4 border-[2px]",
        md: "h-6 w-6 border-[3px]",
        lg: "h-8 w-8 border-[4px]",
    };

    const variantClasses = {
        white: "border-white/20 border-t-white",
        primary: "border-violet-500/25 border-t-violet-500",
        slate: "border-slate-800 border-t-slate-400",
    };

    return (
        <div
        className={`animate-spin rounded-full border-solid ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        role="status"
        >
            {/*Accessibility screen reader support*/}
            <span className="sr-only">Loading...</span>
        </div>
    );
};

export default Spinner;