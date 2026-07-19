import type { LucideIcon } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

interface ContextMenuItem {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
    danger?: boolean;
    disabled?: boolean;
}

interface ContextMenuProps {
    children: React.ReactNode;
    items: ContextMenuItem[];
}

const ContextMenu: React.FC<ContextMenuProps> = ({ children, items }) => {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const menuRef = useRef<HTMLDivElement>(null);

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();

        setPosition({
            x: e.clientX,
            y: e.clientY
        });

        setOpen(true);
    };

    const handleItemClick = (item: ContextMenuItem) => {
        if (item.disabled) return;

        item.onClick();
        setOpen(false);
    };

    useEffect(() => {
        if (!open) return;

        const close = () => setOpen(false);

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
        };

        const timeoutId = setTimeout(() => {
            window.addEventListener("click", close);
            window.addEventListener("keydown", handleEscape);
        }, 0);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener("click", close);
            window.removeEventListener("keydown", handleEscape);
        };
    }, [open]);

    // keep the menu on screen even if the right click happens near an edge
    useEffect(() => {
        if (!open || !menuRef.current) return;

        const menu = menuRef.current;
        const rect = menu.getBoundingClientRect();
        const { innerWidth, innerHeight } = window;

        let adjustedX = position.x;
        let adjustedY = position.y;

        if (rect.right > innerWidth) {
            adjustedX = innerWidth - rect.width - 8;
        }

        if (rect.bottom > innerHeight) {
            adjustedY = innerHeight - rect.height - 8;
        }

        if (adjustedX !== position.x || adjustedY !== position.y) {
            setPosition({ x: adjustedX, y: adjustedY });
        }
    }, [open]);

    return (
        <div onContextMenu={handleContextMenu}>
            {children}

            {open && createPortal(
                <div
                    ref={menuRef}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        position: "fixed",
                        top: position.y,
                        left: position.x,
                        zIndex: 1000
                    }}
                    className="min-w-[180px] rounded-xl border border-brand-border bg-brand-bg shadow-xl py-1.5 overflow-hidden"
                >
                    {items.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={index}
                                onClick={() => handleItemClick(item)}
                                disabled={item.disabled}
                                className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-left transition-colors ${
                                    item.disabled
                                        ? "text-brand-text-muted cursor-not-allowed"
                                        : item.danger
                                            ? "text-red-400 hover:bg-red-500/10"
                                            : "text-brand-text hover:bg-brand-surface"
                                }`}
                            >
                                {Icon && <Icon size={14} />}
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </div>,
                document.body
            )}
        </div>
    );
};

export default ContextMenu;