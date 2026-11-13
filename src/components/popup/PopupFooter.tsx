import { ExternalLink } from 'lucide-react';
import { useTranslation } from '@/utils/i18n';

const projectUrl = 'https://github.com/fuzionix/youtube-audio-plus';

export default function PopupFooter() {
  const t = useTranslation();
  return (
    <footer className="popup-footer">
      <nav aria-label={t('relatedLinks')}>
        <a href={`${projectUrl}#usage`} target="_blank" rel="noopener noreferrer">{t('howToUse')}</a>
        <a href={`${projectUrl}/issues`} target="_blank" rel="noopener noreferrer">{t('feedback')}</a>
        <a href={projectUrl} target="_blank" rel="noopener noreferrer">
          GitHub <ExternalLink size={11} aria-hidden="true" />
        </a>
      </nav>
    </footer>
  );
}
