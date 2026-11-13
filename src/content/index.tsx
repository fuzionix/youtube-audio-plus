import React from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import injectedScriptPath from '@/injected/index.ts?script&module';
import styles from '@/index.css?inline';
import AudioControl from '@/components/AudioControl.tsx';
import AudioPanelOverlay from '@/components/AudioPanelOverlay.tsx';
import { EXTENSION_ENABLED_KEY } from '@/utils/extension-state';
import { LocaleContext } from '@/utils/i18n';
import { observeYouTubeLocale, resolveLocale, YOUTUBE_LOCALE_KEY } from '@/utils/locale';
import type { Locale } from '@/utils/locale';

console.log('[YouTube Audio Plus] Content script loaded');

let extensionEnabled = false;
let settingsRevision = 0;
let locale: Locale = 'en';
const mountedRoots = new Map<string, { root: Root; host: Element; component: React.ReactNode }>();

const renderRoot = (root: Root, component: React.ReactNode) => {
  root.render(
    <React.StrictMode>
      <LocaleContext.Provider value={locale}>{component}</LocaleContext.Provider>
    </React.StrictMode>
  );
};

observeYouTubeLocale(document.documentElement, (language) => {
  locale = resolveLocale(language);
  for (const { root, component } of mountedRoots.values()) renderRoot(root, component);
  void chrome.storage.local.set({ [YOUTUBE_LOCALE_KEY]: language }).catch((error: unknown) => {
    console.error('[YouTube Audio Plus] Failed to save YouTube language:', error);
  });
});

const syncSettingsToInjectedScript = async () => {
  const revision = ++settingsRevision;
  try {
    const result = await chrome.storage.sync.get(['ytAudioSettings', EXTENSION_ENABLED_KEY]);
    if (revision !== settingsRevision) return;

    extensionEnabled = result[EXTENSION_ENABLED_KEY] !== false;
    if (extensionEnabled) injectEngine();
    window.postMessage({
      type: 'YT_AUDIO_ENABLED',
      payload: { enabled: extensionEnabled },
    }, '*');
    ensureMounted();

    const settings = result.ytAudioSettings;
    if (settings && typeof settings === 'object' &&
      'eqValues' in settings && Array.isArray(settings.eqValues)) {
      console.log('[YouTube Audio Plus] Syncing initial settings');
      window.postMessage({
        type: 'YT_AUDIO_UPDATE',
        payload: { eqValues: settings.eqValues }
      }, '*');
    }
  } catch (e) {
    console.error('[YouTube Audio Plus] Failed to sync settings:', e);
  }
};

// Listen for the Injected Script to say it's ready
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (event.data?.type === 'YT_AUDIO_PLUS_READY') {
    syncSettingsToInjectedScript();
  }
});

// Listen for storage changes (e.g., if changed in another tab OR another device)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && (changes.ytAudioSettings || changes[EXTENSION_ENABLED_KEY])) {
    syncSettingsToInjectedScript();
  }
});

// 1. Inject the Main World script
let engineInjected = false;
const injectEngine = () => {
  if (engineInjected) return;
  engineInjected = true;
  const script = document.createElement('script');
  script.id = 'yt-audio-plus-engine';
  script.src = chrome.runtime.getURL(injectedScriptPath);
  script.type = 'module';
  script.onload = () => script.remove();
  script.onerror = () => {
    engineInjected = false;
    script.remove();
    console.error('[YouTube Audio Plus] Failed to load audio engine');
  };
  (document.head || document.documentElement).appendChild(script);
};

// 2. Helper to Create Shadow Root with Styles
const createShadowRoot = (containerId: string, parent: Element) => {
  if (parent.querySelector(`#${containerId}`)) return null;

  const container = document.createElement('div');
  container.id = containerId;

  if (containerId === 'yt-audio-plus-panel') {
    container.className = 'ytp-audio-plus-layer';
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '60';
    parent.appendChild(container);
  } else {
    container.style.display = 'inline-flex';
    container.style.alignItems = 'center';
    parent.appendChild(container);
  }

  const shadow = container.attachShadow({ mode: 'open' });
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  shadow.appendChild(styleSheet);

  return shadow;
};

const getMainPlayer = (): HTMLElement | null => {
  return document.querySelector<HTMLElement>('#movie_player');
};

// 3. Inject Control Button
const injectButton = () => {
  const player = getMainPlayer();
  if (!player) return;

  const leftControls = player.querySelector<HTMLElement>('.ytp-left-controls');
  if (!leftControls) return;

  const shadow = createShadowRoot('yt-audio-plus-button', leftControls);
  if (!shadow) return;

  const mountPoint = document.createElement('div');
  mountPoint.className = 'flex items-center h-full';
  shadow.appendChild(mountPoint);

  const root = createRoot(mountPoint);
  const component = <AudioControl />;
  mountedRoots.set('yt-audio-plus-button', { root, host: shadow.host, component });
  renderRoot(root, component);
};

// 4. Inject Panel Overlay
const injectPanel = () => {
  const player = getMainPlayer();
  if (!player) return;

  const shadow = createShadowRoot('yt-audio-plus-panel', player);
  if (!shadow) return;

  const mountPoint = document.createElement('div');

  // Pointer events auto to re-enable clicking on the panel itself
  mountPoint.className = 'w-full h-full';
  shadow.appendChild(mountPoint);

  const root = createRoot(mountPoint);
  const component = <AudioPanelOverlay />;
  mountedRoots.set('yt-audio-plus-panel', { root, host: shadow.host, component });
  renderRoot(root, component);
};

// 5. Debounce mount checks to avoid excessive DOM queries
const MOUNT_CHECK_DELAY = 150;
let mountCheckTimer: number | undefined;

const ensureMounted = () => {
  for (const [id, { root, host }] of mountedRoots) {
    if (!extensionEnabled || !host.isConnected) {
      root.unmount();
      host.remove();
      mountedRoots.delete(id);
    }
  }
  if (!extensionEnabled) return;
  if (!document.querySelector('#yt-audio-plus-button')) injectButton();
  if (!document.querySelector('#yt-audio-plus-panel')) injectPanel();
};

const scheduleMountCheck = () => {
  if (mountCheckTimer) clearTimeout(mountCheckTimer);
  mountCheckTimer = window.setTimeout(ensureMounted, MOUNT_CHECK_DELAY);
};

const observer = new MutationObserver((mutations) => {
  const hasAddedNodes = mutations.some((m) => m.addedNodes.length > 0);
  if (!hasAddedNodes) return;

  scheduleMountCheck();
});

const startObserving = () => {
  const target = document.body;
  if (target) {
    observer.observe(target, { childList: true, subtree: true });
  }
};

const init = () => {
  syncSettingsToInjectedScript();
};

startObserving();
init();