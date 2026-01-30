import { AudioEngine } from './audio-engine';

console.log('[YouTube Audio Plus] Injected script loaded');

const engine = new AudioEngine();
let debounceTimer: number | undefined;

// 1. Listen for messages from the React UI (Content Script)
window.addEventListener('message', (event) => {
  // Security check: ensure message is from the same window
  if (event.source !== window) return;

  if (event.data?.type === 'YT_AUDIO_UPDATE') {
    const { eqValues } = event.data.payload;

    if (Array.isArray(eqValues)) {
      eqValues.forEach((gain: number, index: number) => {
        engine.setFilterGain(index, gain);
      })
    }
  }
})

// 2. Observer to attach to existing and new videos
const attachToVideos = () => {
  const videos = document.querySelectorAll('video');
  videos.forEach((v) => engine.attach(v));
};

// Example observer setup
const observer = new MutationObserver((mutations) => {
  // Check if any nodes were actually added (ignore attribute changes or text updates)
  const hasAddedNodes = mutations.some(m => m.addedNodes.length > 0);

  if (hasAddedNodes) {
    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = window.setTimeout(() => {
      console.log('[YouTube Audio Plus] Attaching to videos after DOM mutation');
      attachToVideos();
    }, 100);
  }
});

observer.observe(document.body, { childList: true, subtree: true });

attachToVideos();