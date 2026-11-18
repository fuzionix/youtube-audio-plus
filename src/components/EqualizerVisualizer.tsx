import { getEqualizerResponse } from '@/utils/equalizer-response';
import { useTranslation } from '@/utils/i18n';

const minFrequency = 20;
const maxFrequency = 20000;
const pointCount = 241;
const width = 320;
const height = 48;
const chartLeft = 1;
const chartRight = 319;
const chartTop = 1;
const chartBottom = 47;

function frequencyX(frequency: number) {
  return chartLeft + Math.log(frequency / minFrequency) / Math.log(maxFrequency / minFrequency) * (chartRight - chartLeft);
}

export default function EqualizerVisualizer({ eqValues, qualityFactor }: { eqValues: number[]; qualityFactor: number }) {
  const t = useTranslation();
  const points = Array.from({ length: pointCount }, (_, index) => {
    const frequency = minFrequency * (maxFrequency / minFrequency) ** (index / (pointCount - 1));
    return { x: frequencyX(frequency), gain: getEqualizerResponse(frequency, eqValues, qualityFactor) };
  });
  const range = Math.max(12, Math.ceil(Math.max(...points.map(({ gain }) => Math.abs(gain))) / 6) * 6);
  const gainY = (gain: number) => chartTop + (range - gain) / (range * 2) * (chartBottom - chartTop);
  const path = points.map(({ x, gain }, index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${gainY(gain).toFixed(2)}`).join(' ');

  return (
    <figure className="m-0 mb-4 px-6">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="block w-full h-[48px]" role="img" aria-label={t('equalizerResponseDescription')}>
        {[-range, 0, range].map((gain) => (
          <line key={gain} x1={chartLeft} x2={chartRight} y1={gainY(gain)} y2={gainY(gain)} stroke="currentColor" className="text-yt-borderLight" strokeWidth="0.5" />
        ))}
        <path d={path} fill="none" stroke="white" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </figure>
  );
}
