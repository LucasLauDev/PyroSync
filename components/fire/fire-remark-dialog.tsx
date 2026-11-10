"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RemarkArea } from "./types";
import {
  IconCrosshair,
  IconMapPin,
  IconCheck,
  IconFlame,
} from "@tabler/icons-react";

interface FireRemarkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyRemark: (area: RemarkArea) => void;
  onFlyTo: (lat: number, lon: number, zoom?: number) => void;
}

const PRESET_FIRE_ZONES = [
  { name: "Central Amazon Rainforest", lat: -3.4659, lon: -62.2159, radiusKm: 75 },
  { name: "Pantanal Wetlands (Brazil/Bolivia)", lat: -17.5021, lon: -56.5241, radiusKm: 100 },
  { name: "Kalimantan Peatlands (Borneo)", lat: -2.2045, lon: 113.9168, radiusKm: 60 },
  { name: "Southern California Forests", lat: 34.2154, lon: -118.2541, radiusKm: 50 },
  { name: "Northern Alberta Boreal Forest", lat: 57.1245, lon: -111.4125, radiusKm: 80 },
  { name: "Yakutia Siberian Taiga", lat: 62.0397, lon: 129.7422, radiusKm: 120 },
  { name: "New South Wales Bushfire Zone", lat: -33.8688, lon: 150.2093, radiusKm: 70 },
  { name: "Miombo Woodland (Tanzania/Zambia)", lat: -8.8456, lon: 34.9214, radiusKm: 90 },
];

export function FireRemarkDialog({
  isOpen,
  onClose,
  onApplyRemark,
  onFlyTo,
}: FireRemarkDialogProps) {
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [radiusKm, setRadiusKm] = useState("50");
  const [name, setName] = useState("");

  const handleApply = () => {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    const radNum = parseFloat(radiusKm) || 50;

    if (isNaN(latNum) || isNaN(lonNum)) {
      alert("Please enter valid latitude and longitude numbers.");
      return;
    }

    if (latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
      alert("Latitude must be between -90 and 90, Longitude between -180 and 180.");
      return;
    }

    const remarkName = name.trim() || `Remark AOI (${latNum.toFixed(2)}°, ${lonNum.toFixed(2)}°)`;

    onFlyTo(latNum, lonNum, 9);
    onApplyRemark({
      type: "circle",
      circle: { lat: latNum, lon: lonNum, radiusKm: radNum },
      name: remarkName,
    });

    onClose();
  };

  const handleSelectPreset = (preset: (typeof PRESET_FIRE_ZONES)[0]) => {
    setLat(preset.lat.toString());
    setLon(preset.lon.toString());
    setRadiusKm(preset.radiusKm.toString());
    setName(preset.name);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700 text-slate-100">
        <DialogHeader>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider">
            <IconCrosshair className="size-4" />
            <span>Target Remark Area</span>
          </div>
          <DialogTitle className="text-base font-bold text-white">
            Enter Latitude, Longitude & Remark Area
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Define an Area of Interest (AOI) to filter hotspots, calculate localized radiative energy, and download custom CSV records.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2 text-xs">
          {/* Quick Preset Buttons */}
          <div>
            <Label className="text-[11px] text-slate-400 font-mono mb-1.5 block">
              Quick Global Fire Hotspot Presets:
            </Label>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
              {PRESET_FIRE_ZONES.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className="px-2 py-1 bg-slate-950 hover:bg-slate-800 text-slate-300 text-[10px] rounded border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3 grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="lat" className="text-slate-300 text-xs">
                Latitude (°N / °S)
              </Label>
              <Input
                id="lat"
                placeholder="e.g. -3.4659"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="bg-slate-950 border-slate-700 text-white font-mono text-xs mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lon" className="text-slate-300 text-xs">
                Longitude (°E / °W)
              </Label>
              <Input
                id="lon"
                placeholder="e.g. -62.2159"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                className="bg-slate-950 border-slate-700 text-white font-mono text-xs mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="radius" className="text-slate-300 text-xs">
                Remark Radius (km)
              </Label>
              <Input
                id="radius"
                type="number"
                min="1"
                max="1000"
                placeholder="50"
                value={radiusKm}
                onChange={(e) => setRadiusKm(e.target.value)}
                className="bg-slate-950 border-slate-700 text-white font-mono text-xs mt-1"
              />
            </div>
            <div>
              <Label htmlFor="label" className="text-slate-300 text-xs">
                Area Label (Optional)
              </Label>
              <Input
                id="label"
                placeholder="e.g. Sector Alpha Burn"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-950 border-slate-700 text-white text-xs mt-1"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleApply}
            className="bg-cyan-600 hover:bg-cyan-500 text-white gap-1.5"
          >
            <IconMapPin className="size-4" />
            Apply Remark Area
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
