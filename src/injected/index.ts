import { AudioEngine } from './audio-engine';

console.log('[YouTube Audio Plus] Injected script loaded');

const engine = new AudioEngine();

// Example observer setup
const observer = new MutationObserver((mutations) => {
  // Logic to detect video elements will go here
  console.log('DOM Mutation detected', mutations.length);
  console.log('Current Audio Context:', engine);
});

observer.observe(document.body, { childList: true, subtree: true });