
/**
 * @file components/shared/PageTransition.tsx
 * @description A wrapper component that applies a consistent entrance and exit animation
 * to page content, reinforcing the "Verdigris Interface Protocol" feel.
 */

import React from 'react';
import { motion, Variants } from 'framer-motion';

interface PageTransitionProps {
    children: React.ReactNode;
    className?: string;
}

// Fix: Explicitly type variants as Variants to ensure compatibility with cubic-bezier array type and avoid index signature incompatibility.
const variants: Variants = {
    initial: { 
        opacity: 0, 
        scale: 0.98, 
        filter: 'blur(8px)',
        y: 10
    },
    enter: { 
        opacity: 1, 
        scale: 1, 
        filter: 'blur(0px)',
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.2, 0.65, 0.3, 0.9]
        }
    },
    exit: { 
        opacity: 0, 
        scale: 1.02, 
        filter: 'blur(8px)',
        transition: {
            duration: 0.3,
            ease: "easeIn"
        }
    }
};

const PageTransition: React.FC<PageTransitionProps> = ({ children, className = "h-full w-full" }) => {
    return (
        <motion.div
            // Fix: Prop variants now refers to a correctly typed Variants object
            variants={variants}
            initial="initial"
            animate="enter"
            exit="exit"
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
