/**
 * Typography mapping utilities for modern design system
 * Maps old font-cormorant classes to modern semantic classes
 */

export const modernTypographyClasses = {
  // Headings
  'font-cormorant text-3xl lg:text-4xl font-bold': 'text-heading font-semibold',
  'font-cormorant text-3xl font-bold': 'text-heading font-semibold',
  'font-cormorant text-2xl font-bold': 'text-subheading font-semibold',
  'font-cormorant text-xl font-bold': 'text-base font-semibold',
  'font-cormorant text-xl': 'text-base font-semibold',
  'font-cormorant text-lg font-semibold': 'text-sm font-semibold',
  'font-cormorant text-lg font-bold': 'text-sm font-semibold',
  'font-cormorant text-lg': 'text-sm font-medium',
  
  // Body text
  'font-cormorant font-semibold': 'font-semibold',
  'font-cormorant font-medium': 'font-medium',
  'font-cormorant': '',
  
  // Modal/Display text
  'font-cormorant font-bold text-soul-purple': 'font-semibold text-primary',
} as const;

export const getModernClass = (oldClass: string): string => {
  return modernTypographyClasses[oldClass as keyof typeof modernTypographyClasses] || oldClass.replace('font-cormorant', '').trim();
};
