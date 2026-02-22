'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, ChevronRight, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Place, fetchNearbyPlaces, getCoordinates } from '@/lib/map';
import dynamic from 'next/dynamic';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Dynamically import the Map component to avoid SSR issues
const NearbyMap = dynamic(() => import('./NearbyMap'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-zinc-900 animate-pulse flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-[#F5A623]" />
    </div>
});

interface NearbyMapWidgetProps {
    intent: { category: string; location: string };
    onClose?: () => void;
}

export default function NearbyMapWidget({ intent, onClose }: NearbyMapWidgetProps) {
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState(true);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [center, setCenter] = useState<[number, number]>([0, 0]);
    const [L, setL] = useState<any>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const mapContainerRef = useRef<any>(null);

    useEffect(() => {
        // We still need Leaflet for bounds calculation in the parent if needed, 
        // but it's handled in the child now.
        import('leaflet').then(mod => setL(mod.default));
    }, []);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            let lat = 0, lng = 0;

            if (intent.location === 'me' || intent.location === 'my location') {
                try {
                    const pos: any = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                    });
                    lat = pos.coords.latitude;
                    lng = pos.coords.longitude;
                } catch (e) {
                    // Fallback to a default city if geolocation fails (e.g. New Delhi)
                    lat = 28.6139;
                    lng = 77.2090;
                }
            } else {
                const coords = await getCoordinates(intent.location);
                if (coords) {
                    lat = coords.lat;
                    lng = coords.lng;
                } else {
                    // Fallback to New Delhi if geocoding fails
                    lat = 28.6139;
                    lng = 77.2090;
                }
            }

            setCenter([lat, lng]);
            const data = await fetchNearbyPlaces(intent.category, lat, lng);
            setPlaces(data);
            setLoading(false);
        }
        loadData();
    }, [intent]);

    const bounds = useMemo(() => {
        if (!L || places.length === 0) return null;
        return L.latLngBounds(places.map(p => [p.lat, p.lng]));
    }, [L, places]);

    const handleCardClick = (place: Place) => {
        setSelectedId(place.id);
        if (mapContainerRef.current) {
            mapContainerRef.current.flyTo([place.lat, place.lng], 15, { duration: 0.8 });
        }
    };

    const handleMarkerClick = (place: Place) => {
        setSelectedId(place.id);
        const element = document.getElementById(`place-card-${place.id}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    };

    return (
        <motion.div
            initial={{ translateY: -10, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="bg-[#1a1714] border border-white/10 rounded-[24px] p-6 mb-12 shadow-[0_32px_80px_rgba(0,0,0,0.6)] w-full max-w-4xl mx-auto overflow-hidden text-zinc-100"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-white/40">
                        <MapPin size={14} className="text-[#F5A623]" />
                        Nearby
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-[12px] font-medium text-white/50 capitalize">
                        {intent.category} · {intent.location}
                    </div>
                    {onClose && (
                        <button onClick={onClose} className="text-white/20 hover:text-white transition-all">
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Main Split Panel */}
            <div className="flex flex-row h-[440px] rounded-[28px] overflow-hidden border border-white/5 bg-[#0c0c0c] p-2 gap-2">
                {/* Left Side - Map */}
                <div className="w-[62%] h-full relative z-0 rounded-[22px] overflow-hidden border border-white/5">
                    {!loading && (
                        <NearbyMap
                            center={center}
                            places={places}
                            hoveredId={hoveredId}
                            selectedId={selectedId}
                            onMarkerClick={handleMarkerClick}
                            onHover={setHoveredId}
                            bounds={bounds}
                            mapRef={mapContainerRef}
                        />
                    )}
                    {loading && (
                        <div className="w-full h-full bg-zinc-900/50 flex items-center justify-center">
                            <motion.div
                                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.7, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="w-2 h-2 rounded-full bg-[#F5A623]"
                            />
                        </div>
                    )}
                </div>

                {/* Right Side - Results List */}
                <div className="w-[38%] h-full flex flex-col bg-[#1a1714] rounded-[22px] overflow-hidden border border-white/5">
                    <div
                        ref={listRef}
                        className="flex-1 overflow-y-auto no-scrollbar"
                    >
                        {loading ? (
                            <div className="p-4 space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-4 animate-pulse">
                                        <div className="flex-1 space-y-3">
                                            <div className="h-4 bg-white/5 rounded w-[70%]" />
                                            <div className="h-3 bg-white/5 rounded w-[50%]" />
                                            <div className="h-3 bg-white/5 rounded w-[40%]" />
                                        </div>
                                        <div className="w-[72px] h-[72px] bg-white/5 rounded-lg" />
                                    </div>
                                ))}
                            </div>
                        ) : places.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                                <span className="text-[15px] italic font-serif text-white/50 mb-2">No places found</span>
                                <span className="text-[11px] text-zinc-600 uppercase tracking-widest">Try a different search</span>
                            </div>
                        ) : (
                            places.map((place, i) => (
                                <motion.div
                                    key={place.id}
                                    id={`place-card-${place.id}`}
                                    initial={{ opacity: 0, x: 8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onMouseEnter={() => setHoveredId(place.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                    onClick={() => handleCardClick(place)}
                                    className={cn(
                                        "p-[12px_14px] border-b border-white/[0.05] flex gap-[12px] cursor-pointer transition-colors group relative",
                                        hoveredId === place.id ? "bg-white/[0.04]" : "",
                                        selectedId === place.id ? "bg-white/[0.08]" : ""
                                    )}
                                >
                                    {selectedId === place.id && (
                                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#F5A623]" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[13px] font-semibold text-white truncate leading-tight">
                                            {place.name}
                                        </div>
                                        <div className="text-[11px] text-zinc-500 mt-1.5 truncate">
                                            {place.address}
                                        </div>
                                        <div className="flex items-center gap-2 mt-2.5">
                                            <Star size={11} className="fill-[#F5A623] text-[#F5A623]" />
                                            <span className="text-[12px] font-medium text-white">{place.rating}</span>
                                            <span className="text-[11px] text-zinc-600">({place.reviewCount?.toLocaleString()})</span>
                                        </div>
                                    </div>
                                    <div className="w-[72px] h-[72px] rounded-[8px] overflow-hidden bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                                        <MapPin size={24} className="text-[#F5A623]/20" />
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* See More Button */}
                    <div className="sticky bottom-0 bg-[#1a1714] border-t border-white/[0.06] p-[12px_14px]">
                        <button className="flex items-center gap-1.5 text-[12px] font-medium text-[#F5A623] hover:brightness-110 transition-all group/btn w-full justify-start">
                            See more places
                            <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .leaflet-div-icon {
                    background: transparent !important;
                    border: none !important;
                }
            `}</style>
        </motion.div>
    );
}
