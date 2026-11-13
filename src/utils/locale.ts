export const YOUTUBE_LOCALE_KEY = 'ytAudioYouTubeLocale';

const localeAliases = {
  en: 'en',
  'zh-hant': 'zh-Hant',
  'zh-tw': 'zh-Hant',
  'zh-hk': 'zh-Hant',
  'zh-mo': 'zh-Hant',
} as const;

export type Locale = (typeof localeAliases)[keyof typeof localeAliases];

export function resolveLocale(value: unknown): Locale {
  if (typeof value !== 'string') return 'en';
  let tag = value.trim().replace(/_/g, '-').toLowerCase();
  while (tag) {
    if (Object.hasOwn(localeAliases, tag)) {
      return localeAliases[tag as keyof typeof localeAliases];
    }
    const separator = tag.lastIndexOf('-');
    if (separator < 0) break;
    tag = tag.slice(0, separator);
  }
  return 'en';
}

export function observeYouTubeLocale(
  root: HTMLElement,
  onChange: (locale: string) => void,
): () => void {
  let previous: string | undefined;
  const update = () => {
    const locale = root.getAttribute('lang')?.trim() ?? '';
    if (locale === previous) return;
    previous = locale;
    onChange(locale);
  };
  const observer = new MutationObserver(update);
  observer.observe(root, { attributes: true, attributeFilter: ['lang'] });
  update();
  return () => observer.disconnect();
}