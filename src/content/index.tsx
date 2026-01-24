import React from 'react';
import { createRoot } from 'react-dom/client';

console.log('[YouTube Audio Plus] Content script loaded');

// Inject the Main World script
const injectScript = () => {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('src/injected/index.ts');
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