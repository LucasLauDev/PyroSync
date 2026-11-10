"use client";

import React from "react";

export const DAYS_OF_WEEK = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export interface CalendarCell {
  day: number;
  isCurrentMonth: boolean;
  dateStr: string;
}

interface FireCalendarGridProps {
  allCells: CalendarCell[];
  startDate: string;
  endDate: string;
  minDate: string;
  maxDate: string;
  onDayClick: (dateStr: string) => void;
}

export function FireCalendarGrid({
  allCells,
  startDate,
  endDate,
  minDate,
  maxDate,
  onDayClick,
}: FireCalendarGridProps) {
  return (
    <div className="w-full">
      {/* Day Header Row */}
      <div className="grid grid-cols-7 text-center mb-1">
        {DAYS_OF_WEEK.map((day) => (
          <span key={day} className="text-[10px] font-mono font-semibold text-slate-500">
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
              onClick={() => onDayClick(cell.dateStr)}
              className={`h-7 w-full rounded flex items-center justify-center text-[11px] font-mono transition-all duration-100 ${
                isOutOfLimits
                  ? "text-slate-700 cursor-not-allowed"
                  : isStart || isEnd
                  ? "bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-950/50 ring-2 ring-amber-300 scale-105 z-10"
                  : isInRange
                  ? "bg-amber-500/25 text-amber-200 hover:bg-amber-500/35 font-medium"
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
  );
}
