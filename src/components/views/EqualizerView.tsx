import EqBand from '../EqBand';
import { EQ_FREQUENCIES } from '@/utils/audio-settings';

interface EqualizerViewProps {
  eqValues: number[];
  onEqChange: (index: number, value: number) => void;
}

const EqualizerView = ({ eqValues, onEqChange }: EqualizerViewProps) => {
  return (
    <div className="p-4 min-h-[120px]">
      <div className="flex justify-between items-end h-full">
        {EQ_FREQUENCIES.map((freq, i) => (
          <EqBand
            key={freq}
            frequency={freq}
            value={eqValues[i]}
            onChange={(val) => onEqChange(i, val)}
          />
        ))}
      </div>
    </div>
  );
};

export default EqualizerView;