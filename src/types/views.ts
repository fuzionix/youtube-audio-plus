export type ViewType = 'basic' | 'equalizer' | 'advanced' | 'visual';

export interface ViewConfig {
  id: ViewType;
  title: MessageKey;
  icon?: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  showBackButton?: boolean;
}
import type { MessageKey } from '@/utils/i18n';
