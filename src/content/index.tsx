import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import injectedScriptPath from '@/injected/index.ts?script';
import styles from '@/index.css?inline';
import AudioControl from '@/components/AudioControl.tsx';

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

injectEngine();

// 2. UI Injection Logic
let reactRoot: Root | null = null;

const injectUI = () => {
  // Target the left controls (Play, Next, Volume)
  const leftControls = document.querySelector('.ytp-left-controls');
  
  // Prevent duplicate injection
  if (!leftControls || leftControls.querySelector('#yt-audio-plus-container')) return;

  const container = document.createElement('div');
  container.id = 'yt-audio-plus-container';
  container.style.display = 'inline-flex';
  container.style.alignItems = 'center';
  
  // Insert after the volume area (usually appending is safer for layout)
  // To place it exactly "next to sound button", append it to left-controls.
  leftControls.appendChild(container);

  // Create Shadow DOM to isolate styles
  const shadow = container.attachShadow({ mode: 'open' });

  // Inject Tailwind Styles into Shadow DOM
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  shadow.appendChild(styleSheet);

  // Mount Point inside Shadow DOM
  const mountPoint = document.createElement('div');
  mountPoint.className = 'flex items-center h-full relative';
  shadow.appendChild(mountPoint);

  reactRoot = createRoot(mountPoint);
  reactRoot.render(
    <React.StrictMode>
      <AudioControl />
    </React.StrictMode>
  );
};

// 3. Observer to handle navigation and dynamic loading
const observer = new MutationObserver(() => {
  if (!document.querySelector('#yt-audio-plus-container')) {
    injectUI();
  }
});

const startObserving = () => {
  const target = document.body; // Broad observer to catch SPA navigation
  if (target) {
    observer.observe(target, { childList: true, subtree: true });
  }
};

startObserving();
injectUI();