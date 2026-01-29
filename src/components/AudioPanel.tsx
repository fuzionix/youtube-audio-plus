import React, { useState, useEffect, useMemo } from "react";
import {
  Speaker,
  MicVocal,
  ChevronLeft,
  RotateCcw,
  SlidersHorizontal,
  KeyboardMusic,
  Headphones
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EqBand from "./EqBand";

const BASS_INDICES = [0, 1, 2];
const TREBLE_INDICES = [7, 8, 9];
const FREQUENCIES = ["32", "64", "125", "250", "500", "1k", "2k", "4k", "8k", "16k"];

interface AudioSliderProps {
  icon: React.ElementType;
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
  formatValue?: (val: number) => string;
  description?: string;
}

const AudioSlider = ({
  icon: Icon,
  label,
  value,
  min,
  max,
  onChange,
  description,
}: AudioSliderProps) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className="group flex items-center justify-between px-4 py-4 rounded-[8px] hover:bg-yt-hover transition-colors cursor-pointer select-none">
      {/* Icon and Label */}
      <div className="flex items-center min-w-[120px] gap-2">
        <Icon size={24} className="text-yt-text pl-2 pr-8" strokeWidth={2} />
        <div>
          <h4 className="m-0 text-yt-text text-[14px] font-medium font-sans">
            {label}
          </h4>
          <h6 className="m-0 text-yt-text text-[12px] opacity-60 font-normal font-sans">
            {description}
          </h6>
        </div>
      </div>

      {/* Slider */}
      <div className="flex items-center justify-end flex-1 max-w-[140px] gap-6 pr-2">
        <div className="relative w-full h-8 flex items-center">
          {/* Custom Range Input */}
          <input
            type="range"
            min={min}
            max={max}
            step={0.1}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="absolute w-full h-full opacity-0 z-10 cursor-pointer"
            aria-label={label}
          />

          {/* Visual Track Background */}
          <div className="absolute w-full h-[4px] bg-yt-sliderTrack rounded-full overflow-hidden">
            {/* Filled portion */}
            <div
              className="h-full bg-white transition-all duration-75 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Visual Thumb (Circle) */}
          <div
            className="absolute h-6 w-6 bg-white rounded-full pointer-events-none transition-transform duration-100 ease-out group-hover:scale-100 scale-0"
            style={{
              left: `calc(${percentage}% - 7.5px)`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

const AudioPanel = () => {
  const [view, setView] = useState<"basic" | "equalizer">("basic");
  const [eqValues, setEqValues] = useState<number[]>(new Array(10).fill(0));

  const calculateAverage = (indices: number[]) => {
    const sum = indices.reduce((acc, index) => acc + eqValues[index], 0);
    return sum / indices.length;
  };

  // Memoize these to prevent jitter during renders, though cheap to calculate
  const bass = useMemo(() => calculateAverage(BASS_INDICES), [eqValues]);
  const treble = useMemo(() => calculateAverage(TREBLE_INDICES), [eqValues]);

  useEffect(() => {
    window.postMessage(
      {
        type: "YT_AUDIO_UPDATE",
        payload: { bass, treble, eqValues },
      },
      "*",
    );
  }, [bass, treble, eqValues]);

  const handleReset = () => {
    setEqValues(new Array(10).fill(0));
  };

  const handleEqChange = (index: number, val: number) => {
    const newValues = [...eqValues];
    newValues[index] = val;
    setEqValues(newValues);
  };

  const handleGroupChange = (indices: number[], newValue: number) => {
    const newValues = [...eqValues];
    
    indices.forEach((index) => {
      newValues[index] = newValue;
    });

    setEqValues(newValues);
  };

  return (
    <div className="w-[380px] min-h-40 p-2.5 bg-yt-background backdrop-blur-lg border-[0.5px] border-solid border-yt-borderLight rounded-[12px] overflow-hidden text-yt-text font-sans">
      {/* Header */}
      <div className="flex items-center justify-between p-2.5 border-b border-yt-borderLight/50">
        <div className="flex items-center gap-2">
          {view === "equalizer" && (
            <button
              onClick={() => setView("basic")}
              className="font-medium bg-transparent -ml-1 mb-[1px] border-none outline-none p-0 cursor-pointer text-yt-textSecondary hover:text-yt-text transition-colors"
              aria-label="Back"
            >
              <ChevronLeft size={16} strokeWidth={2} className="inline-block" />
            </button>
          )}
        </div>
        <button
          onClick={handleReset}
          className="font-medium bg-transparent -mr-1 mb-[1px] border-none outline-none p-0 cursor-pointer text-yt-textSecondary hover:text-yt-text transition-colors"
          aria-label="Reset Audio Settings"
        >
          <RotateCcw size={16} strokeWidth={2} className="inline-block" />
        </button>
      </div>

      {/* Separator Line */}
      <div className="w-[97.5%] h-[0.5px] m-auto bg-yt-borderLight mb-2" />

      {/* Content Area */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {view === "basic" ? (
            <motion.div
              key="basic"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
              className="flex flex-col"
            >
              <AudioSlider
                icon={Speaker}
                label="Bass"
                value={bass}
                min={-10}
                max={10}
                onChange={(val) => handleGroupChange(BASS_INDICES, val)}
                formatValue={(v) => (v > 0 ? `+${v.toFixed(0)}` : v.toFixed(0))}
                description="Boost deep sounds"
              />

              <AudioSlider
                icon={MicVocal}
                label="Treble"
                value={treble}
                min={-10}
                max={10}
                onChange={(val) => handleGroupChange(TREBLE_INDICES, val)}
                formatValue={(v) => (v > 0 ? `+${v.toFixed(0)}` : v.toFixed(0))}
                description="Enhance crisp highs"
              />

              <div>
                <button
                  onClick={() => setView("equalizer")}
                  className="w-full flex items-center justify-center gap-4 mt-2.5 py-3 rounded-[8px] text-yt-text bg-transparent hover:bg-yt-hover transition-colors border border-solid border-yt-borderLight"
                >
                  <SlidersHorizontal
                    size={16}
                    strokeWidth={2}
                  />
                  <span className="inline-block">Equalizer</span>
                </button>
              </div>

              <div className="flex mt-2.5 gap-2.5">
                <button
                  onClick={() => setView("equalizer")}
                  className="w-full flex items-center justify-center gap-4 py-3 rounded-[8px] text-yt-text bg-transparent hover:bg-yt-hover transition-colors border border-solid border-yt-borderLight"
                >
                  <KeyboardMusic
                    size={16}
                    strokeWidth={2}
                  />
                  <span className="inline-block">Advanced</span>
                </button>
                <button
                  onClick={() => setView("equalizer")}
                  className="w-full flex items-center justify-center gap-4 py-3 rounded-[8px] text-yt-text bg-transparent hover:bg-yt-hover transition-colors border border-solid border-yt-borderLight"
                >
                  <Headphones
                    size={16}
                    strokeWidth={2}
                  />
                  <span className="inline-block">Stereo</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="equalizer"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 50, opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
              className="p-4 min-h-[120px]"
            >
              <div className="flex justify-between items-end h-full">
                {FREQUENCIES.map((freq, i) => (
                  <EqBand
                    key={freq}
                    frequency={freq}
                    value={eqValues[i]}
                    onChange={(val) => handleEqChange(i, val)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AudioPanel;