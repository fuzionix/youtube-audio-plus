import { AudioLines, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from '@/utils/i18n';

interface ExtensionSwitchProps {
  enabled: boolean | null;
  saving: boolean;
  onToggle: () => void;
  onSettings: () => void;
}

export default function ExtensionSwitch({ enabled, saving, onToggle, onSettings }: ExtensionSwitchProps) {
  const t = useTranslation();
  const status = t(enabled === null ? 'loadingPreference' : enabled ? 'extensionOn' : 'extensionOff');

  return (
    <section className="popup-state-card" aria-label={t('extensionStatus')} aria-busy={enabled === null || saving}>
      <div className={`popup-power${enabled ? ' is-enabled' : ''}`}>
        <AudioLines size={20} strokeWidth={2} aria-hidden="true" />
      </div>
      <div className="popup-state-copy">
        <h2 id="extension-switch-label">{t('audioEnhancement')}</h2>
        <p id="extension-switch-status" role="status">
          <span className={`popup-status-dot${enabled ? ' is-enabled' : ''}`} aria-hidden="true" />
          {saving ? t('savingPreference') : status}
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
      <button className="popup-icon-button" type="button" onClick={onSettings} aria-label={t('audioSettings')} title={t('audioSettings')}>
        <SlidersHorizontal size={18} aria-hidden="true" />
      </button>
    </section>
  );
}
