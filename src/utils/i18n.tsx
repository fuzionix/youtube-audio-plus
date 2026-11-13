import { createContext, useContext } from 'react';
import type { Locale } from './locale';

const english = {
  audioSettings: 'Audio settings',
  resetAudioSettings: 'Reset audio settings',
  back: 'Back',
  bass: 'Bass',
  bassDescription: 'Boost deep sounds',
  treble: 'Treble',
  trebleDescription: 'Enhance crisp highs',
  equalizer: 'Equalizer',
  advanced: 'Advanced',
  visualEffects: 'Visual Effects',
  advancedComingSoon: 'Advanced View - Coming Soon',
  visualComingSoon: 'Visual Effects - Coming Soon',
  frequencyBand: '{frequency}Hz band',
  popupTagline: 'MAKE YOUTUBE SOUND LIKE YOURS.',
  extensionStatus: 'Extension status',
  audioEnhancement: 'Audio Enhancement',
  loadingPreference: 'Loading preference',
  savingPreference: 'Saving preference',
  extensionOn: 'Extension is on',
  extensionOff: 'Extension is off',
  loadPreferenceError: 'Could not load your preference. Please try again.',
  savePreferenceError: 'Could not save your preference. Please try again.',
  retry: 'Retry',
  project: 'YouTube Audio Plus project',
  relatedLinks: 'Related links',
  howToUse: 'How to use',
  feedback: 'Feedback',
  fineTune: 'Fine-tune your sound',
  tone: 'Tone',
  toneRange: '-12 to +12 dB',
  frequencyBands: '10 frequency bands',
  loadingSettings: 'Loading settings...',
  saveSettingsError: 'Could not save audio settings. Please try again.',
  loadSettingsError: 'Could not load audio settings. Close and reopen settings to retry.',
} as const;

export type MessageKey = keyof typeof english;

const messages: Record<Locale, Record<MessageKey, string>> = {
  en: english,
  'zh-Hant': {
    audioSettings: '音訊設定',
    resetAudioSettings: '重設音訊設定',
    back: '返回',
    bass: '低音',
    bassDescription: '增強低沉音效',
    treble: '高音',
    trebleDescription: '增強清晰高音',
    equalizer: '等化器',
    advanced: '進階設定',
    visualEffects: '視覺效果',
    advancedComingSoon: '進階設定即將推出',
    visualComingSoon: '視覺效果即將推出',
    frequencyBand: '{frequency} Hz 頻段',
    popupTagline: '打造專屬你的 YOUTUBE 音效。',
    extensionStatus: '擴充功能狀態',
    audioEnhancement: '音效增強',
    loadingPreference: '正在載入偏好設定',
    savingPreference: '正在儲存偏好設定',
    extensionOn: '擴充功能已啟用',
    extensionOff: '擴充功能已停用',
    loadPreferenceError: '無法載入偏好設定，請再試一次。',
    savePreferenceError: '無法儲存偏好設定，請再試一次。',
    retry: '重試',
    project: 'YouTube Audio Plus 專案',
    relatedLinks: '相關連結',
    howToUse: '使用方法',
    feedback: '意見回饋',
    fineTune: '微調你的音效',
    tone: '音調',
    toneRange: '-12 至 +12 dB',
    frequencyBands: '10 個頻段',
    loadingSettings: '正在載入設定...',
    saveSettingsError: '無法儲存音訊設定，請再試一次。',
    loadSettingsError: '無法載入音訊設定，請關閉並重新開啟設定以重試。',
  },
};

export const LocaleContext = createContext<Locale>('en');

export function translate(locale: Locale, key: MessageKey, values?: Record<string, string>): string {
  return messages[locale][key].replace(/\{(\w+)\}/g, (match, name: string) => values?.[name] ?? match);
}

export function useTranslation() {
  const locale = useContext(LocaleContext);
  return (key: MessageKey, values?: Record<string, string>) => translate(locale, key, values);
}