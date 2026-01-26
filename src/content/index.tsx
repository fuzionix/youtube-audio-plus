import React from 'react';
import { createRoot } from 'react-dom/client';
import injectedScriptPath from '@/injected/index.ts?script';
import styles from '@/index.css?inline';
import AudioControl from '@/components/AudioControl.tsx';
import AudioPanelOverlay from '@/components/AudioPanelOverlay.tsx';

console.log('[YouTube Audio Plus] Content script loaded');

// 1. Inject the Main World script
const injectEngine = () => {
  if (document.getElementById('yt-audio-plus-engine')) return;
  const script = document.createElement('script');
  script.id = 'yt-audio-plus-engine';
  script.src = chrome.runtime.getURL(injectedScriptPath);
  script.type = 'module';
  script.onload = () => script.remove();
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

// 3. Inject Control Button
const injectButton = () => {
  const leftControls = document.querySelector('.ytp-left-controls');
  if (!leftControls) return;

  const shadow = createShadowRoot('yt-audio-plus-button', leftControls);
  if (!shadow) return;

  const mountPoint = document.createElement('div');
  mountPoint.className = 'flex items-center h-full';
  shadow.appendChild(mountPoint);

  createRoot(mountPoint).render(
    <React.StrictMode>
      <AudioControl />
    </React.StrictMode>
  );
};

// 4. Inject Panel Overlay
const injectPanel = () => {
  const player = document.querySelector('#movie_player'); 
  if (!player) return;

  const shadow = createShadowRoot('yt-audio-plus-panel', player);
  if (!shadow) return;

  const mountPoint = document.createElement('div');

  // Pointer events auto to re-enable clicking on the panel itself
  mountPoint.className = 'w-full h-full'; 
  shadow.appendChild(mountPoint);

  createRoot(mountPoint).render(
    <React.StrictMode>
      <AudioPanelOverlay />
    </React.StrictMode>
  );
};

const observer = new MutationObserver(() => {
  if (!document.querySelector('#yt-audio-plus-button')) injectButton();
  if (!document.querySelector('#yt-audio-plus-panel')) injectPanel();
});

const startObserving = () => {
  const target = document.body;
  if (target) {
    observer.observe(target, { childList: true, subtree: true });
  }
};

const init = () => {
  injectEngine();
  injectButton();
  injectPanel();
};

startObserving();
init();