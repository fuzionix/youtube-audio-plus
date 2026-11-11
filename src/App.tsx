import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import PopupHeader from '@/components/popup/PopupHeader';
import ExtensionSwitch from '@/components/popup/ExtensionSwitch';
import PopupFooter from '@/components/popup/PopupFooter';
import PopupSettings from '@/components/popup/PopupSettings';
import { useExtensionEnabled } from '@/hooks/useExtensionEnabled';
import './popup.css';

function App() {
  const { enabled, saving, error, toggle, retry } = useExtensionEnabled();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="popup">
      <PopupHeader />
      {showSettings ? <PopupSettings onBack={() => setShowSettings(false)} /> : <main className="popup-main">
        <div className="popup-intro">
          <span className="popup-eyebrow">MAKE YOUTUBE SOUND LIKE YOURS.</span>
        </div>

        <ExtensionSwitch enabled={enabled} saving={saving} onToggle={toggle} onSettings={() => setShowSettings(true)} />
        {error && (
          <div className="popup-error" role="alert">
            <span>{error}</span>
            {enabled === null && <button type="button" onClick={retry}>Retry</button>}
          </div>
        )}

        <div className="popup-destination-buttons">
          <a className="popup-youtube-button" href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer">
            <span>YouTube</span>
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
          <a className="popup-youtube-music-button" href="https://music.youtube.com/" target="_blank" rel="noopener noreferrer">
            <span>YouTube Music</span>
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>
      </main>}
      <PopupFooter />
    </div>
  );
}

export default App;
