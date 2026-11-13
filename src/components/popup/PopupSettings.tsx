import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ChevronDown, RotateCcw, SlidersHorizontal } from 'lucide-react';
import PopupSlider from '@/components/popup/PopupSlider';
import { AUDIO_SETTINGS_KEY, BASS_WEIGHTS, EQ_FREQUENCIES, getEqValues, TREBLE_WEIGHTS } from '@/utils/audio-settings';

const hasStorage = () => typeof chrome !== 'undefined' && !!chrome.storage?.sync;

export default function PopupSettings({ onBack }: { onBack: () => void }) {
  const [values, setValues] = useState<number[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const valuesRef = useRef<number[] | null>(null);
  const pendingRef = useRef<number[] | null>(null);
  const timerRef = useRef<number | undefined>(undefined);

  const save = useCallback(() => {
    if (timerRef.current !== undefined) window.clearTimeout(timerRef.current);
    timerRef.current = undefined;
    const pending = pendingRef.current;
    if (!pending) return;
    pendingRef.current = null;
    const settings = { eqValues: pending };
    try {
      if (hasStorage()) {
        void chrome.storage.sync.set({ [AUDIO_SETTINGS_KEY]: settings }).catch((cause: unknown) => {
          console.error('[YouTube Audio Plus] Failed to save audio settings:', cause);
          setError('Could not save audio settings. Please try again.');
        });
      } else {
        localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(settings));
      }
    } catch (cause) {
      console.error('[YouTube Audio Plus] Failed to save audio settings:', cause);
      setError('Could not save audio settings. Please try again.');
    }
  }, []);

  useEffect(() => {
    let active = true;
    let changed = false;
    const applySettings = (settings: unknown) => {
      const next = getEqValues(settings);
      if (valuesRef.current && next.every((value, index) => value === valuesRef.current?.[index])) return;
      if (timerRef.current !== undefined) window.clearTimeout(timerRef.current);
      timerRef.current = undefined;
      pendingRef.current = null;
      valuesRef.current = next;
      setValues(next);
    };
    const listener = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area === 'sync' && changes[AUDIO_SETTINGS_KEY]) {
        changed = true;
        applySettings(changes[AUDIO_SETTINGS_KEY].newValue);
      }
    };
    const localListener = (event: StorageEvent) => {
      if (event.storageArea === localStorage && (event.key === AUDIO_SETTINGS_KEY || event.key === null)) {
        changed = true;
        try { applySettings(event.newValue ? JSON.parse(event.newValue) : null); }
        catch { applySettings(null); }
      }
    };
    if (hasStorage()) {
      chrome.storage.onChanged.addListener(listener);
      void chrome.storage.sync.get(AUDIO_SETTINGS_KEY).then((result) => {
        if (active && !changed) applySettings(result[AUDIO_SETTINGS_KEY]);
      }).catch((cause: unknown) => {
        console.error('[YouTube Audio Plus] Failed to load audio settings:', cause);
        if (active) setError('Could not load audio settings. Close and reopen settings to retry.');
      });
    } else {
      window.addEventListener('storage', localListener);
      try {
        const stored = localStorage.getItem(AUDIO_SETTINGS_KEY);
        applySettings(stored ? JSON.parse(stored) : null);
      } catch {
        applySettings(null);
      }
    }
    window.addEventListener('pagehide', save);
    return () => {
      active = false;
      if (hasStorage()) chrome.storage.onChanged.removeListener(listener);
      else window.removeEventListener('storage', localListener);
      window.removeEventListener('pagehide', save);
      save();
    };
  }, [save]);

  const update = (next: number[]) => {
    valuesRef.current = next;
    setValues(next);
    setError(null);
    pendingRef.current = next;
    if (timerRef.current !== undefined) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(save, 400);
  };

  const updateWeighted = (value: number, weights: number[]) => {
    if (!valuesRef.current) return;
    update(valuesRef.current.map((current, index) => weights[index] ? value * weights[index] : current));
  };

  return (
    <main className="popup-settings">
      <div className="popup-settings-heading">
        <button className="popup-icon-button" type="button" onClick={onBack} aria-label="Back" title="Back">
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <div><h1>Audio settings</h1><p>Fine-tune your sound</p></div>
        <button className="popup-icon-button" type="button" onClick={() => update(EQ_FREQUENCIES.map(() => 0))} disabled={!values} aria-label="Reset audio settings" title="Reset audio settings">
          <RotateCcw size={17} aria-hidden="true" />
        </button>
      </div>
      {error && <div className="popup-error" role="alert">{error} {values && <button type="button" onClick={() => { update(values); save(); }}>Retry</button>}</div>}
      {values ? <div className="popup-settings-content">
        <section className="popup-settings-section" aria-labelledby="tone-heading">
          <div className="popup-section-heading"><h2 id="tone-heading">Tone</h2><span>-12 to +12 dB</span></div>
          {[{ label: 'Bass', index: 1, weights: BASS_WEIGHTS }, { label: 'Treble', index: 9, weights: TREBLE_WEIGHTS }].map(({ label, index, weights }) => (
            <PopupSlider key={label} label={label} value={values[index]} onChange={(value) => updateWeighted(value, weights)} />
          ))}
        </section>
        <details className="popup-equalizer">
          <summary className="popup-equalizer-heading">
            <span className="popup-equalizer-icon"><SlidersHorizontal size={16} aria-hidden="true" /></span>
            <span className="popup-equalizer-title"><strong>Equalizer</strong><span>10 frequency bands</span></span>
            <ChevronDown className="popup-equalizer-chevron" size={17} aria-hidden="true" />
          </summary>
          <div className="popup-equalizer-bands">
            {EQ_FREQUENCIES.map((frequency, index) => (
              <PopupSlider key={frequency} label={`${frequency}`} unit="Hz" value={values[index]} onChange={(value) => {
                const next = [...(valuesRef.current ?? values)];
                next[index] = value;
                update(next);
              }} />
            ))}
          </div>
        </details>
      </div> : !error && <p className="popup-settings-loading" role="status">Loading settings...</p>}
    </main>
  );
}