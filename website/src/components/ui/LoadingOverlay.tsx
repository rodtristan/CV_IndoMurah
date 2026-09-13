"use client";

import { cn } from "@/lib/utils";
import { Spinner } from "./Loading";

interface LoadingOverlayProps {
  show: boolean;
  text?: string;
  blur?: boolean;
}

export function LoadingOverlay({ show, text = "Memuat...", blur = true }: LoadingOverlayProps) {
  if (!show) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 z-50 flex items-center justify-center bg-white/60",
        blur && "backdrop-blur-sm"
      )}
    >
      <div className="flex flex-col items-center gap-3 rounded-lg bg-white p-6 shadow-lg">
        <Spinner size="xl" />
        <p className="text-sm font-medium text-gray-600">{text}</p>
      </div>
    </div>
  );
}

interface ProgressBarProps {
  progress: number; // 0-100
  showLabel?: boolean;
  color?: "purple" | "green" | "red" | "blue";
  size?: "sm" | "md" | "lg";
}

const progressColors = {
  purple: "bg-[#9C27B0]",
  green: "bg-green-500",
  red: "bg-red-500",
  blue: "bg-blue-500",
};

const progressSizes = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
};

export function ProgressBar({ progress, showLabel = true, color = "purple", size = "md" }: ProgressBarProps) {
  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-1 flex justify-between text-xs text-gray-500">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
      <div className={cn("w-full overflow-hidden rounded-full bg-gray-200", progressSizes[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-300 ease-out", progressColors[color])}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}

interface DotsLoaderProps {
  color?: "purple" | "white" | "gray";
  size?: "sm" | "md" | "lg";
}

const dotsColors = {
  purple: "bg-[#9C27B0]",
  white: "bg-white",
  gray: "bg-gray-400",
};

export function DotsLoader({ color = "purple", size = "md" }: DotsLoaderProps) {
  const dotSizes = {
    sm: "size-1.5",
    md: "size-2",
    lg: "size-3",
  };

  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "animate-bounce rounded-full",
            dotsColors[color],
            dotSizes[size]
          )}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
