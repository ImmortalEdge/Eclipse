'use client';

import { useEffect, useRef, useState } from 'react';

interface EclipseLogoProps {
    size?: number;
    animate?: boolean;
    loop?: boolean;
}

export default function EclipseLogo({ size = 48, animate = true, loop = false }: EclipseLogoProps) {
    const [phase, setPhase] = useState(animate ? 'dormant' : 'complete');
    const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
    const loopRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearAll = () => {
        timeoutsRef.current.forEach(clearTimeout);
        if (loopRef.current) clearTimeout(loopRef.current);
        timeoutsRef.current = [];
    };

    useEffect(() => {
        if (!animate) { setPhase('complete'); return; }

        const schedule = (fn: () => void, delay: number) => {
            const id = setTimeout(fn, delay);
            timeoutsRef.current.push(id);
            return id;
        };

        const runSequence = () => {
            timeoutsRef.current = [];
            setPhase('dormant');
            schedule(() => setPhase('pulse'), 200);
            schedule(() => setPhase('expand'), 900);
            schedule(() => setPhase('orbit'), 1800);
            schedule(() => setPhase('complete'), 2800);
            if (loop) {
                loopRef.current = setTimeout(runSequence, 5200);
            }
        };

        runSequence();
        return clearAll;
    }, [animate, loop]);

    const s = size;
    const cx = s / 2;
    const cy = s / 2;
    const R1 = s * 0.36;
    const R2 = s * 0.46;
    const R3 = s * 0.22;

    // Round to 4 decimals to ensure server/client consistency
    const round = (n: number) => Math.round(n * 10000) / 10000;

    const isDormant = phase === 'dormant';
    const isPulse = phase === 'pulse';
    const isExpand = ['expand', 'orbit', 'complete'].includes(phase);
    const isOrbit = ['orbit', 'complete'].includes(phase);
    const isComplete = phase === 'complete';

    const orbitDots = Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
        return {
            x: round(cx + R1 * Math.cos(angle)),
            y: round(cy + R1 * Math.sin(angle)),
            delay: i * 0.1,
            r: i % 2 === 0 ? s * 0.032 : s * 0.022,
        };
    });

    const ticks = Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const isMajor = i % 3 === 0;
        const r1 = R2 - (isMajor ? s * 0.04 : s * 0.025);
        return {
            x1: round(cx + r1 * Math.cos(angle)),
            y1: round(cy + r1 * Math.sin(angle)),
            x2: round(cx + R2 * Math.cos(angle)),
            y2: round(cy + R2 * Math.sin(angle)),
            isMajor,
            delay: i * 0.06,
        };
    });

    function polarToXY(cx: number, cy: number, r: number, deg: number) {
        const rad = ((deg - 90) * Math.PI) / 180;
        return { x: round(cx + r * Math.cos(rad)), y: round(cy + r * Math.sin(rad)) };
    }

    function arc(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
        const p1 = polarToXY(cx, cy, r, startDeg);
        const p2 = polarToXY(cx, cy, r, endDeg);
        return `M ${p1.x} ${p1.y} A ${round(r)} ${round(r)} 0 0 1 ${p2.x} ${p2.y}`;
    }

    const arcSegs = Array.from({ length: 6 }, (_, i) => ({
        d: arc(cx, cy, R1, i * 60 - 90, i * 60 + 42 - 90),
        delay: i * 0.1,
    }));

    const innerArcs = Array.from({ length: 3 }, (_, i) => ({
        d: arc(cx, cy, R3, i * 120 - 90, i * 120 + 55 - 90),
        delay: i * 0.14 + 0.4,
    }));

    // Unique ID prevents SVG filter collisions between multiple instances
    const uid = `el-${s}-${animate ? 'a' : 's'}-${loop ? 'l' : 'o'}`;

    // CSS keyframe animation name for slow orbital rotation (loop mode only)
    const rotateAnim = `eclipse-rotate-${uid}`;

    return (
        <svg
            width={s}
            height={s}
            viewBox={`0 0 ${s} ${s}`}
            fill="none"
            style={{ display: 'block', overflow: 'visible' }}
            suppressHydrationWarning
        >
            <defs>
                {/* Slow spin keyframe injected inline — only meaningful overhead is a <style> tag per instance */}
                <style>{`
          @keyframes ${rotateAnim} {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
        `}</style>

                <filter id={`${uid}-gc`} x="-80%" y="-80%" width="260%" height="260%">
                    <feGaussianBlur stdDeviation={s * 0.045} result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id={`${uid}-gs`} x="-120%" y="-120%" width="340%" height="340%">
                    <feGaussianBlur stdDeviation={s * 0.09} result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id={`${uid}-gx`} x="-200%" y="-200%" width="500%" height="500%">
                    <feGaussianBlur stdDeviation={s * 0.18} />
                </filter>
                <radialGradient id={`${uid}-ac`} cx="38%" cy="32%" r="62%">
                    <stop offset="0%" stopColor="#FFF5CC" />
                    <stop offset="40%" stopColor="#FFD166" />
                    <stop offset="100%" stopColor="#E8880A" />
                </radialGradient>
                <radialGradient id={`${uid}-ag`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#F5A623" stopOpacity="0.2" />
                    <stop offset="65%" stopColor="#F5A623" stopOpacity="0.06" />
                    <stop offset="100%" stopColor="#F5A623" stopOpacity="0" />
                </radialGradient>
            </defs>

            {/* ── Ambient halo ── */}
            <circle cx={cx} cy={cy} r={s * 0.5} fill={`url(#${uid}-ag)`}
                style={{ opacity: isComplete ? 1 : 0, transition: 'opacity 2s cubic-bezier(0.25,0.46,0.45,0.94)' }} />

            {/* ── Wide corona glow ── */}
            <circle cx={cx} cy={cy} r={s * 0.13} fill="#F5A623"
                filter={`url(#${uid}-gx)`}
                style={{ opacity: isComplete ? 0.35 : isPulse ? 0.18 : 0, transition: 'opacity 1.4s cubic-bezier(0.25,0.46,0.45,0.94)' }} />

            {/* ── Outer tick ring ── */}
            <circle cx={cx} cy={cy} r={R2} stroke="#F5A623" strokeWidth={s * 0.006}
                strokeOpacity={isComplete ? 0.12 : 0}
                style={{ transition: 'stroke-opacity 1.2s cubic-bezier(0.25,0.46,0.45,0.94) 0.4s' }} />

            {/* ── Tick marks ── */}
            {ticks.map((t, i) => (
                <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
                    stroke="#F5A623"
                    strokeWidth={t.isMajor ? s * 0.014 : s * 0.008}
                    strokeLinecap="round"
                    style={{
                        opacity: isComplete ? (t.isMajor ? 0.5 : 0.2) : 0,
                        transition: `opacity 0.6s cubic-bezier(0.25,0.46,0.45,0.94) ${t.delay + 0.5}s`
                    }} />
            ))}

            {/* ── Slowly rotating orbital ring group — gives living feel in loop mode ── */}
            <g
                style={{
                    transformOrigin: `${cx}px ${cy}px`,
                    animation: (loop && isOrbit)
                        ? `${rotateAnim} 18s linear infinite`
                        : undefined,
                    transition: 'opacity 0.8s ease',
                }}
            >
                {/* Main orbital arcs (glowing) */}
                {arcSegs.map((seg, i) => (
                    <path key={i} d={seg.d} stroke="#F5A623" strokeWidth={s * 0.022}
                        strokeLinecap="round" filter={`url(#${uid}-gs)`}
                        style={{
                            opacity: isOrbit ? (isComplete ? 0.72 : 0.38) : 0,
                            transition: `opacity 0.8s cubic-bezier(0.25,0.46,0.45,0.94) ${seg.delay + 0.3}s`
                        }} />
                ))}

                {/* Main ring crisp */}
                <circle cx={cx} cy={cy} r={R1} stroke="#F5A623" strokeWidth={s * 0.01}
                    strokeOpacity={isComplete ? 0.22 : isOrbit ? 0.08 : 0}
                    style={{ transition: 'stroke-opacity 1s cubic-bezier(0.25,0.46,0.45,0.94) 0.2s' }} />

                {/* Orbital dots */}
                {orbitDots.map((dot, i) => (
                    <g key={i}>
                        <circle cx={dot.x} cy={dot.y} r={dot.r * 2.8}
                            fill="#F5A623" fillOpacity={isComplete ? 0.15 : 0}
                            filter={`url(#${uid}-gs)`}
                            style={{ transition: `opacity 0.8s cubic-bezier(0.25,0.46,0.45,0.94) ${dot.delay + 0.25}s` }} />
                        <circle cx={dot.x} cy={dot.y} r={dot.r}
                            fill={`url(#${uid}-ac)`} filter={`url(#${uid}-gc)`}
                            style={{
                                opacity: isOrbit ? 1 : 0,
                                transform: isOrbit ? 'scale(1)' : 'scale(0)',
                                transformOrigin: `${dot.x}px ${dot.y}px`,
                                transition: [
                                    `opacity 0.6s cubic-bezier(0.25,0.46,0.45,0.94) ${dot.delay + 0.2}s`,
                                    `transform 0.8s cubic-bezier(0.34,1.36,0.64,1) ${dot.delay + 0.2}s`,
                                ].join(', '),
                            }} />
                        <circle cx={dot.x - dot.r * 0.28} cy={dot.y - dot.r * 0.28}
                            r={dot.r * 0.36} fill="white"
                            fillOpacity={isComplete ? 0.55 : 0}
                            style={{ transition: `fill-opacity 0.5s cubic-bezier(0.25,0.46,0.45,0.94) ${dot.delay + 0.4}s` }} />
                    </g>
                ))}
            </g>

            {/* ── Inner arcs (counter-rotate in loop for depth) ── */}
            <g
                style={{
                    transformOrigin: `${cx}px ${cy}px`,
                    animation: (loop && isOrbit)
                        ? `${rotateAnim} 26s linear infinite reverse`
                        : undefined,
                }}
            >
                {innerArcs.map((seg, i) => (
                    <path key={i} d={seg.d} stroke="#F5A623" strokeWidth={s * 0.014}
                        strokeLinecap="round" filter={`url(#${uid}-gs)`}
                        style={{
                            opacity: isComplete ? 0.38 : 0,
                            transition: `opacity 0.8s cubic-bezier(0.25,0.46,0.45,0.94) ${seg.delay + 0.4}s`
                        }} />
                ))}

                {/* Inner ring crisp */}
                <circle cx={cx} cy={cy} r={R3} stroke="#F5A623" strokeWidth={s * 0.007}
                    strokeOpacity={isComplete ? 0.16 : 0}
                    style={{ transition: 'stroke-opacity 1s cubic-bezier(0.25,0.46,0.45,0.94) 0.6s' }} />
            </g>

            {/* ── Pulse rings ── */}
            <circle cx={cx} cy={cy} r={isExpand ? R1 * 1.18 : s * 0.05}
                stroke="#F5A623" strokeWidth={s * 0.009} fill="none"
                strokeOpacity={isPulse ? 0.45 : 0}
                style={{
                    transition: isExpand
                        ? 'r 1s cubic-bezier(0.16,1,0.3,1), stroke-opacity 1s ease'
                        : 'none'
                }} />
            <circle cx={cx} cy={cy} r={isExpand ? R1 * 1.35 : s * 0.05}
                stroke="#F5A623" strokeWidth={s * 0.005} fill="none"
                strokeOpacity={isPulse ? 0.2 : 0}
                style={{
                    transition: isExpand
                        ? 'r 1.3s cubic-bezier(0.16,1,0.3,1) 0.12s, stroke-opacity 1.3s ease 0.12s'
                        : 'none'
                }} />

            {/* ── Crosshairs ── */}
            {[0, 90].map((rot, i) => (
                <line key={i}
                    x1={cx - R3 * 0.62} y1={cy} x2={cx + R3 * 0.62} y2={cy}
                    stroke="#F5A623" strokeWidth={s * 0.007} strokeLinecap="round"
                    strokeOpacity={isComplete ? 0.3 : 0}
                    transform={`rotate(${rot} ${cx} ${cy})`}
                    style={{ transition: 'stroke-opacity 0.7s cubic-bezier(0.25,0.46,0.45,0.94) 0.65s' }} />
            ))}

            {/* ── Core sphere ── */}
            <circle cx={cx} cy={cy}
                r={isDormant ? s * 0.04 : isPulse ? s * 0.075 : isComplete ? s * 0.07 : s * 0.06}
                fill={`url(#${uid}-ac)`} filter={`url(#${uid}-gc)`}
                style={{ transition: 'r 0.7s cubic-bezier(0.34,1.36,0.64,1)' }} />

            {/* ── Core outer glow ── */}
            <circle cx={cx} cy={cy} r={isComplete ? s * 0.1 : s * 0.06}
                fill="#F5A623" fillOpacity={isComplete ? 0.14 : 0}
                filter={`url(#${uid}-gs)`}
                style={{ transition: 'r 0.8s cubic-bezier(0.25,0.46,0.45,0.94), fill-opacity 0.8s cubic-bezier(0.25,0.46,0.45,0.94)' }} />

            {/* ── Core specular ── */}
            <circle cx={cx - s * 0.018} cy={cy - s * 0.018}
                r={isDormant ? s * 0.012 : isComplete ? s * 0.025 : s * 0.018}
                fill="white" fillOpacity={isDormant ? 0.4 : 0.68}
                style={{ transition: 'r 0.6s cubic-bezier(0.25,0.46,0.45,0.94), fill-opacity 0.6s ease' }} />
            <circle cx={cx + s * 0.022} cy={cy + s * 0.014}
                r={s * 0.008} fill="white"
                fillOpacity={isComplete ? 0.22 : 0}
                style={{ transition: 'fill-opacity 0.6s cubic-bezier(0.25,0.46,0.45,0.94) 0.35s' }} />
        </svg>
    );
}
