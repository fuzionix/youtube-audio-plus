import { useTranslation } from '@/utils/i18n';

const VisualEffectView = () => {
  const t = useTranslation();
  return (
    <div className="p-4 min-h-[120px]">
      <div className="text-center text-yt-textSecondary">
        {t('visualComingSoon')}
      </div>
    </div>
  );
};

export default VisualEffectView;