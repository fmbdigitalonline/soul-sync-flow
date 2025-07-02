
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const updateIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Initial check
    updateIsMobile()

    // Create media query listener for more accurate detection
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Modern event listener
    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }

    // Add listener
    if (mql.addEventListener) {
      mql.addEventListener('change', handleChange)
    } else {
      // Fallback for older browsers
      mql.addListener(handleChange)
    }

    // Also listen to resize events as backup
    window.addEventListener('resize', updateIsMobile)
    
    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', handleChange)
      } else {
        // Fallback for older browsers
        mql.removeListener(handleChange)
      }
      window.removeEventListener('resize', updateIsMobile)
    }
  }, [])

  return !!isMobile
}
