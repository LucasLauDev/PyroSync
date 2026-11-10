"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapMarker, MarkerCategory } from "./types";
import { formatCoordinate } from "./utils";
import { IconMapPin, IconLoader2, IconSparkles } from "@tabler/icons-react";

interface AddMarkerDialogProps {
  isOpen: boolean;
  coords: { lat: number; lng: number } | null;
  onClose: () => void;
  onSave: (marker: Omit<MapMarker, "id">) => void;
}

const CATEGORIES: { label: string; value: MarkerCategory; defaultColor: string }[] = [
  { label: "Custom Pin", value: "custom", defaultColor: "#ef4444" },
  { label: "Space Center", value: "space", defaultColor: "#3b82f6" },
  { label: "Observatory", value: "observatory", defaultColor: "#f59e0b" },
  { label: "Landmark", value: "landmark", defaultColor: "#10b981" },
];

const PRESET_COLORS = [
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
];

export function AddMarkerDialog({ isOpen, coords, onClose, onSave }: AddMarkerDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<MarkerCategory>("custom");
  const [color, setColor] = useState("#ef4444");
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  useEffect(() => {
    if (isOpen && coords) {
      setTitle("");
      setDescription("");
      setCategory("custom");
      setColor("#ef4444");
      setIsLoadingAddress(true);

      // Reverse geocode via our API route
      fetch(`/api/search?lat=${coords.lat}&lon=${coords.lng}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.displayName) {
            const shortName = data.displayName.split(",")[0].trim();
            setTitle(shortName || "Dropped Pin");
            setDescription(data.displayName);
          } else {
            setTitle("Custom Waypoint");
          }
        })
        .catch(() => {
          setTitle("Custom Waypoint");
        })
        .finally(() => {
          setIsLoadingAddress(false);
        });
    }
  }, [isOpen, coords]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coords) return;
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      lat: coords.lat,
      lng: coords.lng,
      category,
      color,
      isPreset: false,
      createdAt: new Date().toLocaleDateString(),
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[440px] bg-card text-card-foreground shadow-2xl border-border">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow"
              style={{ backgroundColor: color }}
            >
              <IconMapPin className="size-4" />
            </div>
            <DialogTitle className="text-lg font-semibold">Drop New Marker</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {coords ? formatCoordinate(coords.lat, coords.lng) : "Select a location on the map"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="marker-title" className="text-xs font-medium">
                Marker Title
              </Label>
              {isLoadingAddress && (
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground animate-pulse">
                  <IconLoader2 className="size-3 animate-spin" /> Fetching address...
                </span>
              )}
            </div>
            <Input
              id="marker-title"
              placeholder="e.g. My Observation Spot"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="text-sm"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="marker-desc" className="text-xs font-medium">
              Notes or Address
            </Label>
            <Input
              id="marker-desc"
              placeholder="Optional notes or details"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Category</Label>
            <div className="grid grid-cols-2 gap-1.5">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.value}
                  type="button"
                  variant={category === cat.value ? "default" : "outline"}
                  size="sm"
                  className="justify-start text-xs h-8"
                  onClick={() => {
                    setCategory(cat.value);
                    setColor(cat.defaultColor);
                  }}
                >
                  <span
                    className="size-2 rounded-full mr-1.5"
                    style={{ backgroundColor: cat.defaultColor }}
                  />
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Pin Color</Label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`size-6 rounded-full transition-transform ${
                    color === c ? "scale-125 ring-2 ring-primary ring-offset-2 ring-offset-background" : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!title.trim()}>
              Save Marker
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
