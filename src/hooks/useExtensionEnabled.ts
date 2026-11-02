import { useEffect, useState } from 'react';
import {
  readExtensionEnabled,
  subscribeToExtensionEnabled,
  writeExtensionEnabled,
} from '@/utils/extension-state';

export function useExtensionEnabled() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    let changed = false;
    const unsubscribe = subscribeToExtensionEnabled((value) => {
      changed = true;
      setEnabled(value);
    });

    readExtensionEnabled().then((value) => {
      if (active && !changed) setEnabled(value);
    }).catch((cause: unknown) => {
      console.error('[YouTube Audio Plus] Failed to load extension state:', cause);
      if (active) setError('Could not load your preference. Please try again.');
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [attempt]);

  const toggle = async () => {
    if (enabled === null || saving) return;
    const nextEnabled = !enabled;
    setSaving(true);
    setError(null);
    try {
      await writeExtensionEnabled(nextEnabled);
      setEnabled(nextEnabled);
    } catch (cause) {
      console.error('[YouTube Audio Plus] Failed to save extension state:', cause);
      setError('Could not save your preference. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const retry = () => {
    setError(null);
    setAttempt((value) => value + 1);
  };

  return { enabled, saving, error, toggle, retry };
}
