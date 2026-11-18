import { EQ_FREQUENCIES } from './audio-settings';

const frequencies = EQ_FREQUENCIES.map((frequency) =>
  parseFloat(frequency) * (frequency.endsWith('k') ? 1000 : 1),
);

export function getEqualizerResponse(frequency: number, gains: number[], qualityFactor: number): number {
  return frequencies.reduce((total, center, index) => {
    const ratio = frequency / center;
    const amplitude = 10 ** (gains[index] / 40);
    const offset = 1 - ratio * ratio;
    const bandwidth = ratio / qualityFactor;
    return total + 20 * Math.log10(
      Math.hypot(offset, bandwidth * amplitude) / Math.hypot(offset, bandwidth / amplitude),
    );
  }, 0);
}
