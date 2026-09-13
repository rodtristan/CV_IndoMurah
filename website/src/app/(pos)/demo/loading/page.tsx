"use client";

import { useState } from "react";
import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { PageTitle } from "@/components/pos/layout/PosLayout";
import { Button } from "@/components/ui/Button";
import { Spinner, Loading, Skeleton, TableSkeleton, CardSkeleton, FormSkeleton } from "@/components/ui/Loading";
import { LoadingOverlay, ProgressBar, DotsLoader } from "@/components/ui/LoadingOverlay";

export default function LoadingDemoPage() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [progress, setProgress] = useState(0);

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <PageWrapper className="bg-gray-100">
      <PageTitle title="Demo - Loading Components" subtitle="Contoh penggunaan komponen loading" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spinners */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Spinner</h3>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <Spinner size="sm" />
              <span className="text-xs text-gray-500">sm</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Spinner size="md" />
              <span className="text-xs text-gray-500">md</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Spinner size="lg" />
              <span className="text-xs text-gray-500">lg</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Spinner size="xl" />
              <span className="text-xs text-gray-500">xl</span>
            </div>
          </div>
        </div>

        {/* Dots Loader */}
        <div className="rounded-lg bg-gray-900 p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-white">Dots Loader (Dark)</h3>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <DotsLoader color="white" size="sm" />
              <span className="text-xs text-gray-400">sm</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <DotsLoader color="white" size="md" />
              <span className="text-xs text-gray-400">md</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <DotsLoader color="white" size="lg" />
              <span className="text-xs text-gray-400">lg</span>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Loading with Text</h3>
          <div className="space-y-4">
            <Loading text="Memuat data..." />
            <Loading text="Mengolah..." size="sm" />
            <Loading text="Tunggu sebentar..." size="lg" />
          </div>
        </div>

        {/* Full Screen Loading */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Full Screen Loading</h3>
          <Button onClick={() => setShowOverlay(true)} className="bg-[#9C27B0]">
            Tampilkan Loading Overlay
          </Button>
          {showOverlay && (
            <>
              <div className="mt-4 rounded-lg border border-gray-200 p-8">
                <p className="text-sm text-gray-500">Klik tombol untuk melihat overlay...</p>
              </div>
              <LoadingOverlay show={showOverlay} text="Memuat halaman..." />
            </>
          )}
        </div>

        {/* Progress Bar */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Progress Bar</h3>
          <div className="space-y-6">
            <ProgressBar progress={progress} />
            <div className="flex gap-2">
              <Button size="sm" onClick={simulateProgress}>Start Progress</Button>
              <Button size="sm" variant="outline" onClick={() => setProgress(0)}>Reset</Button>
            </div>
          </div>
        </div>

        {/* Progress Bar Colors */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Progress Bar Colors</h3>
          <div className="space-y-4">
            <ProgressBar progress={75} color="purple" showLabel={false} />
            <ProgressBar progress={60} color="green" showLabel={false} />
            <ProgressBar progress={45} color="blue" showLabel={false} />
            <ProgressBar progress={30} color="red" showLabel={false} />
          </div>
        </div>

        {/* Skeleton */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Skeleton - Text Lines</h3>
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Skeleton - Table</h3>
          <TableSkeleton rows={4} cols={5} />
        </div>

        {/* Card Skeleton */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Skeleton - Cards</h3>
          <div className="grid grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>

        {/* Form Skeleton */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Skeleton - Form</h3>
          <FormSkeleton />
        </div>
      </div>

      {/* Button Loading States */}
      <div className="mt-6 rounded-lg bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Button Loading States</h3>
        <div className="flex flex-wrap gap-4">
          <Button loading className="bg-[#9C27B0]">Simpan</Button>
          <Button loading variant="outline">Memuat...</Button>
          <Button loading color="success">Berhasil</Button>
          <Button loading color="error">Gagal</Button>
          <Button loading color="warning">Peringatan</Button>
        </div>
      </div>
    </PageWrapper>
  );
}
