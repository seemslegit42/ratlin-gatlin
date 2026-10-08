/**
 * @file components/ActionBar.tsx
 * @description The BEEP Command Capsule.
 *
 * Mobile-first redesign:
 *   • Single input row with three zones: [more] [textarea] [voice+send]
 *   • Tap [+] to slide up a secondary-actions shelf (Compass, Agent Creator, Attach)
 *   • 44px minimum touch targets throughout
 *   • Attachment pill above the input row
 *   • Live voice: full-width waveform replaces textarea
 *   • Processing: inline spinner on the send button + stop affordance
 *
 * Desktop:
 *   • All actions visible (compass + plus on left, controls on right)
 *   • Drag-to-attach drop zone
 *
 * Verdigris Protocol:
 *   Book I §1.2 — glass-live surface
 *   Book I §1.3 — wabi-grain, scanlines
 */

import React, {
  memo, useCallback, useEffect, useRef, useState,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { SendIcon }                     from './icons/SendIcon.js';
import { MicrophoneIcon }               from './icons/MicrophoneIcon.js';
import { SpeakerMuteIcon, SpeakerUnmuteIcon } from './icons/SpeakerIcon.js';
import { PaperclipIcon }                from './icons/PaperclipIcon.js';
import { PlusIcon }                     from './icons/PlusIcon.js';
import { CompassIcon, CommandCoreIcon } from './icons/CompassIcon.js';
import { type View, DesktopWidgetType } from '../types.js';
import { useBreakpoint }                from '../hooks/useBreakpoint.js';
import { logInteraction }               from '../services/appLogger.js';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ActionBarProps {
  isProcessing: boolean;
  isLive: boolean;
  isSpeaking: boolean;
  isTtsMuted: boolean;
  volume: number;
  onToggleTtsMute: () => void;
  onSendCommand: (
    command: string,
    attachment?: { name: string; mimeType: string; data: string },
  ) => void;
  onToggleLive: () => void;
  onNavigate: (view: View) => void;
  onOpenAgentCreator: () => void;
  onSpawnWidget: (type: DesktopWidgetType) => void;
  onOpenCommandCenter?: () => void;
  onStopGeneration?: () => void;
  chatInputId?: string;
  /**
   * When set, pre-fills the command textarea and focuses it.
   * Used by the KPI ticker touch-to-fill interaction (spec §2.1).
   */
  prefillInput?: string;
  /**
   * Contextual quick-action suggestion chips shown above the input.
   * Clicking a chip fills and sends the command immediately.
   */
  suggestions?: string[];
}

// ─── Icon helpers ─────────────────────────────────────────────────────────────

const StopIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <rect x="6" y="6" width="12" height="12" rx="1" />
  </svg>
);

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Waveform bars (voice live state) ────────────────────────────────────────

