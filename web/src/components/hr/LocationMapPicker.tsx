"use client";

// Peta pemilih titik kantor (Leaflet + tile OpenStreetMap, tanpa API key).
// File ini mengimpor leaflet secara statis, jadi HARUS dimuat lewat
// next/dynamic({ ssr: false }) — leaflet mengakses `window` saat di-import.

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Bundler (webpack/turbopack) merusak deteksi path ikon default Leaflet
// (_getIconUrl membaca URL dari CSS). Set URL ikon secara eksplisit.
// Turbopack/webpack bisa mengembalikan string atau objek { src } untuk impor gambar.
const src = (m: unknown) => (typeof m === "string" ? m : (m as { src: string }).src);

const DefaultIcon = L.icon({
  iconUrl: src(markerIcon),
  iconRetinaUrl: src(markerIcon2x),
  shadowUrl: src(markerShadow),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

interface Props {
  latitude: number;
  longitude: number;
  radius: number;
  onChange: (lat: number, lng: number) => void;
  /** Naikkan nilai ini untuk memusatkan (flyTo) peta ke titik saat ini, mis. setelah pencarian/GPS. */
  focusToken?: number;
  className?: string;
}

const round7 = (v: number) => Math.round(v * 1e7) / 1e7;

export default function LocationMapPicker({ latitude, longitude, radius, onChange, focusToken, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Inisialisasi sekali.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const start: L.LatLngExpression = [latitude, longitude];
    const map = L.map(containerRef.current, { center: start, zoom: 17, scrollWheelZoom: true });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map);

    const circle = L.circle(start, {
      radius,
      color: "#9c27b0",
      fillColor: "#9c27b0",
      fillOpacity: 0.15,
      weight: 2,
    }).addTo(map);
    const marker = L.marker(start, { draggable: true, icon: DefaultIcon, autoPan: true }).addTo(map);

    marker.on("drag", () => circle.setLatLng(marker.getLatLng()));
    marker.on("dragend", () => {
      const p = marker.getLatLng();
      onChangeRef.current(round7(p.lat), round7(p.lng));
    });
    map.on("click", (e: L.LeafletMouseEvent) => {
      onChangeRef.current(round7(e.latlng.lat), round7(e.latlng.lng));
    });

    mapRef.current = map;
    markerRef.current = marker;
    circleRef.current = circle;

    // Peta di dalam modal: ukuran kontainer baru final setelah animasi.
    const t = setTimeout(() => map.invalidateSize(), 250);
    return () => {
      clearTimeout(t);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      circleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sinkronkan titik dari luar (input angka, pencarian, GPS).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
    const p = L.latLng(latitude, longitude);
    markerRef.current?.setLatLng(p);
    circleRef.current?.setLatLng(p);
    if (!map.getBounds().contains(p)) map.panTo(p);
  }, [latitude, longitude]);

  useEffect(() => {
    if (Number.isFinite(radius) && radius > 0) circleRef.current?.setRadius(radius);
  }, [radius]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusToken || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
    map.flyTo([latitude, longitude], Math.max(map.getZoom(), 17), { duration: 0.6 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusToken]);

  return <div ref={containerRef} className={className ?? "h-80 w-full rounded border border-default"} />;
}
