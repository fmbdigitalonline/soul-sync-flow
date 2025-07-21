import React from 'react';

interface GoldenStandardPageProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  showHeader?: boolean;
  headerActions?: React.ReactNode;
}

/**
 * Golden Standard Page Template
 * 
 * A pre-configured page layout that enforces the Golden Standard design system.
 * Use this as a starting point for new page components.
 * 
 * Features:
 * - Semantic background colors (bg-background)
 * - Proper typography hierarchy (font-display for titles, font-body for content)
 * - Semantic spacing tokens (layout-*, space-*)
 * - Responsive design with mobile-first approach
 * - Accessibility-ready structure
 * - Consistent page layout patterns
 * 
 * @example
 * <GoldenStandardPage
 *   title="Your Cosmic Blueprint"
 *   subtitle="Discover the stars that guide your destiny"
 *   maxWidth="lg"
 *   showHeader
 *   headerActions={<Button>Edit Profile</Button>}
 * >
 *   <YourPageContent />
 * </GoldenStandardPage>
 */
export const GoldenStandardPage: React.FC<GoldenStandardPageProps> = ({
  children,
  title,
  subtitle,
  maxWidth = 'lg',
  showHeader = true,
  headerActions
}) => {
  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'sm': return 'max-w-2xl';
      case 'md': return 'max-w-4xl';
      case 'lg': return 'max-w-6xl';
      case 'xl': return 'max-w-7xl';
      case '2xl': return 'max-w-screen-2xl';
      case 'full': return 'max-w-full';
      default: return 'max-w-6xl';
    }
  };

  return (
    <div className="min-h-screen bg-background mobile-container">
      {/* Page Header */}
      {showHeader && (title || subtitle) && (
        <header className="
          border-b border-border-default 
          bg-surface-elevated
          p-layout-md
          mb-layout-lg
        ">
          <div className={`mx-auto ${getMaxWidthClass()}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-space-md">
              <div className="space-y-space-sm">
                {title && (
                  <h1 className="
                    font-display 
                    text-display-sm 
                    sm:text-display-md 
                    text-main
                    leading-tight
                  ">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="
                    font-body 
                    text-text-lg 
                    text-secondary
                    leading-relaxed
                  ">
                    {subtitle}
                  </p>
                )}
              </div>
              
              {headerActions && (
                <div className="flex-shrink-0">
                  {headerActions}
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={`
        mx-auto 
        ${getMaxWidthClass()} 
        p-layout-md
        pb-layout-xl
      `}>
        <div className="space-y-layout-md">
          {children}
        </div>
      </main>
    </div>
  );
};