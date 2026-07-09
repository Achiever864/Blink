import type { LucideIcon } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";

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

const [open, setOpen] = useState(false);
const [position, setPosition] = useState({
    x: 0,
    y: 0
});

const handleContextMenu = (
    e: React.MouseEvent
) => {
    e.preventDefault();

    setPosition({
        x: e.clientX,
        y: e.clientY
    });

    setOpen(true);
};

useEffect(() => {
    const close = () => setIsOpen(false);

    window.addEventListener("click", close);
    window.addEventListener("keydown", e => {
        if(e.key === "Escape") close();
    });

    return () =>  {

    }
}, []);

<div onContextMenu={handleContextMenu}>
    {Children}
</div>

const ContextMenu: React.FC<ContextMenuProps> = ({ children, items }) => {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0});
    const menuRef = useRef<HTMLDivElement>(null);

    const handleContextMenu = (e: )
}