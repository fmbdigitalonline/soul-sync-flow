
import * as React from "react"

// Breakpoints for different mobile experiences
const ULTRA_NARROW_BREAKPOINT = 400
// Treat tablets (e.g., iPad widths) as desktop/tablet layout by lowering the mobile cutoff
const MOBILE_BREAKPOINT = 640
const FOLD_5_WIDTH = 344

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)
  const [isUltraNarrow, setIsUltraNarrow] = React.useState<boolean | undefined>(undefined)
  const [isFoldDevice, setIsFoldDevice] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const updateBreakpoints = () => {
      const width = window.innerWidth
      setIsMobile(width < MOBILE_BREAKPOINT)
      setIsUltraNarrow(width < ULTRA_NARROW_BREAKPOINT)
      setIsFoldDevice(width <= FOLD_5_WIDTH + 50) // Some tolerance for fold devices
    }

    // Initial check
    updateBreakpoints()

    // Create media query listeners for more accurate detection
    const mobileQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const ultraNarrowQuery = window.matchMedia(`(max-width: ${ULTRA_NARROW_BREAKPOINT - 1}px)`)
    const foldQuery = window.matchMedia(`(max-width: ${FOLD_5_WIDTH + 50}px)`)
    
    // Modern event listener
    const handleMobileChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }
    
    const handleUltraNarrowChange = (e: MediaQueryListEvent) => {
      setIsUltraNarrow(e.matches)
    }
    
    const handleFoldChange = (e: MediaQueryListEvent) => {
      setIsFoldDevice(e.matches)
    }

    // Add listeners
    if (mobileQuery.addEventListener) {
      mobileQuery.addEventListener('change', handleMobileChange)
      ultraNarrowQuery.addEventListener('change', handleUltraNarrowChange)
      foldQuery.addEventListener('change', handleFoldChange)
    } else {
      // Fallback for older browsers
      mobileQuery.addListener(handleMobileChange)
      ultraNarrowQuery.addListener(handleUltraNarrowChange)
      foldQuery.addListener(handleFoldChange)
    }

    // Also listen to resize events as backup
    window.addEventListener('resize', updateBreakpoints)
    
    return () => {
      if (mobileQuery.removeEventListener) {
        mobileQuery.removeEventListener('change', handleMobileChange)
        ultraNarrowQuery.removeEventListener('change', handleUltraNarrowChange)
        foldQuery.removeEventListener('change', handleFoldChange)
      } else {
        // Fallback for older browsers
        mobileQuery.removeListener(handleMobileChange)
        ultraNarrowQuery.removeListener(handleUltraNarrowChange)
        foldQuery.removeListener(handleFoldChange)
      }
      window.removeEventListener('resize', updateBreakpoints)
    }
  }, [])

  return {
    isMobile: !!isMobile,
    isUltraNarrow: !!isUltraNarrow,
    isFoldDevice: !!isFoldDevice
  }
}

// Create a legacy hook that returns just the boolean for backward compatibility
export function useIsMobileBoolean() {
  const { isMobile } = useIsMobile()
  return isMobile
}
