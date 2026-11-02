import { AudioEngine } from './audio-engine';

console.log('[YouTube Audio Plus] Injected script loaded');

const engine = new AudioEngine();
let extensionEnabled = false;

// 1. Listen for messages from the React UI (Content Script)
window.addEventListener('message', (event) => {
  // Security check: ensure message is from the same window
  if (event.source !== window) return;

  if (event.data?.type === 'YT_AUDIO_ENABLED' && typeof event.data.payload?.enabled === 'boolean') {
    extensionEnabled = event.data.payload.enabled;
    engine.setEnabled(extensionEnabled);
    if (extensionEnabled) attachToVideos();
  }

  if (event.data?.type === 'YT_AUDIO_UPDATE') {
    const { eqValues } = event.data.payload;

    if (Array.isArray(eqValues)) {
      eqValues.forEach((gain: number, index: number) => {
        engine.setFilterGain(index, gain);
      });
    }
  }
});

// 2. Observer to attach to existing and new videos
const attachToVideos = () => {
  if (!extensionEnabled) return;
  const videos = document.querySelectorAll('video');
  videos.forEach((v) => engine.attach(v));
};

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (!extensionEnabled || !(node instanceof Element) || !node.isConnected) continue;
      if (node instanceof HTMLVideoElement) engine.attach(node);
      node.querySelectorAll('video').forEach((video) => engine.attach(video));
    }
  }
  if (mutations.some((mutation) => mutation.removedNodes.length > 0)) {
    engine.releaseDetachedVideos();
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial attach
attachToVideos();

// 3. Notify Content Script that we are ready to receive settings
window.postMessage({ type: 'YT_AUDIO_PLUS_READY' }, '*');