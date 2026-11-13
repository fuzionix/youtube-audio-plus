import { useMemo } from 'react';
import { 
  Speaker, 
  MicVocal, 
  SlidersHorizontal, 
  KeyboardMusic, 
  Sparkles 
} from 'lucide-react';
import AudioSlider from '../AudioSlider';
import { type ViewType } from '../../types/views';
import { BASS_WEIGHTS, TREBLE_WEIGHTS } from '@/utils/audio-settings';
import { useTranslation } from '@/utils/i18n';

interface BasicViewProps {
  eqValues: number[];
  onEqChange: (values: number[]) => void;
  onNavigate: (view: ViewType) => void;
}

const BasicView = ({ eqValues, onEqChange, onNavigate }: BasicViewProps) => {
  const t = useTranslation();
  // Determine the current "Bass" level based on the peak bass frequency
  const bassLevel = useMemo(() => eqValues[1], [eqValues]);
  
  // Determine the current "Treble" level based on the peak air frequency
  const trebleLevel = useMemo(() => eqValues[9], [eqValues]);

  const handleBassChange = (val: number) => {
    const newValues = [...eqValues];
    BASS_WEIGHTS.forEach((weight, index) => {
      if (weight > 0) {
        newValues[index] = val * weight;
      }
    });
    onEqChange(newValues);
  };

  const handleTrebleChange = (val: number) => {
    const newValues = [...eqValues];
    TREBLE_WEIGHTS.forEach((weight, index) => {
      if (weight > 0) {
        newValues[index] = val * weight;
      }
    });
    onEqChange(newValues);
  };

  return (
    <div className="flex flex-col">
      <AudioSlider
        icon={Speaker}
        label={t('bass')}
        value={bassLevel}
        min={-12}
        max={12}
        onChange={handleBassChange}
        formatValue={(v) => (v > 0 ? `+${v.toFixed(0)}` : v.toFixed(0))}
        description={t('bassDescription')}
      />

      <AudioSlider
        icon={MicVocal}
        label={t('treble')}
        value={trebleLevel}
        min={-12}
        max={12}
        onChange={handleTrebleChange}
        formatValue={(v) => (v > 0 ? `+${v.toFixed(0)}` : v.toFixed(0))}
        description={t('trebleDescription')}
      />

      <div>
        <button
          onClick={() => onNavigate('equalizer')}
          className="w-full flex items-center justify-center gap-4 mt-2.5 py-3 rounded-[8px] text-yt-text bg-transparent hover:bg-yt-hover transition-colors border border-solid border-yt-borderLight"
        >
          <SlidersHorizontal
            size={16}
            strokeWidth={2}
            className="-rotate-90"
          />
          <span className="inline-block">{t('equalizer')}</span>
        </button>
      </div>

      <div className="flex mt-2.5 gap-2.5">
        <button
          onClick={() => onNavigate('advanced')}
          className="w-full flex items-center justify-center gap-4 py-3 rounded-[8px] text-yt-text bg-transparent hover:bg-yt-hover transition-colors border border-solid border-yt-borderLight"
        >
          <KeyboardMusic
            size={16}
            strokeWidth={2}
          />
          <span className="inline-block">{t('advanced')}</span>
        </button>
        <button
          onClick={() => onNavigate('visual')}
          className="w-full flex items-center justify-center gap-4 py-3 rounded-[8px] text-yt-text bg-transparent hover:bg-yt-hover transition-colors border border-solid border-yt-borderLight"
        >
          <Sparkles
            size={16}
            strokeWidth={2}
          />
          <span className="inline-block">{t('visualEffects')}</span>
        </button>
      </div>
    </div>
  );
};

export default BasicView;