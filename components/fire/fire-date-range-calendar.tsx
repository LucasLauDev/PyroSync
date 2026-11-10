"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconRotate,
  IconFlame,
} from "@tabler/icons-react";

interface FireDateRangeCalendarProps {
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
  onChangeDateRange: (start: string, end: string) => void;
  minDate?: string; // e.g. "2000-01-01"
  maxDate?: string; // e.g. "2026-11-09"
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS_OF_WEEK = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export function FireDateRangeCalendar({
  startDate,
  endDate,
  onChangeDateRange,
  minDate = "2000-01-01",
  maxDate = "2026-11-09",
}: FireDateRangeCalendarProps) {
  // Calendar view year and month (default to end date's month or current 2026-10)
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

  // Quick Range Presets
  const handlePreset = (preset: "7d" | "30d" | "oct2026" | "nrt2026" | "all") => {
    switch (preset) {
      case "7d":
        onChangeDateRange("2026-11-02", "2026-11-09");
        setViewYear(2026);
        setViewMonth(10); // Nov
        break;
      case "30d":
        onChangeDateRange("2026-10-10", "2026-11-09");
        setViewYear(2026);
        setViewMonth(10); // Nov
        break;
      case "oct2026":
        onChangeDateRange("2026-10-01", "2026-10-31");
        setViewYear(2026);
        setViewMonth(9); // Oct
        break;
      case "nrt2026":
        onChangeDateRange("2026-09-10", "2026-11-09");
        setViewYear(2026);
        setViewMonth(9); // Oct
        break;
      case "all":
        onChangeDateRange(minDate, maxDate);
        setViewYear(2026);
        setViewMonth(10);
        break;
    }
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
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-lg flex flex-col gap-3">
      {/* 1. Header with Active Range Display */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-1.5">
          <IconCalendar className="size-4 text-amber-500" />
          <span className="text-xs font-semibold text-white">Date Range Filter</span>
        </div>
        <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400 bg-amber-500/10 font-mono">
          {startDate} → {endDate}
        </Badge>
      </div>

      {/* 2. Quick Filter Presets */}
      <div className="flex flex-wrap items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handlePreset("7d")}
          className="h-6 px-2 text-[10px] font-mono text-slate-300 hover:text-white border-slate-700 bg-slate-950/60 hover:bg-amber-950/30 hover:border-amber-500/40"
        >
          Last 7 Days
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handlePreset("30d")}
          className="h-6 px-2 text-[10px] font-mono text-slate-300 hover:text-white border-slate-700 bg-slate-950/60 hover:bg-amber-950/30 hover:border-amber-500/40"
        >
          Last 30 Days
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handlePreset("oct2026")}
          className="h-6 px-2 text-[10px] font-mono text-slate-300 hover:text-white border-slate-700 bg-slate-950/60 hover:bg-amber-950/30 hover:border-amber-500/40"
        >
          Oct 2026 Peak
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handlePreset("nrt2026")}
          className="h-6 px-2 text-[10px] font-mono text-amber-400 hover:text-amber-300 border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20"
        >
          Full 2026 NRT
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handlePreset("all")}
          className="h-6 px-2 text-[10px] font-mono text-slate-400 hover:text-white border-slate-800 bg-slate-950/40"
        >
          2000–2026
        </Button>
      </div>

      {/* 3. Calendar Month & Year Controls */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1">
          <select
            value={viewMonth}
            onChange={(e) => setViewMonth(Number(e.target.value))}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
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
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
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
            className="size-6 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <IconChevronLeft className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className="size-6 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <IconChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* 4. Calendar Days Grid */}
      <div className="w-full">
        {/* Day Header Row */}
        <div className="grid grid-cols-7 text-center mb-1">
          {DAYS_OF_WEEK.map((day) => (
            <span key={day} className="text-[10px] font-mono text-slate-500">
              {day}
            </span>
          ))}
        </div>

        {/* Day Cells */}
        <div className="grid grid-cols-7 gap-1">
          {allCells.map((cell, idx) => {
            if (!cell.isCurrentMonth) {
              return (
                <div
                  key={`leading-${idx}`}
                  className="h-7 flex items-center justify-center text-[10px] text-slate-700 pointer-events-none"
                >
                  {cell.day}
                </div>
              );
            }

            const isStart = cell.dateStr === startDate;
            const isEnd = cell.dateStr === endDate;
            const isInRange = cell.dateStr >= startDate && cell.dateStr <= endDate;
            const isOutOfLimits = cell.dateStr < minDate || cell.dateStr > maxDate;

            return (
              <button
                key={cell.dateStr}
                type="button"
                disabled={isOutOfLimits}
                onClick={() => handleDayClick(cell.dateStr)}
                className={`h-7 w-full rounded flex items-center justify-center text-[11px] font-mono transition-all ${
                  isOutOfLimits
                    ? "text-slate-700 cursor-not-allowed"
                    : isStart || isEnd
                    ? "bg-amber-600 text-white font-bold shadow-md shadow-amber-950/50 ring-1 ring-amber-400"
                    : isInRange
                    ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
                title={cell.dateStr}
              >
                {cell.day}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Instruction / Manual Inputs Footer */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <span>
          {isSelectingEnd ? (
            <span className="text-amber-400 animate-pulse">Click End Date...</span>
          ) : (
            <span>Click Start Date</span>
          )}
        </span>
        <button
          type="button"
          onClick={() => {
            onChangeDateRange("2026-09-10", "2026-11-09");
            setIsSelectingEnd(false);
          }}
          className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors"
        >
          <IconRotate className="size-2.5" /> Reset
        </button>
      </div>
    </div>
  );
}
