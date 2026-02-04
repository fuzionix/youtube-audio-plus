import { useState, useEffect, useMemo } from "react";
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
import AudioSlider from "./AudioSlider";
import EqBand from "./EqBand";

const FREQUENCIES = ["32", "64", "125", "250", "500", "1k", "2k", "4k", "8k", "16k"];

const BASS_WEIGHTS =   [1.0, 1.0, 0.8, 0.3, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
const TREBLE_WEIGHTS = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.3, 0.8, 1.0, 1.0];

const AudioPanel = () => {
  const isExtensionEnv = typeof chrome !== "undefined" && !!chrome.storage;
  const [view, setView] = useState<"basic" | "equalizer">("basic");
  const [eqValues, setEqValues] = useState<number[]>(new Array(10).fill(0));
  const [isLoaded, setIsLoaded] = useState(!isExtensionEnv);

  // Load settings from storage on mount
  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      chrome.storage.sync.get(["ytAudioSettings"], (result: any) => {
        if (result.ytAudioSettings && Array.isArray(result.ytAudioSettings.eqValues)) {
          setEqValues(result.ytAudioSettings.eqValues);
        }
        setIsLoaded(true);
      });
    }
  }, []);

  // Determine the current "Bass" level based on the peak bass frequency (64Hz / Index 1)
  const bassLevel = useMemo(() => eqValues[1], [eqValues]);
  
  // Determine the current "Treble" level based on the peak air frequency (16kHz / Index 9)
  const trebleLevel = useMemo(() => eqValues[9], [eqValues]);

  // Sync changes to Injected Script (Audio Engine) AND Storage
  useEffect(() => {
    if (!isLoaded) return;

    window.postMessage(
      {
        type: "YT_AUDIO_UPDATE",
        payload: { eqValues },
      },
      "*",
    );

    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.sync.set({
        ytAudioSettings: { eqValues }
      });
    }
  }, [eqValues, isLoaded]);

  const handleReset = () => {
    setEqValues(new Array(10).fill(0));
  };

  const handleEqChange = (index: number, val: number) => {
    const newValues = [...eqValues];
    newValues[index] = val;
    setEqValues(newValues);
  };

  const handleBassChange = (val: number) => {
    const newValues = [...eqValues];
    BASS_WEIGHTS.forEach((weight, index) => {
      if (weight > 0) {
        newValues[index] = val * weight;
      }
    });
    setEqValues(newValues);
  };

  const handleTrebleChange = (val: number) => {
    const newValues = [...eqValues];
    TREBLE_WEIGHTS.forEach((weight, index) => {
      if (weight > 0) {
        newValues[index] = val * weight;
      }
    });
    setEqValues(newValues);
  };

  if (!isLoaded) return null; // Prevent flash of default state

  return (
    <div className="w-[380px] min-h-40 p-2.5 overflow-hidden text-yt-text font-sans">
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
                value={bassLevel}
                min={-12}
                max={12}
                onChange={handleBassChange}
                formatValue={(v) => (v > 0 ? `+${v.toFixed(0)}` : v.toFixed(0))}
                description="Boost deep sounds"
              />

              <AudioSlider
                icon={MicVocal}
                label="Treble"
                value={trebleLevel}
                min={-12}
                max={12}
                onChange={handleTrebleChange}
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
                    className="-rotate-90"
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