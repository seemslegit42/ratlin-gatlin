
import React from 'react';
import { motion } from 'framer-motion';

const WorkflowProgressBar: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 right-0 h-2 z-50 bg-panel-bg/80 backdrop-blur-md overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-gradient-to-r from-imperial-purple via-roman-aqua to-patina-green"
        style={{
          backgroundSize: '200% 100%', // Make the gradient wider than the div
          animation: 'progress-flow 3s linear infinite', // Animate background position
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] text-vitreous-white/70 font-mono tracking-widest relative z-10">
          Executing Workflow...
        </span>
      </div>
    </motion.div>
  );
};

export default WorkflowProgressBar;
