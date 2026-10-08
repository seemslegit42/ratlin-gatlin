
/**
 * @file components/ErrorBoundary.tsx
 * @description A component that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of a crashed component tree.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { BrainIcon } from './icons/BrainIcon.js';
import { logError } from '../services/appLogger.js';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: undefined
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError('react.error_boundary', error, {
      componentStackPreview: errorInfo.componentStack?.slice(0, 800),
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen bg-obsidian-black flex flex-col items-center justify-center p-4 text-center overflow-hidden relative">
             <div 
                className="absolute inset-0 w-full h-full opacity-40 -z-10"
                style={{
                    backgroundImage: 'radial-gradient(circle at top, var(--imperial-purple), transparent 70%)'
                }}
             />
             
             <div className="bg-panel-bg/90 backdrop-blur-xl border border-glass-border p-8 rounded-2xl shadow-2xl max-w-md w-full relative z-10">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                        <BrainIcon className="w-10 h-10 text-red-500 animate-pulse" />
                    </div>
                </div>
                
                <h1 className="text-2xl font-bold font-comfortaa text-white mb-2">System Critical</h1>
                <p className="text-sm text-text-secondary mb-6 font-lexend">
                    A fatal exception has occurred in the neural lattice. The Sovereign protocol has halted execution to preserve data integrity.
                </p>

                <div className="bg-black/40 p-4 rounded-lg border border-white/5 mb-6 text-left overflow-auto max-h-32 custom-scrollbar">
                    <code className="text-xs font-mono text-red-400 block">
                        {this.state.error?.toString() || 'Unknown Error'}
                    </code>
                </div>

                <button 
                    onClick={() => window.location.reload()}
                    className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white font-bold transition-all uppercase tracking-widest text-xs flex items-center justify-center space-x-2 group"
                >
                    <span>Reboot System</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:rotate-180 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></svg>
                </button>
             </div>
        </div>
      );
    }

    return (this as any).props.children || null;
  }
}

export default ErrorBoundary;