const VoiceWaveform: React.FC<{ volume: number }> = ({ volume }) => (
  <div className="flex items-center justify-center gap-0.5 h-8">
    {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((base, i) => (
      <motion.div
        key={i}
        className="w-0.5 rounded-full bg-red-400"
        animate={{
          height: [base * 3, base * 3 + volume * 28, base * 3],
          opacity: [0.5 + base * 0.05, 1, 0.5 + base * 0.05],
        }}
        transition={{ duration: 0.4 + i * 0.03, repeat: Infinity, delay: i * 0.04 }}
      />
    ))}
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

// Rotating placeholder strings give the input more personality
const PLACEHOLDERS = [
  'Command BEEP…',
  'Navigate, architect, analyse…',
  'Whisper your intent…',
  'What shall we build today?',
  'Run a workflow, pull a report…',
  'Summon a widget or diagnose the swarm…',
];

const ActionBar: React.FC<ActionBarProps> = (props) => {
  const {
    isProcessing,
    isLive,
    volume,
    onToggleTtsMute,
    onSendCommand,
    onToggleLive,
    onOpenAgentCreator,
    isTtsMuted,
    onOpenCommandCenter,
    onStopGeneration,
    chatInputId = 'beep-chat-input',
    prefillInput,
    suggestions,
  } = props;

  const isMobile      = useBreakpoint();
  const [input, setInput]           = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill the input when a KPI metric is tapped (touch-to-fill, spec §2.1)
  useEffect(() => {
    if (!prefillInput) return;
    setInput(prefillInput);
    setTimeout(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }, 80);
  }, [prefillInput]);

  // Cycle placeholder text every 5 s when idle
  useEffect(() => {
    if (isProcessing || isLive || input) return;
    const t = setInterval(() => setPlaceholderIdx(i => (i + 1) % PLACEHOLDERS.length), 5000);
    return () => clearInterval(t);
  }, [isProcessing, isLive, input]);

  const placeholder = PLACEHOLDERS[placeholderIdx];

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((res, rej) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload  = () => res((reader.result as string).split(',')[1]);
      reader.onerror = (err) => rej(err);
    });

  const handleSubmit = useCallback(async () => {
    if (isLive || (!input.trim() && !attachment)) return;
    let attachmentData: { name: string; mimeType: string; data: string } | undefined;
    if (attachment) {
      attachmentData = {
        name: attachment.name,
        mimeType: attachment.type,
        data: await fileToBase64(attachment),
      };
    }
    logInteraction('chat.send_command', {
      hasAttachment: Boolean(attachmentData),
      attachmentPreview: attachmentData
        ? { name: attachmentData.name, mimeType: attachmentData.mimeType }
        : undefined,
    });
    onSendCommand(input, attachmentData);
    setInput('');
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [input, attachment, onSendCommand, isLive]);

  // Auto-resize textarea
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, isMobile ? 76 : 120)}px`;
  }, [input, isMobile]);

  // Close "more" panel on outside click
  useEffect(() => {
    if (!isMoreOpen) return;
    const onDoc = () => setIsMoreOpen(false);
    document.addEventListener('pointerdown', onDoc, { capture: true });
    return () => document.removeEventListener('pointerdown', onDoc, { capture: true });
  }, [isMoreOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSubmit(); }
  };

  const handleDragEvents = (e: React.DragEvent, over: boolean) => {
    e.preventDefault(); e.stopPropagation(); setIsDragOver(over);
  };
  const handleDrop = (e: React.DragEvent) => {
    handleDragEvents(e, false);
    const f = e.dataTransfer.files[0];
    if (f) setAttachment(f);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setAttachment(f);
  };
  const clearAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const canSend = !isProcessing && !isLive && (!!input.trim() || !!attachment);

  // Suggestion chips — shared between mobile + desktop
  const SuggestionChips = suggestions && suggestions.length > 0 && !isProcessing && !isLive && !input ? (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
      {suggestions.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => {
            logInteraction('action_bar.suggestion_tap', { suggestion: s });
            onSendCommand(s);
          }}
          className="flex-shrink-0 text-[10px] font-mono px-3 py-1.5 rounded-full bg-white/4 border border-white/10 text-text-secondary hover:bg-patina-green/10 hover:border-patina-green/30 hover:text-patina-green transition-all whitespace-nowrap active:scale-95"
        >
          {s}
        </button>
      ))}
    </div>
  ) : null;

  // ════════════════════════════════════════════════════════════════════════════
  // MOBILE LAYOUT
  // ════════════════════════════════════════════════════════════════════════════

  if (isMobile) {
    return (
      <div
        className="relative w-full"
        onDragEnter={(e) => handleDragEvents(e, true)}
        onDragLeave={(e) => handleDragEvents(e, false)}
        onDragOver={(e) => handleDragEvents(e, true)}
        onDrop={handleDrop}
      >
        {/* Suggestion chips (mobile) */}
        {SuggestionChips && (
          <div className="px-1 pb-2">{SuggestionChips}</div>
        )}

        {/* Hidden file input */}
        <input
          type="file" ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          aria-label="Attach file"
        />

        {/* ── Secondary actions shelf ────────────────────────────────── */}
        <AnimatePresence>
          {isMoreOpen && (
            <motion.div
              key="shelf"
              initial={{ opacity: 0, y: 8, scaleY: 0.92 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: 8, scaleY: 0.92 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              style={{ transformOrigin: 'bottom' }}
              className="absolute bottom-full mb-2 left-0 right-0 glass-live rounded-2xl border border-white/10 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.4)]"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="grid grid-cols-3 gap-2">
                {/* Navigate / Compass */}
                <ShelfAction
                  icon={<CommandCoreIcon className="w-5 h-5" />}
                  label="Command Core"
                  onClick={() => {
                    setIsMoreOpen(false);
                    logInteraction('action_bar.open_command_center', {});
                    onOpenCommandCenter?.();
                  }}
                />
                {/* Create Agent */}
                <ShelfAction
                  icon={<PlusIcon className="w-5 h-5" />}
                  label="New agent"
                  onClick={() => {
                    setIsMoreOpen(false);
                    logInteraction('action_bar.open_agent_creator', {});
                    onOpenAgentCreator();
                  }}
                />
                {/* Attach File */}
                <ShelfAction
                  icon={<PaperclipIcon className="w-5 h-5" />}
                  label="Attach"
                  onClick={() => {
                    setIsMoreOpen(false);
                    logInteraction('action_bar.pick_attachment', {});
                    fileInputRef.current?.click();
                  }}
                  active={!!attachment}
                />
                {/* TTS mute */}
                <ShelfAction
                  icon={isTtsMuted
                    ? <SpeakerMuteIcon className="w-5 h-5" />
                    : <SpeakerUnmuteIcon className="w-5 h-5" />}
                  label={isTtsMuted ? 'Unmute' : 'Mute TTS'}
                  onClick={() => {
                    logInteraction(isTtsMuted ? 'tts.unmute' : 'tts.mute', {});
                    onToggleTtsMute();
                  }}
                  active={isTtsMuted}
                  danger={isTtsMuted}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Attachment pill ────────────────────────────────────────── */}
        <AnimatePresence>
          {attachment && (
            <motion.div
              key="attach"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-1.5"
            >
              <div className="flex items-center justify-between text-[10px] px-3 py-1.5 bg-patina-green/10 rounded-xl border border-patina-green/25 mx-0.5">
                <span className="text-patina-green font-mono truncate max-w-[180px] flex items-center gap-1.5">
                  <PaperclipIcon className="w-3 h-3 flex-shrink-0" />
                  {attachment.name}
                </span>
                <button
                  type="button"
                  onClick={() => { logInteraction('chat.remove_attachment', {}); clearAttachment(); }}
                  className="text-patina-green/70 hover:text-red-400 p-1 rounded-lg transition-colors"
                  aria-label="Remove attachment"
                >✕</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main input row ─────────────────────────────────────────── */}
        <div className={`relative flex items-end gap-1 rounded-2xl border transition-all duration-300 high-density ${
          isDragOver
            ? 'border-imperial-purple/50 bg-imperial-purple/5'
            : isLive
              ? 'border-red-500/30 bg-[#0c0c10]/90'
              : 'border-white/10 bg-[#0c0c10]/90'
        }`}>
          {/* Drag-over glow */}
          {isDragOver && (
            <div className="absolute -inset-1 rounded-2xl blur-lg bg-imperial-purple/15 pointer-events-none" />
          )}

          {/* 1. Command Core (Far Left) */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onOpenCommandCenter?.(); }}
            aria-label="Open Command Core"
            title="Command Core (System Nav)"
            className="self-end mb-1.5 ml-1.5 flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 border bg-white/5 border-white/10 text-patina-green hover:text-white shadow-[0_0_10px_rgba(62,185,145,0.15)] group"
          >
            <CommandCoreIcon className="w-5 h-5 group-active:scale-90 transition-transform" />
          </button>

          {/* 2. Microphone (Left of input) */}
          <button
            type="button"
            onClick={() => {
              logInteraction(isLive ? 'voice.end_session' : 'voice.start_session', {});
              onToggleLive();
            }}
            aria-label={isLive ? 'End voice session' : 'Start voice session'}
            aria-pressed={isLive}
            className={`self-end mb-1.5 flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 active:scale-95 ${
              isLive
                ? 'bg-red-500 text-white shadow-[0_0_16px_rgba(239,68,68,0.4)]'
                : 'bg-white/5 text-text-secondary hover:text-white border border-white/10'
            }`}
          >
            <MicrophoneIcon className="w-5 h-5" />
          </button>

          {/* 3. Center: Textarea or voice waveform */}
          <div className="flex-1 min-w-0 py-1.5">
            <AnimatePresence mode="wait">
              {isLive ? (
                <motion.div
                  key="live"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 px-1 h-10"
                >
                  <VoiceWaveform volume={volume} />
                  <span className="text-[10px] text-red-400 font-mono uppercase tracking-widest animate-pulse whitespace-nowrap">
                    Listening…
                  </span>
                </motion.div>
              ) : (
                  <motion.div 
                    key="text" 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="relative"
                  >
                    <textarea
                      id={chatInputId}
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={placeholder}
                      className="w-full bg-transparent px-1 py-2 text-[14px] text-white placeholder:text-text-tertiary resize-none focus:outline-none font-lexend leading-snug relative z-10"
                      rows={1}
                      aria-label="Message to BEEP"
                      style={{ maxHeight: 76 }}
                    />
                    {/* Pulsating background for focused state */}
                    <AnimatePresence>
                      {input.length === 0 && (
                        <motion.div 
                          className="absolute inset-0 bg-patina-green/5 rounded pointer-events-none"
                          animate={{ opacity: [0, 0.15, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                      )}
                    </AnimatePresence>
                  </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 4. Context / Plus (Right of input) */}
          <div className="flex items-center gap-1 self-end mb-1.5 mr-1.5 flex-shrink-0">
             {/* Stop generation */}
             <AnimatePresence>
              {isProcessing && onStopGeneration && (
                <motion.button
                  key="stop"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  type="button"
                  onClick={() => { logInteraction('chat.stop_generation', {}); onStopGeneration(); }}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 active:scale-95 transition-all"
                  aria-label="Stop BEEP reply"
                >
                  <StopIcon className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 border ${
                attachment ? 'bg-patina-green/20 border-patina-green/40 text-patina-green' : 'bg-white/5 border-white/10 text-text-secondary hover:text-white'
              }`}
              aria-label="Context Button (Attach file)"
              title="Context Button (+)"
            >
              <PlusIcon className="w-5 h-5" />
            </button>

            {/* Send */}
            <motion.button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={!canSend}
              whileTap={canSend ? { scale: 0.92 } : undefined}
              aria-label="Send command"
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 ${
                canSend
                  ? 'bg-imperial-purple text-white shadow-[0_0_14px_rgba(106,13,173,0.4)] hover:bg-imperial-purple/90'
                  : 'bg-white/6 text-text-tertiary cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
              ) : (
                <SendIcon className="w-4 h-4" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // DESKTOP LAYOUT
  // ════════════════════════════════════════════════════════════════════════════

  return (
    <div
      className={`relative w-full transition-all duration-300 ${isDragOver ? 'scale-[1.01]' : ''}`}
      onDragEnter={(e) => handleDragEvents(e, true)}
      onDragLeave={(e) => handleDragEvents(e, false)}
      onDragOver={(e) => handleDragEvents(e, true)}
      onDrop={handleDrop}
    >
      {/* Drag glow */}
      {isDragOver && (
        <div className="absolute -inset-1 rounded-2xl blur-xl bg-imperial-purple/20 pointer-events-none" />
      )}
      {isLive && (
        <div className="absolute -inset-1 rounded-2xl blur-xl bg-red-500/10 pointer-events-none" />
      )}

      <div className={`flex items-end gap-1 rounded-2xl border transition-all duration-300 ${
        isLive ? 'border-red-500/30 bg-[#0c0c10]/90' : 'border-white/10 bg-[#0c0c10]/90'
      } p-1.5`}>

        {/* Hidden file input */}
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" aria-label="Attach file" />

        {/* Left actions */}
        <div className="flex items-center gap-0.5 self-end mb-0.5">
          <ActionBtn
            onClick={() => { logInteraction('action_bar.open_command_center', {}); onOpenCommandCenter?.(); }}
            aria="Open command center"
            title="Command Core (System Nav)"
          >
            <CommandCoreIcon className="w-5 h-5 text-patina-green" />
          </ActionBtn>
          <ActionBtn
            onClick={() => { logInteraction('action_bar.open_agent_creator', {}); onOpenAgentCreator(); }}
            aria="Create agent"
            title="Create agent"
          >
            <PlusIcon className="w-5 h-5" />
          </ActionBtn>
        </div>

        {/* Input */}
        <div className="flex-1 flex flex-col min-w-0 px-1 py-1">
          {/* Suggestion chips (desktop) */}
          {SuggestionChips && (
            <div className="mb-1.5">{SuggestionChips}</div>
          )}

          {/* Attachment pill */}
          <AnimatePresence>
            {attachment && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mb-1 overflow-hidden"
              >
                <div className="flex items-center justify-between text-[10px] px-2.5 py-1.5 bg-patina-green/10 rounded-lg border border-patina-green/20">
                  <span className="text-patina-green font-mono truncate max-w-[220px] flex items-center gap-1.5">
                    <PaperclipIcon className="w-3 h-3 flex-shrink-0" />
                    {attachment.name}
                  </span>
                  <button type="button" onClick={() => { logInteraction('chat.remove_attachment', {}); clearAttachment(); }}
                    className="text-patina-green/70 hover:text-red-400 p-0.5 rounded transition-colors" aria-label="Remove attachment">✕</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Textarea or waveform */}
          <div className="relative flex items-center min-h-[44px]">
            <AnimatePresence mode="wait">
              {isLive ? (
                <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="w-full flex items-center gap-3 px-2 py-1">
                  <VoiceWaveform volume={volume} />
                  <span className="text-xs text-red-400 font-mono uppercase tracking-widest animate-pulse">Live Link Active</span>
                </motion.div>
              ) : (
                <motion.div key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full relative">
                  <textarea
                    id={chatInputId} ref={textareaRef}
                    value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full bg-transparent px-2 py-2.5 pr-9 text-white placeholder:text-text-tertiary resize-none focus:outline-none text-sm font-lexend leading-relaxed relative z-10"
                    rows={1} aria-label="Message to BEEP" style={{ maxHeight: 120 }}
                  />
                  {/* Pulsating background */}
                  <AnimatePresence>
                    {input.length === 0 && (
                      <motion.div 
                        className="absolute inset-0 bg-patina-green/5 rounded-lg pointer-events-none"
                        animate={{ opacity: [0, 0.2, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                      />
                    )}
                  </AnimatePresence>
                  <button type="button"
                    onClick={() => { logInteraction('action_bar.pick_attachment', {}); fileInputRef.current?.click(); }}
                    className={`absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors z-20 ${
                      attachment ? 'text-patina-green bg-patina-green/10' : 'text-text-tertiary hover:text-white hover:bg-white/8'
                    }`} title="Attach file"
                  >
                    <PaperclipIcon className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1.5 self-end mb-0.5">
          {/* Stop */}
          <AnimatePresence>
            {isProcessing && onStopGeneration && (
              <motion.button key="stop" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                type="button"
                onClick={() => { logInteraction('chat.stop_generation', {}); onStopGeneration(); }}
                className="p-2.5 rounded-xl bg-amber-500/15 text-amber-200 border border-amber-500/30 hover:bg-amber-500/25 transition-colors active:scale-95"
                aria-label="Stop generation"
              >
                <StopIcon className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* TTS */}
          <ActionBtn
            onClick={() => { logInteraction(isTtsMuted ? 'tts.unmute' : 'tts.mute', {}); onToggleTtsMute(); }}
            aria={isTtsMuted ? 'Unmute TTS' : 'Mute TTS'}
            title={isTtsMuted ? 'Unmute TTS' : 'Mute TTS'}
            danger={isTtsMuted}
          >
            {isTtsMuted ? <SpeakerMuteIcon className="w-5 h-5" /> : <SpeakerUnmuteIcon className="w-5 h-5" />}
          </ActionBtn>

          {/* Voice + Send group */}
          <div className="flex items-center bg-white/6 rounded-xl p-1 gap-1 border border-white/6">
            <button
              type="button"
              onClick={() => { logInteraction(isLive ? 'voice.end_session' : 'voice.start_session', {}); onToggleLive(); }}
              aria-label={isLive ? 'End voice session' : 'Start voice session'}
              aria-pressed={isLive}
              className={`relative p-2.5 rounded-lg transition-all duration-300 active:scale-95 ${
                isLive ? 'bg-red-500 text-white shadow-md shadow-red-500/30' : 'text-text-secondary hover:text-white hover:bg-white/10'
              }`}
            >
              <MicrophoneIcon className="w-5 h-5" />
              {isLive && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full animate-ping" />}
            </button>

            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={!canSend}
              aria-label="Send command"
              className={`p-2.5 rounded-lg transition-all duration-200 active:scale-95 ${
                canSend
                  ? 'bg-white/15 text-white hover:bg-white/25 hover:shadow-glass'
                  : 'text-text-tertiary opacity-30 cursor-not-allowed'
              }`}
            >
              {isProcessing
                ? <div className="w-5 h-5 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
                : <SendIcon className="w-5 h-5" />
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Shelf action button (mobile secondary actions panel). */
const ShelfAction: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
}> = ({ icon, label, onClick, active, danger }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all duration-150 active:scale-95 ${
      danger && active
        ? 'bg-red-500/10 border-red-500/30 text-red-400'
        : active
          ? 'bg-patina-green/10 border-patina-green/30 text-patina-green'
          : 'bg-white/5 border-white/8 text-text-secondary hover:text-white hover:bg-white/10'
    }`}
  >
    {icon}
    <span className="text-[9px] font-mono uppercase tracking-wider leading-none">{label}</span>
  </button>
);

/** Generic icon button used in desktop layout. */
const ActionBtn: React.FC<{
  onClick: () => void;
  aria: string;
  title?: string;
  children: React.ReactNode;
  danger?: boolean;
}> = ({ onClick, aria, title, children, danger }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={aria}
    title={title ?? aria}
    className={`p-2.5 rounded-xl transition-all duration-150 active:scale-95 ${
      danger
        ? 'text-red-500/70 hover:text-red-400 bg-red-500/5 hover:bg-red-500/10'
        : 'text-text-secondary hover:text-white hover:bg-white/10'
    }`}
  >
    {children}
  </button>
);

export default memo(ActionBar);
