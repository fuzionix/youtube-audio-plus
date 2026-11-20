import { useState, useEffect, useRef, useCallback } from "react";
import { RotateCcw, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useViewNavigation } from "@/hooks/useViewNavigation";
import { DEFAULT_QUALITY_FACTOR, getEqValues, getQualityFactor } from "@/utils/audio-settings";
import type { AudioSettings } from "@/utils/audio-settings";
import { useTranslation } from "@/utils/i18n";

import BasicView from "./views/BasicView";
import EqualizerView from "./views/EqualizerView";
import AcousticProcessingView from "./views/AcousticProcessingView";
import VisualEffectView from "./views/VisualEffectView";

// Debounce window for persisting to chrome.storage.sync.
const STORAGE_PERSIST_DELAY_MS = 400;

const AudioPanel = () => {
  const t = useTranslation();
  const isExtensionEnv = typeof chrome !== "undefined" && !!chrome.storage;
  const [eqValues, setEqValues] = useState<number[]>(new Array(10).fill(0));
  const [qualityFactor, setQualityFactor] = useState(DEFAULT_QUALITY_FACTOR);
  const [isLoaded, setIsLoaded] = useState(!isExtensionEnv);

  const persistTimerRef = useRef<number | undefined>(undefined);
  const latestSettingsRef = useRef<AudioSettings>({ eqValues, qualityFactor });
  const pendingSettingsRef = useRef<AudioSettings | undefined>(undefined);

  const {
    currentView,
    currentConfig,
    navigateTo,
    goBack,
    canGoBack
  } = useViewNavigation();

  useEffect(() => {
    if (typeof chrome === "undefined" || !chrome.storage) return;
    let active = true;
    let changed = false;

    const listener = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area !== "sync" || !changes.ytAudioSettings) return;
      changed = true;
      const values = getEqValues(changes.ytAudioSettings.newValue);
      const nextQualityFactor = getQualityFactor(changes.ytAudioSettings.newValue);
      if (values.every((value, index) => value === latestSettingsRef.current.eqValues[index])) {
        if (nextQualityFactor === latestSettingsRef.current.qualityFactor) return;
        latestSettingsRef.current = { eqValues: values, qualityFactor: nextQualityFactor };
        if (pendingSettingsRef.current) pendingSettingsRef.current = latestSettingsRef.current;
        setQualityFactor(nextQualityFactor);
        return;
      }

      if (persistTimerRef.current) window.clearTimeout(persistTimerRef.current);
      persistTimerRef.current = undefined;
      pendingSettingsRef.current = undefined;
      latestSettingsRef.current = { eqValues: values, qualityFactor: nextQualityFactor };
      setEqValues(values);
      setQualityFactor(nextQualityFactor);
    };

    chrome.storage.onChanged.addListener(listener);
    chrome.storage.sync.get(["ytAudioSettings"], (result) => {
      if (!active) return;
      if (chrome.runtime.lastError) {
        console.error("[YouTube Audio Plus] Failed to load settings:", chrome.runtime.lastError.message);
      } else if (!changed) {
        const values = getEqValues(result.ytAudioSettings);
        const nextQualityFactor = getQualityFactor(result.ytAudioSettings);
        latestSettingsRef.current = { eqValues: values, qualityFactor: nextQualityFactor };
        setEqValues(values);
        setQualityFactor(nextQualityFactor);
      }
      setIsLoaded(true);
    });
    return () => {
      active = false;
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  const persistToStorage = useCallback((settings: AudioSettings) => {
    if (typeof chrome === "undefined" || !chrome.storage) return;

    chrome.storage.sync.set({ ytAudioSettings: settings }, () => {
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

    window.postMessage(
      {
        type: "YT_AUDIO_UPDATE",
        payload: { eqValues, qualityFactor },
      },
      "*",
    );
  }, [eqValues, qualityFactor, isLoaded]);

  // Flush any pending persist on unmount so the last change isn't lost if the panel closes before the debounce window elapses.
  useEffect(() => {
    return () => {
      if (persistTimerRef.current) {
        window.clearTimeout(persistTimerRef.current);
        persistTimerRef.current = undefined;
      }
      if (pendingSettingsRef.current) {
        persistToStorage(pendingSettingsRef.current);
        pendingSettingsRef.current = undefined;
      }
    };
  }, [persistToStorage]);

  const updateSettings = (settings: AudioSettings) => {
    latestSettingsRef.current = settings;
    pendingSettingsRef.current = settings;
    setEqValues(settings.eqValues);
    setQualityFactor(settings.qualityFactor);
    if (persistTimerRef.current) window.clearTimeout(persistTimerRef.current);
    persistTimerRef.current = window.setTimeout(() => {
      if (pendingSettingsRef.current) persistToStorage(pendingSettingsRef.current);
      pendingSettingsRef.current = undefined;
      persistTimerRef.current = undefined;
    }, STORAGE_PERSIST_DELAY_MS);
  };

  const updateEqValues = (values: number[]) => {
    updateSettings({ ...latestSettingsRef.current, eqValues: values });
  };

  const handleReset = () => {
    updateSettings({ eqValues: new Array(10).fill(0), qualityFactor: DEFAULT_QUALITY_FACTOR });
  };

  const handleEqChange = (index: number, val: number) => {
    const newValues = [...eqValues];
    newValues[index] = val;
    updateEqValues(newValues);
  };

  const renderCurrentView = () => {
    const commonProps = {
      eqValues,
      onEqChange: updateEqValues,
      onNavigate: navigateTo,
    };

    switch (currentView) {
      case 'basic':
        return <BasicView {...commonProps} />;
      case 'equalizer':
        return <EqualizerView eqValues={eqValues} onEqChange={handleEqChange}
          qualityFactor={qualityFactor}
          onQualityFactorChange={(value) => updateSettings({ ...latestSettingsRef.current, qualityFactor: value })} />;
      case 'acoustic':
        return <AcousticProcessingView />;
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
              aria-label={t('back')}
              aria-route={t(currentConfig.title)}
            >
              <ChevronLeft size={16} strokeWidth={2} className="inline-block" />
            </button>
          )}
        </div>
        <button
          onClick={handleReset}
          className="font-medium bg-transparent -mr-1 mb-[1px] border-none outline-none p-0 cursor-pointer text-yt-textSecondary hover:text-yt-text transition-colors"
          aria-label={t('resetAudioSettings')}
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