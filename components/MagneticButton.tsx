'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';

interface MagneticButtonProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    distance?: number;
    strength?: number;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
}

export default function MagneticButton({
    children,
    className = "",
    onClick,
    distance = 60,
    strength = 0.4,
    disabled = false,
    type = "button"
}: MagneticButtonProps) {
    const ref = useRef<HTMLButtonElement>(null);

    // Magnetic Pull
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth springs
    const springConfig = { damping: 15, stiffness: 150, mass: 0.6 };
    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    // Glow Follow
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Blob Morphism (Scale & Skew based on motion)
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!ref.current) return;

        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current.getBoundingClientRect();

        const centerX = left + width / 2;
        const centerY = top + height / 2;

        const deltaX = clientX - centerX;
        const deltaY = clientY - centerY;

        // Calculate distance from center
        const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (dist < distance) {
            // Magnetic pull
            x.set(deltaX * strength);
            y.set(deltaY * strength);

            // Glow position (relative to button center)
            mouseX.set(deltaX);
            mouseY.set(deltaY);
        } else {
            x.set(0);
            y.set(0);
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
        mouseX.set(0);
        mouseY.set(0);
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    return (
        <motion.button
            ref={ref}
            type={type}
            disabled={disabled}
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                x: springX,
                y: springY,
            }}
            className={`relative group touch-none active:scale-95 transition-scale duration-200 ${className}`}
        >
            {/* Liquid Blob Background Glow - High Fidelity Gradient */}
            <motion.div
                className="absolute inset-x-0 inset-y-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                    x: mouseX,
                    y: mouseY,
                    background: 'radial-gradient(circle at center, rgba(224, 139, 58, 0.18) 0%, rgba(224, 139, 58, 0.05) 40%, transparent 85%)',
                    filter: 'blur(25px)',
                }}
                animate={isHovered ? { scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] } : { scale: 1, opacity: 0 }}
                transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Inner Liquid Border Glow */}
            <motion.div
                className="absolute inset-0 rounded-full z-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{
                    boxShadow: 'inset 0 0 20px rgba(224, 139, 58, 0.05)',
                }}
                animate={isHovered ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                transition={{ duration: 1, repeat: Infinity }}
            />

            {/* Sub-blob effect for distortion - Premium Liquid Glass */}
            <motion.div
                className="absolute inset-0 bg-white/[0.04] backdrop-blur-md rounded-full z-0 pointer-events-none border border-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]"
                animate={isHovered ? {
                    scale: [1, 1.02, 0.98, 1],
                    rotate: [0, 1, -1, 0],
                } : {
                    scale: 1,
                    rotate: 0,
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            <span className="relative z-10 flex items-center gap-3">
                {children}
            </span>
        </motion.button>
    );
}
