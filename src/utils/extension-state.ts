export const EXTENSION_ENABLED_KEY = 'ytAudioEnabled';

const hasExtensionStorage = () =>
  typeof chrome !== 'undefined' && !!chrome.storage?.sync;

export async function readExtensionEnabled(): Promise<boolean> {
  if (hasExtensionStorage()) {
    const result = await chrome.storage.sync.get(EXTENSION_ENABLED_KEY);
    return result[EXTENSION_ENABLED_KEY] !== false;
  }

  return localStorage.getItem(EXTENSION_ENABLED_KEY) !== 'false';
}

export async function writeExtensionEnabled(enabled: boolean): Promise<void> {
  if (hasExtensionStorage()) {
    await chrome.storage.sync.set({ [EXTENSION_ENABLED_KEY]: enabled });
    return;
  }

  localStorage.setItem(EXTENSION_ENABLED_KEY, String(enabled));
}

export function subscribeToExtensionEnabled(onChange: (enabled: boolean) => void): () => void {
  if (hasExtensionStorage()) {
    const listener = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area === 'sync' && changes[EXTENSION_ENABLED_KEY]) {
        onChange(changes[EXTENSION_ENABLED_KEY].newValue !== false);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }

  const listener = (event: StorageEvent) => {
    if (event.storageArea === localStorage &&
      (event.key === EXTENSION_ENABLED_KEY || event.key === null)) {
      onChange(event.newValue !== 'false');
    }
  };
  window.addEventListener('storage', listener);
  return () => window.removeEventListener('storage', listener);
}
