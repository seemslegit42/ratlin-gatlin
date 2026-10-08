
/**
 * @file hooks/useBreakpoint.ts
 * @description A custom React hook to detect if the current viewport width is below a specified breakpoint.
 * It provides a simple boolean flag that can be used to conditionally render components or apply styles
 * for mobile vs. desktop layouts, adhering to a mobile-first design philosophy.
 */

import { useState, useEffect } from 'react';

/**
 * A helper function to get the current viewport width in a cross-browser compatible way.
 * @returns {number} The current width of the viewport in pixels.
 */
const getWidth = () => window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

/**
 * The default breakpoint for mobile devices, corresponding to Tailwind CSS's `md` breakpoint.
 * @constant {number}
 */
const MOBILE_BREAKPOINT = 768;

/**
 * A custom React hook that returns `true` if the current viewport width is less than the specified breakpoint.
 * It sets up a window resize listener to dynamically update the value as the viewport changes.
 *
 * @param {number} [breakpoint=MOBILE_BREAKPOINT] - The pixel width to consider as the threshold for mobile.
 * @returns {boolean} `true` if the current screen width is less than the breakpoint, `false` otherwise.
 *
 * @example
 * const isMobile = useBreakpoint();
 * if (isMobile) {
 *   // Render mobile-specific components
 * } else {
 *   // Render desktop-specific components
 * }
 */
export const useBreakpoint = (breakpoint: number = MOBILE_BREAKPOINT): boolean => {
    /**
     * @state {boolean} isMobile - The reactive state indicating if the current viewport is considered mobile.
     */
    const [isMobile, setIsMobile] = useState(getWidth() < breakpoint);

    useEffect(() => {
        /**
         * Event listener that updates the `isMobile` state whenever the window is resized.
         */
        const resizeListener = () => {
            setIsMobile(getWidth() < breakpoint);
        };
        
        // Add event listener on component mount.
        window.addEventListener('resize', resizeListener);
        
        // Cleanup function to remove the event listener on component unmount.
        return () => {
            window.removeEventListener('resize', resizeListener);
        };
    }, [breakpoint]); // Re-run the effect if the breakpoint value changes.

    return isMobile;
};