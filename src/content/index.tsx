import React from 'react';
import { createRoot } from 'react-dom/client';

import injectedScriptPath from '@/injected/index.ts?script';

console.log('[YouTube Audio Plus] Content script loaded');

// Inject the Main World script
const injectScript = () => {
  if (document.getElementById('yt-audio-plus-engine')) return;

  const script = document.createElement('script');
  script.src = chrome.runtime.getURL(injectedScriptPath);
  script.type = 'module';
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
};

injectScript();

// Create a mount point inside Shadow DOM
const mountPoint = document.createElement('div');
mountPoint.id = 'root';
// Re-enable pointer events for the actual UI
mountPoint.style.pointerEvents = 'auto'; 

createRoot(mountPoint).render(
  <React.StrictMode>
  </React.StrictMode>
);