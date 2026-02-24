'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Place } from '@/lib/map';
import { Star, MapPin } from 'lucide-react';

interface NearbyMapProps {
    center: [number, number];
    places: Place[];
    hoveredId: string | null;
    selectedId: string | null;
    onMarkerClick: (place: Place) => void;
    onHover: (id: string | null) => void;
    bounds: L.LatLngBoundsExpression | null;
    mapRef: any;
}

// Helper to set bounds
function ChangeView({ bounds }: { bounds: L.LatLngBoundsExpression | null }) {
    const map = useMap();
    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 0.8 });
        }
    }, [bounds, map]);
    return null;
}

export default function NearbyMap({
    center,
    places,
    hoveredId,
    selectedId,
    onMarkerClick,
    onHover,
    bounds,
    mapRef
}: NearbyMapProps) {
    const [isDomReady, setIsDomReady] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // High-velocity DOM verification
        if (typeof window !== 'undefined') {
            setIsDomReady(true);
        }
    }, []);

    return (
        <div
            ref={containerRef}
            id="nearby-map-stable-anchor"
            className="w-full h-full relative bg-[#0c0c0c] overflow-hidden rounded-[inherit]"
        >
            {isDomReady && (
                <MapContainer
                    center={center}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                    attributionControl={false}
                    ref={mapRef}
                >
                    <TileLayer
                        url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                        attribution="© Stadia Maps © OpenMapTiles © OpenStreetMap"
                    />
                    {bounds && <ChangeView bounds={bounds} />}
                    {places.map((place) => {
                        const isActive = hoveredId === place.id || selectedId === place.id;
                        const icon = L.divIcon({
                            className: 'custom-marker',
                            html: `<div class="marker-disk ${isActive ? 'active' : ''}" style="
                                width: 32px;
                                height: 32px;
                                background: ${isActive ? '#fff' : '#F5A623'};
                                color: ${isActive ? '#F5A623' : '#0c0c0c'};
                                border-radius: 999px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 11px;
                                font-weight: 700;
                                border: 2px solid rgba(0,0,0,0.3);
                                transition: all 150ms ease;
                                box-shadow: ${isActive ? '0 0 16px rgba(245,166,35,0.5)' : 'none'};
                                transform: ${isActive ? 'scale(1.2)' : 'scale(1)'};
                                line-height: 1;
                                text-align: center;
                            ">${place.rating}</div>`,
                            iconSize: [32, 32],
                            iconAnchor: [16, 16]
                        });

                        return (
                            <Marker
                                key={place.id}
                                position={[place.lat, place.lng]}
                                icon={icon}
                                eventHandlers={{
                                    mouseover: () => onHover(place.id),
                                    mouseout: () => onHover(null),
                                    click: () => onMarkerClick(place)
                                }}
                            >
                                <Popup className="custom-popup" offset={[0, -12]}>
                                    <div className="bg-[#1a1714] border border-white/10 rounded-[8px] p-[6px_10px] text-white shadow-2xl flex items-center gap-2 whitespace-nowrap">
                                        <span className="text-[11px] font-semibold">{place.name}</span>
                                        <div className="flex items-center gap-1 pl-1 border-l border-white/10">
                                            <Star size={10} className="fill-[#F5A623] text-[#F5A623]" />
                                            <span className="text-[10px] text-zinc-400">{place.rating}</span>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            )}
        </div>
    );
}
