import { useTranslation } from '@/utils/i18n';

const AcousticProcessingView = () => {
  const t = useTranslation();
  return (
    <div className="p-4 min-h-[120px]">
      <div className="text-center text-yt-textSecondary">
        {t('acousticProcessingComingSoon')}
      </div>
    </div>
  );
};

export default AcousticProcessingView;