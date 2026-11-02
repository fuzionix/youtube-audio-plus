import logo from '@/assets/logo/YouTube-Audio-Plus-logo.png';

export default function PopupHeader() {
  return (
    <header className="popup-header">
      <a className="popup-brand" href="https://github.com/fuzionix/youtube-audio-plus" target="_blank" rel="noopener noreferrer" aria-label="YouTube Audio Plus project">
        <img src={logo} alt="" width="34" height="34" />
      </a>
      <span className="popup-edition">0.1.0</span>
    </header>
  );
}
