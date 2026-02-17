import EqBand from '../EqBand';

const FREQUENCIES = ["32", "64", "125", "250", "500", "1k", "2k", "4k", "8k", "16k"];

interface EqualizerViewProps {
  eqValues: number[];
  onEqChange: (index: number, value: number) => void;
}

const EqualizerView = ({ eqValues, onEqChange }: EqualizerViewProps) => {
  return (
    <div className="p-4 min-h-[120px]">
      <div className="flex justify-between items-end h-full">
        {FREQUENCIES.map((freq, i) => (
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