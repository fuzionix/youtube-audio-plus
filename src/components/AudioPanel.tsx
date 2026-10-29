import { useState, useEffect, useRef, useCallback } from "react";
import { RotateCcw, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useViewNavigation } from "@/hooks/useViewNavigation";

import BasicView from "./views/BasicView";
import EqualizerView from "./views/EqualizerView";
import AdvancedView from "./views/AdvancedView";
import VisualEffectView from "./views/VisualEffectView";

// Debounce window for persisting to chrome.storage.sync.
const STORAGE_PERSIST_DELAY_MS = 400;

const AudioPanel = () => {
  const isExtensionEnv = typeof chrome !== "undefined" && !!chrome.storage;
  const [eqValues, setEqValues] = useState<number[]>(new Array(10).fill(0));
  const [isLoaded, setIsLoaded] = useState(!isExtensionEnv);

  const persistTimerRef = useRef<number | undefined>(undefined);
  const latestEqValuesRef = useRef<number[]>(eqValues);

  const {
    currentView,
    currentConfig,
    navigateTo,
    goBack,
    canGoBack
  } = useViewNavigation();

  // Load settings from storage on mount
  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      chrome.storage.sync.get(["ytAudioSettings"], (result: any) => {
        if (chrome.runtime.lastError) {
          console.error(
            "[YouTube Audio Plus] Failed to load settings:",
            chrome.runtime.lastError.message
          );
          setIsLoaded(true);
          return;
        }

        if (result.ytAudioSettings && Array.isArray(result.ytAudioSettings.eqValues)) {
          setEqValues(result.ytAudioSettings.eqValues);
        }
        setIsLoaded(true);
      });
    }
  }, []);

  const persistToStorage = useCallback((values: number[]) => {
    if (typeof chrome === "undefined" || !chrome.storage) return;

    chrome.storage.sync.set({ ytAudioSettings: { eqValues: values } }, () => {
      if (chrome.runtime.lastError) {
        console.error(
          "[YouTube Audio Plus] Failed to persist settings:",
          chrome.runtime.lastError.message
        );
      }
    });
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    latestEqValuesRef.current = eqValues;

    window.postMessage(
      {
        type: "YT_AUDIO_UPDATE",
        payload: { eqValues },
      },
      "*",
    );

    if (persistTimerRef.current) {
      window.clearTimeout(persistTimerRef.current);
    }

    persistTimerRef.current = window.setTimeout(() => {
      persistToStorage(latestEqValuesRef.current);
      persistTimerRef.current = undefined;
    }, STORAGE_PERSIST_DELAY_MS);

    return () => {
      if (persistTimerRef.current) {
        window.clearTimeout(persistTimerRef.current);
        persistTimerRef.current = undefined;
      }
    };
  }, [eqValues, isLoaded, persistToStorage]);

  // Flush any pending persist on unmount so the last change isn't lost if the panel closes before the debounce window elapses.
  useEffect(() => {
    return () => {
      if (persistTimerRef.current) {
        window.clearTimeout(persistTimerRef.current);
        persistTimerRef.current = undefined;
        persistToStorage(latestEqValuesRef.current);
      }
    };
  }, [persistToStorage]);

  const handleReset = () => {
    setEqValues(new Array(10).fill(0));
  };

  const handleEqChange = (index: number, val: number) => {
    const newValues = [...eqValues];
    newValues[index] = val;
    setEqValues(newValues);
  };

  const renderCurrentView = () => {
    const commonProps = {
      eqValues,
      onEqChange: setEqValues,
      onNavigate: navigateTo,
    };

    switch (currentView) {
      case 'basic':
        return <BasicView {...commonProps} />;
      case 'equalizer':
        return <EqualizerView eqValues={eqValues} onEqChange={handleEqChange} />;
      case 'advanced':
        return <AdvancedView />;
      case 'visual':
        return <VisualEffectView />;
      default:
        return <BasicView {...commonProps} />;
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="w-[380px] min-h-40 p-2.5 overflow-hidden text-yt-text font-sans">
      {/* Header */}
      <div className="flex items-center justify-between p-2.5 border-b border-yt-borderLight/50">
        <div className="flex items-center gap-2">
          {canGoBack && (
            <button
              onClick={goBack}
              className="font-medium bg-transparent -ml-1 mb-[1px] border-none outline-none p-0 cursor-pointer text-yt-textSecondary hover:text-yt-text transition-colors"
              aria-label="Back"
              aria-route={currentConfig.title}
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
          <motion.div
            key={currentView}
            initial={{ x: canGoBack ? 50 : -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: canGoBack ? -50 : 50, opacity: 0 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
          >
            {renderCurrentView()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AudioPanel;