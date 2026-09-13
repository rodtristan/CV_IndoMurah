"use client";

import { Button } from "@/components/ui/Button";
import { House, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[80vh] flex-1 items-center justify-center overflow-hidden bg-white px-6 py-12">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 animate-pulse rounded-full bg-purple-200/40 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 animate-pulse rounded-full bg-violet-200/40 blur-3xl [animation-delay:1s]" />

        <div className="absolute left-[15%] top-[20%] h-3 w-3 animate-bounce rounded-full bg-purple-400/60 [animation-delay:0.3s]" />
        <div className="absolute right-[20%] top-[30%] h-2 w-2 animate-bounce rounded-full bg-violet-500/50 [animation-delay:0.8s]" />
        <div className="absolute bottom-[25%] left-[25%] h-2 w-2 animate-bounce rounded-full bg-purple-300 [animation-delay:1.2s]" />
        <div className="absolute bottom-[20%] right-[30%] h-3 w-3 animate-bounce rounded-full bg-violet-400/60 [animation-delay:1.8s]" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex max-w-xl flex-col items-center text-center">
        {/* 404 */}
        <div className="relative mb-2">
          <div className="absolute inset-0 animate-pulse bg-purple-500/20 blur-3xl" />

          <h1 className="relative select-none text-[9rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-purple-600 via-violet-500 to-purple-300 sm:text-[12rem]">
            404
          </h1>
        </div>

        {/* Small badge */}
        <div className="mb-5 flex animate-pulse items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-600 shadow-sm">
          <Sparkles className="h-4 w-4" />
          Lost in space
        </div>

        <h2 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Page not found
        </h2>

        <p className="mb-8 max-w-md text-base leading-7 text-gray-500">
          Oops! The page you&apos;re looking for seems to have disappeared into
          the digital void.
        </p>

        {/* Button */}
        <Button
          href="/"
          icon={House}
          label="Back to home"
        />
      </div>

      {/* Bottom gradient */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
    </div>
  );
}