export type ViewType = 'basic' | 'equalizer' | 'advanced' | 'visual';

export interface ViewConfig {
  id: ViewType;
  title: string;
  icon?: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  showBackButton?: boolean;
}