import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LocaleContext } from './utils/i18n'
import { resolveLocale, YOUTUBE_LOCALE_KEY } from './utils/locale'
import type { Locale } from './utils/locale'

export function Popup() {
  const [locale, setLocale] = useState<Locale>('en')

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) return
    let active = true
    let changed = false
    const listener = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area !== 'local' || !changes[YOUTUBE_LOCALE_KEY]) return
      changed = true
      setLocale(resolveLocale(changes[YOUTUBE_LOCALE_KEY].newValue))
    }
    chrome.storage.onChanged.addListener(listener)
    void chrome.storage.local.get(YOUTUBE_LOCALE_KEY).then((result) => {
      if (active && !changed) setLocale(resolveLocale(result[YOUTUBE_LOCALE_KEY]))
    }).catch((error: unknown) => {
      console.error('[YouTube Audio Plus] Failed to load YouTube language:', error)
    })
    return () => {
      active = false
      chrome.storage.onChanged.removeListener(listener)
    }
  }, [])

  return <LocaleContext.Provider value={locale}><App /></LocaleContext.Provider>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Popup />
  </StrictMode>,
)
