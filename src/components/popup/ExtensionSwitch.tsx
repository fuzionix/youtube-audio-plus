import { AudioLines, SlidersHorizontal } from 'lucide-react';

interface ExtensionSwitchProps {
  enabled: boolean | null;
  saving: boolean;
  onToggle: () => void;
  onSettings: () => void;
}

export default function ExtensionSwitch({ enabled, saving, onToggle, onSettings }: ExtensionSwitchProps) {
  const status = enabled === null ? 'Loading preference' : enabled ? 'Extension is on' : 'Extension is off';

  return (
    <section className="popup-state-card" aria-label="Extension status" aria-busy={enabled === null || saving}>
      <div className={`popup-power${enabled ? ' is-enabled' : ''}`}>
        <AudioLines size={20} strokeWidth={2} aria-hidden="true" />
      </div>
      <div className="popup-state-copy">
        <h2 id="extension-switch-label">Audio Enhancement</h2>
        <p id="extension-switch-status" role="status">
          <span className={`popup-status-dot${enabled ? ' is-enabled' : ''}`} aria-hidden="true" />
          {saving ? 'Saving preference' : status}
        </p>
      </div>
      <button
        className="popup-switch"
        type="button"
        role="switch"
        aria-checked={enabled === true}
        aria-labelledby="extension-switch-label"
        aria-describedby="extension-switch-status"
        disabled={enabled === null || saving}
        onClick={onToggle}
      >
        <span className="popup-switch-thumb" />
      </button>
      <button className="popup-icon-button" type="button" onClick={onSettings} aria-label="Audio settings" title="Audio settings">
        <SlidersHorizontal size={18} aria-hidden="true" />
      </button>
    </section>
  );
}
