import type { CSSProperties } from 'react';

type PopupSliderProps = {
  label: string;
  unit?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  bipolar?: boolean;
  valueUnit?: string;
};

export default function PopupSlider({ label, unit, value, onChange, min = -12, max = 12, bipolar = true, valueUnit = 'dB' }: PopupSliderProps) {
  const position = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const origin = bipolar ? 50 : 0;
  const style = {
    '--slider-start': `${Math.min(origin, position)}%`,
    '--slider-end': `${Math.max(origin, position)}%`,
  } as CSSProperties;
  const formattedNumber = `${bipolar && value > 0 ? '+' : ''}${Number(value.toFixed(1))}`;
  const formattedValue = valueUnit ? `${formattedNumber} ${valueUnit}` : formattedNumber;

  return (
    <label className="popup-setting-row">
      <span className="popup-setting-label">{label}{unit && <> <span className="popup-setting-unit">{unit}</span></>}</span>
      <span className={`popup-slider${bipolar ? '' : ' is-unipolar'}`} style={style}>
        <input
          type="range"
          min={min}
          max={max}
          step="0.1"
          value={value}
          aria-valuetext={formattedValue}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </span>
      <output>{formattedNumber}{valueUnit && <> <span className="popup-setting-unit">{valueUnit}</span></>}</output>
    </label>
  );
}