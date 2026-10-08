
/**
 * @file hooks/useClickOutside.ts
 * @description A custom React hook that triggers a callback when a click or tap event occurs outside of a specified element.
 * This is particularly useful for closing modals, dropdowns, or other temporary UI elements when the user interacts with the rest of the page.
 */

import React, { useEffect } from 'react';

/**
 * A custom hook that listens for clicks outside of a referenced DOM element.
 * 
 * @param {React.RefObject<HTMLElement>} ref - A React ref object pointing to the element to monitor for outside clicks.
 * @param {(event: MouseEvent | TouchEvent) => void} handler - The callback function to execute when a click is detected outside the referenced element.
 * 
 * @example
 * const MyComponent = () => {
 *   const wrapperRef = useRef(null);
 *   useClickOutside(wrapperRef, () => console.log('Clicked outside!'));
 * 
 *   return <div ref={wrapperRef}>My Component</div>;
 * };
 */
export const useClickOutside = (
    ref: React.RefObject<HTMLElement>,
    handler: (event: MouseEvent | TouchEvent) => void
) => {
    useEffect(() => {
        /**
         * The event listener that checks if the click occurred outside the target element.
         * @param {MouseEvent | TouchEvent} event - The DOM event.
         */
        const listener = (event: MouseEvent | TouchEvent) => {
            // Do nothing if the ref is not set or if the click is inside the ref's element or its descendants.
            if (!ref.current || ref.current.contains(event.target as Node)) {
                return;
            }
            // If the click is outside, call the handler.
            handler(event);
        };

        // Add event listeners for both mouse and touch events.
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        // Cleanup function to remove the event listeners when the component unmounts or dependencies change.
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, 
    // Re-subscribe the effect if the ref or handler function changes.
    [ref, handler]);
};