import { ExternalLink } from 'lucide-react';

const projectUrl = 'https://github.com/fuzionix/youtube-audio-plus';

export default function PopupFooter() {
  return (
    <footer className="popup-footer">
      <nav aria-label="Related links">
        <a href={`${projectUrl}#usage`} target="_blank" rel="noopener noreferrer">How to use</a>
        <a href={`${projectUrl}/issues`} target="_blank" rel="noopener noreferrer">Feedback</a>
        <a href={projectUrl} target="_blank" rel="noopener noreferrer">
          GitHub <ExternalLink size={11} aria-hidden="true" />
        </a>
      </nav>
    </footer>
  );
}
