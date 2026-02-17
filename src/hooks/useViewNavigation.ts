import { useState, useMemo } from 'react';
import { type ViewType, type ViewConfig } from '@/types/views';
import { 
  SlidersHorizontal, 
  KeyboardMusic, 
  Sparkles 
} from 'lucide-react';

const VIEW_CONFIGS: Record<ViewType, ViewConfig> = {
  basic: {
    id: 'basic',
    title: 'Audio Settings',
    showBackButton: false,
  },
  equalizer: {
    id: 'equalizer',
    title: 'Equalizer',
    icon: SlidersHorizontal,
    showBackButton: true,
  },
  advanced: {
    id: 'advanced',
    title: 'Advanced',
    icon: KeyboardMusic,
    showBackButton: true,
  },
  visual: {
    id: 'visual',
    title: 'Visual Effects',
    icon: Sparkles,
    showBackButton: true,
  },
};

export const useViewNavigation = (initialView: ViewType = 'basic') => {
  const [currentView, setCurrentView] = useState<ViewType>(initialView);
  const [viewHistory, setViewHistory] = useState<ViewType[]>([initialView]);

  const currentConfig = useMemo(() => VIEW_CONFIGS[currentView], [currentView]);

  const navigateTo = (view: ViewType) => {
    setViewHistory(prev => [...prev, view]);
    setCurrentView(view);
  };

  const goBack = () => {
    if (viewHistory.length > 1) {
      const newHistory = viewHistory.slice(0, -1);
      setViewHistory(newHistory);
      setCurrentView(newHistory[newHistory.length - 1]);
    }
  };

  const canGoBack = viewHistory.length > 1;

  return {
    currentView,
    currentConfig,
    navigateTo,
    goBack,
    canGoBack,
    viewConfigs: VIEW_CONFIGS,
  };
};