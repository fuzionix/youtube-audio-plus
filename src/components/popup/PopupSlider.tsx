import type { CSSProperties } from 'react';

type PopupSliderProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
};

export default function PopupSlider({ label, value, onChange }: PopupSliderProps) {
  const position = Math.max(0, Math.min(100, ((value + 12) / 24) * 100));
  const style = {
    '--slider-start': `${Math.min(50, position)}%`,
    '--slider-end': `${Math.max(50, position)}%`,
  } as CSSProperties;
  const formattedValue = `${value > 0 ? '+' : ''}${Number(value.toFixed(1))} dB`;

  return (
    <label className="popup-setting-row">
      <span className="popup-setting-label">{label}</span>
      <span className="popup-slider" style={style}>
        <input
          type="range"
          min="-12"
          max="12"
          step="0.1"
          value={value}
          aria-valuetext={formattedValue}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </span>
      <output>{formattedValue}</output>
    </label>
  );
}