"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconRotate,
  IconFlame,
  IconClock,
  IconSparkles,
  IconX,
} from "@tabler/icons-react";
import { FireCalendarGrid, CalendarCell } from "./fire-calendar-grid";

interface FireDateRangeCalendarProps {
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
  onChangeDateRange: (start: string, end: string) => void;
  minDate?: string; // e.g. "2000-01-01"
  maxDate?: string; // e.g. "2026-11-09"
  onClose?: () => void;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function FireDateRangeCalendar({
  startDate,
  endDate,
  onChangeDateRange,
  minDate = "2000-01-01",
  maxDate = "2026-11-09",
  onClose,
}: FireDateRangeCalendarProps) {
  // Calendar view year and month
  const initialDate = useMemo(() => {
    if (endDate) {
      const parts = endDate.split("-").map(Number);
      return { year: parts[0] || 2026, month: (parts[1] || 10) - 1 };
    }
    return { year: 2026, month: 9 }; // Oct 2026
  }, [endDate]);

  const [viewYear, setViewYear] = useState<number>(initialDate.year);
  const [viewMonth, setViewMonth] = useState<number>(initialDate.month); // 0-indexed (0 = Jan, 9 = Oct)

  // Selection step: picking start or end
  const [isSelectingEnd, setIsSelectingEnd] = useState<boolean>(false);

  // Quick Range Presets definition
  const PRESETS = useMemo(() => [
    {
      id: "7d",
      label: "7d",
      fullLabel: "Last 7 Days",
      start: "2026-11-02",
      end: "2026-11-09",
      viewYear: 2026,
      viewMonth: 10, // Nov
      description: "Nov 2 – Nov 9, 2026 (Recent hotspot activity)",
    },
    {
      id: "30d",
      label: "30d",
      fullLabel: "Last 30 Days",
      start: "2026-10-10",
      end: "2026-11-09",
      viewYear: 2026,
      viewMonth: 10, // Nov
      description: "Oct 10 – Nov 9, 2026 (Past month window)",
    },
    {
      id: "oct2026",
      label: "Oct '26",
      fullLabel: "Oct 2026 Peak",
      start: "2026-10-01",
      end: "2026-10-31",
      viewYear: 2026,
      viewMonth: 9, // Oct
      description: "Oct 1 – Oct 31, 2026 (Peak fire season)",
    },
    {
      id: "nrt2026",
      label: "Full NRT",
      fullLabel: "Full 2026 NRT",
      start: "2026-09-10",
      end: "2026-11-09",
      viewYear: 2026,
      viewMonth: 9, // Oct
      description: "Sep 10 – Nov 9, 2026 (Full 61-day NRT)",
    },
    {
      id: "all",
      label: "All",
      fullLabel: "2000–2026 Era",
      start: minDate,
      end: maxDate,
      viewYear: 2026,
      viewMonth: 10,
      description: "2000 – 2026 (26-Year climatology)",
    },
  ], [minDate, maxDate]);

  // Determine currently active preset
  const activePreset = useMemo(() => {
    return PRESETS.find((p) => p.start === startDate && p.end === endDate) || null;
  }, [PRESETS, startDate, endDate]);

  // Handle Preset Click
  const handlePresetClick = (preset: typeof PRESETS[0]) => {
    onChangeDateRange(preset.start, preset.end);
    setViewYear(preset.viewYear);
    setViewMonth(preset.viewMonth);
    setIsSelectingEnd(false);
  };

  // Month navigation
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      if (viewYear > 2000) {
        setViewYear(viewYear - 1);
        setViewMonth(11);
      }
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      if (viewYear < 2026) {
        setViewYear(viewYear + 1);
        setViewMonth(0);
      }
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Calendar grid calculations
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // 0 = Monday

  // Pad days before month
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
  const leadingDays = Array.from({ length: firstDayOfWeek }, (_, i) => ({
    day: prevMonthDays - firstDayOfWeek + i + 1,
    isCurrentMonth: false,
    dateStr: "",
  }));

  // Days of current month
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const mStr = String(viewMonth + 1).padStart(2, "0");
    const dStr = String(day).padStart(2, "0");
    const dateStr = `${viewYear}-${mStr}-${dStr}`;
    return {
      day,
      isCurrentMonth: true,
      dateStr,
    };
  });

  const allCells = [...leadingDays, ...currentMonthDays];

  // Handle day click
  const handleDayClick = (dateStr: string) => {
    if (!dateStr) return;
    if (dateStr < minDate || dateStr > maxDate) return;

    if (!isSelectingEnd) {
      // First click: set start date
      onChangeDateRange(dateStr, dateStr);
      setIsSelectingEnd(true);
    } else {
      // Second click: set end date
      if (dateStr < startDate) {
        onChangeDateRange(dateStr, startDate);
      } else {
        onChangeDateRange(startDate, dateStr);
      }
      setIsSelectingEnd(false);
    }
  };

  return (
    <div className="w-full bg-slate-900/95 border border-slate-800 rounded-xl p-3 shadow-xl flex flex-col gap-3">
      {/* 1. Header with Active Range Display */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <IconCalendar className="size-4 text-amber-500" />
          <span className="text-xs font-bold text-white">Date Range Filter</span>
          {activePreset ? (
            <Badge className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold px-1.5 py-0">
              {activePreset.fullLabel}
            </Badge>
          ) : (
            <Badge className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono font-bold px-1.5 py-0 flex items-center gap-1">
              <IconFlame className="size-3 text-cyan-400" /> Custom Range
            </Badge>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="size-6 rounded hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close calendar"
          >
            <IconX className="size-4" />
          </button>
        )}
      </div>

      {/* 2. Quick Filter Presets Segmented Group (Single Row - 0 Wrapping) */}
      <div className="space-y-1.5">
        <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
          <span className="font-semibold text-slate-300 flex items-center gap-1">
            <IconSparkles className="size-3 text-amber-500" />
            <span>Quick Presets:</span>
          </span>
          <span className="text-amber-400 font-medium truncate max-w-[200px]" title={activePreset?.description}>
            {activePreset ? activePreset.description : "Custom Date Range"}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1 p-0.5 rounded-lg bg-slate-950 border border-slate-800 h-8 items-center">
          {PRESETS.map((preset) => {
            const isSelected = activePreset?.id === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetClick(preset)}
                title={preset.description}
                className={`h-7 rounded-md text-[11px] font-mono font-semibold transition-all cursor-pointer flex items-center justify-center whitespace-nowrap select-none ${
                  isSelected
                    ? "bg-amber-500 text-slate-950 font-bold border border-amber-300 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Active Selection Summary Pill */}
      <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800/90 text-[11px] font-mono">
        <span className="text-slate-400 flex items-center gap-1">
          <IconClock className="size-3 text-amber-500" />
          <span>Active Window:</span>
        </span>
        <div className="flex items-center gap-1 font-bold">
          <span className="text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
            {startDate}
          </span>
          <span className="text-slate-500">→</span>
          <span className="text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
            {endDate}
          </span>
        </div>
      </div>

      {/* 4. Calendar Month & Year Controls */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="flex items-center gap-1.5">
          <select
            value={viewMonth}
            onChange={(e) => setViewMonth(Number(e.target.value))}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={name} value={idx}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={viewYear}
            onChange={(e) => setViewYear(Number(e.target.value))}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            {Array.from({ length: 27 }, (_, i) => 2000 + i).map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handlePrevMonth}
            className="size-7 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md"
            title="Previous Month"
          >
            <IconChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className="size-7 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md"
            title="Next Month"
          >
            <IconChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* 5. Calendar Days Grid */}
      <FireCalendarGrid
        allCells={allCells}
        startDate={startDate}
        endDate={endDate}
        minDate={minDate}
        maxDate={maxDate}
        onDayClick={handleDayClick}
      />

      {/* 6. Step Guidance & Reset Footer */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <div>
          {isSelectingEnd ? (
            <span className="text-amber-400 font-semibold animate-pulse flex items-center gap-1">
              <span>👉 Step 2: Click End Date on calendar...</span>
            </span>
          ) : (
            <span className="text-slate-400">
              Click any date to pick a custom range
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            onChangeDateRange("2026-09-10", "2026-11-09");
            setViewYear(2026);
            setViewMonth(9);
            setIsSelectingEnd(false);
          }}
          className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
          title="Reset to Full 2026 NRT"
        >
          <IconRotate className="size-3" /> Reset Default
        </button>
      </div>
    </div>
  );
}
