export const AUDIO_SETTINGS_KEY = 'ytAudioSettings';
export const EQ_FREQUENCIES = ['32', '64', '125', '250', '500', '1k', '2k', '4k', '8k', '16k'];
export const BASS_WEIGHTS = [1, 1, 0.8, 0.3, 0, 0, 0, 0, 0, 0];
export const TREBLE_WEIGHTS = [0, 0, 0, 0, 0, 0, 0.3, 0.8, 1, 1];

export function getEqValues(settings: unknown): number[] {
  if (settings && typeof settings === 'object' && 'eqValues' in settings &&
    Array.isArray(settings.eqValues) && settings.eqValues.length === EQ_FREQUENCIES.length &&
    settings.eqValues.every((value: unknown) => typeof value === 'number' && Number.isFinite(value))) {
    return settings.eqValues;
  }
  return EQ_FREQUENCIES.map(() => 0);
}