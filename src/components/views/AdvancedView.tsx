import { useTranslation } from '@/utils/i18n';

const AdvancedView = () => {
  const t = useTranslation();
  return (
    <div className="p-4 min-h-[120px]">
      <div className="text-center text-yt-textSecondary">
        {t('advancedComingSoon')}
      </div>
    </div>
  );
};

export default AdvancedView;