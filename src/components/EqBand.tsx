interface EqBandProps {
  frequency: string;
  value: number;
  onChange: (val: number) => void;
}

const EqBand = ({ frequency, value, onChange }: EqBandProps) => {
  const min = -12;
  const max = 12;
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col items-center gap-2 h-[160px] w-full group select-none">
      <div className="relative flex-1 w-full flex justify-center items-center">
        {/* Rotated Range Input */}
        <input
          type="range"
          min={min}
          max={max}
          step={0.1}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute w-[120px] h-[30px] -rotate-90 opacity-0 cursor-pointer z-10"
          aria-label={`${frequency}Hz band`}
        />

        {/* Visual Track Container */}
        <div className="relative h-[120px] w-[4px]">
          {/* Visual Track Background */}
          <div className="absolute inset-0 bg-yt-sliderTrack rounded-full overflow-hidden">
            {/* Fill portion */}
            <div
              className="absolute bottom-0 w-full bg-white transition-all duration-75 ease-out"
              style={{ height: `${percentage}%` }}
            />
          </div>

          {/* Visual Thumb (Circle) */}
          <div
            className="absolute left-1/2 -translate-x-1/2 h-6 w-6 bg-white rounded-full pointer-events-none transition-transform duration-100 ease-out group-hover:scale-100 scale-0"
            style={{ bottom: `calc(${percentage}% - 7.5px)` }}
          />
        </div>
      </div>
      <span className="text-[11px] text-yt-textSecondary">{frequency}</span>
    </div>
  );
};

export default EqBand;
