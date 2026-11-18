import EqBand from '../EqBand';
import AudioSlider from '../AudioSlider';
import EqualizerVisualizer from '../EqualizerVisualizer';
import { EQ_FREQUENCIES, MAX_QUALITY_FACTOR, MIN_QUALITY_FACTOR } from '@/utils/audio-settings';
import { useTranslation } from '@/utils/i18n';

interface EqualizerViewProps {
  eqValues: number[];
  onEqChange: (index: number, value: number) => void;
  qualityFactor: number;
  onQualityFactorChange: (value: number) => void;
}

const EqualizerView = ({ eqValues, onEqChange, qualityFactor, onQualityFactorChange }: EqualizerViewProps) => {
  const t = useTranslation();
  return (
    <div className="p-4 min-h-[120px]">
      <EqualizerVisualizer eqValues={eqValues} qualityFactor={qualityFactor} />
      <div className="flex justify-between items-end h-full mb-4">
        {EQ_FREQUENCIES.map((freq, i) => (
          <EqBand
            key={freq}
            frequency={freq}
            value={eqValues[i]}
            onChange={(val) => onEqChange(i, val)}
          />
        ))}
      </div>
      <AudioSlider
        label={t('qualityFactor')}
        description={`${t('qualityFactorDescription')}`}
        value={qualityFactor}
        min={MIN_QUALITY_FACTOR}
        max={MAX_QUALITY_FACTOR}
        onChange={onQualityFactorChange}
      />
    </div>
  );
};

export default EqualizerView;