"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  startDate?: Date | null;
  endDate?: Date | null;
  onChange?: (start: Date | null, end: Date | null) => void;
  placeholder?: string;
  className?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  placeholder = "Pilih rentang tanggal",
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(startDate || new Date());
  const [selecting, setSelecting] = useState<"start" | "end">("start");
  const containerRef = useRef<HTMLDivElement>(null);

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const days = ["Mi", "Se", "Sl", "Ra", "Ka", "Ju", "Sa"];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(viewDate);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const isInRange = (day: number) => {
    if (!startDate || !endDate) return false;
    const date = new Date(year, month, day);
    return date >= startDate && date <= endDate;
  };

  const isStart = (day: number) => {
    if (!startDate) return false;
    const date = new Date(year, month, day);
    return date.toDateString() === startDate.toDateString();
  };

  const isEnd = (day: number) => {
    if (!endDate) return false;
    const date = new Date(year, month, day);
    return date.toDateString() === endDate.toDateString();
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(year, month, day);
    if (selecting === "start") {
      onChange?.(clickedDate, null);
      setSelecting("end");
    } else {
      if (startDate && clickedDate < startDate) {
        onChange?.(clickedDate, startDate);
      } else {
        onChange?.(startDate ?? null, clickedDate);
      }
      setSelecting("start");
      setIsOpen(false);
    }
  };

  const formatDisplay = () => {
    if (!startDate && !endDate) return placeholder;
    const options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };
    if (startDate && endDate) {
      return `${startDate.toLocaleDateString("id-ID", options)} - ${endDate.toLocaleDateString("id-ID", options)}`;
    }
    return startDate ? startDate.toLocaleDateString("id-ID", options) : "";
  };

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center gap-2 rounded-md border-0 bg-bg px-3 py-2 text-sm ring-1 ring-inset",
          isOpen ? "ring-2 ring-primary" : "ring-default hover:ring-accented"
        )}
      >
        <Calendar className="size-4 text-dimmed" />
        <span className={startDate || endDate ? "text-highlighted" : "text-dimmed"}>
          {formatDisplay()}
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 rounded-lg border border-default bg-bg p-4 shadow-lg">
          {/* Month navigation */}
          <div className="mb-4 flex items-center justify-between">
            <button onClick={prevMonth} className="rounded p-1 hover:bg-elevated">
              <ChevronLeft className="size-4" />
            </button>
            <span className="font-medium">
              {months[month]} {year}
            </span>
            <button onClick={nextMonth} className="rounded p-1 hover:bg-elevated">
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* Days header */}
          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs text-muted">
            {days.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const inRange = isInRange(day);
              const isStartDay = isStart(day);
              const isEndDay = isEnd(day);
              const isSelected = isStartDay || isEndDay;

              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    "flex size-8 items-center justify-center rounded text-sm",
                    !isSelected && "hover:bg-elevated",
                    inRange && !isSelected && "bg-primary/10",
                    isStartDay && "rounded-r-none bg-primary text-white",
                    isEndDay && "rounded-l-none bg-primary text-white",
                    isStartDay && isEndDay && "rounded bg-primary text-white",
                    !isSelected && !inRange && "text-toned"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Quick select buttons */}
          <div className="mt-4 flex flex-wrap gap-2 border-t border-default pt-4">
            <button
              onClick={() => {
                const today = new Date();
                const start = new Date(today.getFullYear(), today.getMonth(), 1);
                onChange?.(start, today);
                setIsOpen(false);
              }}
              className="rounded bg-elevated px-2 py-1 text-xs hover:bg-default"
            >
              Bulan Ini
            </button>
            <button
              onClick={() => {
                const today = new Date();
                onChange?.(today, today);
                setIsOpen(false);
              }}
              className="rounded bg-elevated px-2 py-1 text-xs hover:bg-default"
            >
              Hari Ini
            </button>
            <button
              onClick={() => {
                onChange?.(null, null);
                setIsOpen(false);
              }}
              className="rounded bg-elevated px-2 py-1 text-xs hover:bg-default"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
