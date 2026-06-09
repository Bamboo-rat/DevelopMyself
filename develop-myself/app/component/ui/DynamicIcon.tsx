import * as LucideIcons from 'lucide-react';

export const AVAILABLE_ICONS = [
  'FileText', 'Folder', 'Star', 'Heart', 'Book',
  'Calendar', 'Camera', 'Code', 'Image', 'Link',
  'Map', 'MessageCircle', 'Music', 'Video', 'Zap',
  'Activity', 'Archive', 'Award', 'Bell', 'Briefcase',
  'CheckCircle', 'Clipboard', 'Cloud', 'Coffee', 'Compass',
  'Cpu', 'CreditCard', 'Database', 'Flag', 'Gift',
  'Globe', 'Headphones', 'Home', 'Info', 'Key',
  'Layers', 'Layout', 'Lock', 'Mail', 'Monitor'
];

export const DynamicIcon = ({ name, size = 18, className = "" }: { name: string, size?: number, className?: string }) => {
  const IconComponent = LucideIcons[name as keyof typeof LucideIcons] as any;
  if (!IconComponent) return null;
  return <IconComponent size={size} className={className} />;
};
