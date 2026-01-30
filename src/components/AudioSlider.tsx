interface AudioSliderProps {
  icon: React.ElementType;
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
  formatValue?: (val: number) => string;
  description?: string;
}

const AudioSlider = ({
  icon: Icon,
  label,
  value,
  min,
  max,
  onChange,
  description,
}: AudioSliderProps) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className="group flex items-center justify-between px-4 py-4 rounded-[8px] hover:bg-yt-hover transition-colors cursor-pointer select-none">
      {/* Icon and Label */}
      <div className="flex items-center min-w-[120px] gap-2">
        <Icon size={24} className="text-yt-text pl-2 pr-8" strokeWidth={2} />
        <div>
          <h4 className="m-0 text-yt-text text-[14px] font-medium font-sans">
            {label}
          </h4>
          <h6 className="m-0 text-yt-text text-[12px] opacity-60 font-normal font-sans">
            {description}
          </h6>
        </div>
      </div>

      {/* Slider */}
      <div className="flex items-center justify-end flex-1 max-w-[140px] gap-6 pr-2">
        <div className="relative w-full h-8 flex items-center">
          {/* Custom Range Input */}
          <input
            type="range"
            min={min}
            max={max}
            step={0.1}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="absolute w-full h-full opacity-0 z-10 cursor-pointer"
            aria-label={label}
          />

          {/* Visual Track Background */}
          <div className="absolute w-full h-[4px] bg-yt-sliderTrack rounded-full overflow-hidden">
            {/* Filled portion */}
            <div
              className="h-full bg-white transition-all duration-75 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Visual Thumb (Circle) */}
          <div
            className="absolute h-6 w-6 bg-white rounded-full pointer-events-none transition-transform duration-100 ease-out group-hover:scale-100 scale-0"
            style={{
              left: `calc(${percentage}% - 7.5px)`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AudioSlider;