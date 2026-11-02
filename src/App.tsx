import { ArrowUpRight } from 'lucide-react';
import PopupHeader from '@/components/popup/PopupHeader';
import ExtensionSwitch from '@/components/popup/ExtensionSwitch';
import PopupFooter from '@/components/popup/PopupFooter';
import { useExtensionEnabled } from '@/hooks/useExtensionEnabled';
import './popup.css';

function App() {
  const { enabled, saving, error, toggle, retry } = useExtensionEnabled();

  return (
    <div className="popup">
      <PopupHeader />
      <main className="popup-main">
        <div className="popup-intro">
          <span className="popup-eyebrow">A LITTLE PLUS. A BETTER LISTEN.</span>
        </div>

        <ExtensionSwitch enabled={enabled} saving={saving} onToggle={toggle} />
        {error && (
          <div className="popup-error" role="alert">
            <span>{error}</span>
            {enabled === null && <button type="button" onClick={retry}>Retry</button>}
          </div>
        )}

        <a className="popup-youtube-button" href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer">
          <span>Open YouTube</span>
          <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      </main>
      <PopupFooter />
    </div>
  );
}

export default App;
