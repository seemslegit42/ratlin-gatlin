/**
 * @file components/admin/LlamaCliPlayground.tsx
 * @description The Sovereign Llama CLI Studio & Terminal Playground.
 * Provides interactive terminal emulation, real-time command compilation,
 * multimodal routing (/image, /audio), speculative decoding configuration,
 * and sampling parameter synthesis for llama.cpp GGUF and Hugging Face models.
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  buildLlamaCliCommand,
  parseLlamaCliCommand,
  parseLlamaReplInput,
  LLAMA_CLI_PRESETS,
  type LlamaCliConfig,
  type LlamaCliPreset,
  postLlamaCppChat,
  pingLlamaCpp,
} from '../../services/llamaCppService';
import { BrainIcon } from '../icons/BrainIcon';
import { SparkIcon } from '../icons/SparkIcon';
import { ZapIcon } from '../icons/VitalsIcons';
import { LayersIcon } from '../icons/LayersIcon';
import { SendIcon } from '../icons/SendIcon';

interface TerminalLine {
  id: string;
  type: 'system' | 'prompt' | 'output' | 'info' | 'error';
  content: string;
  timestamp: string;
}

export const LlamaCliPlayground: React.FC = () => {
  // Active CLI Configuration
  const [config, setConfig] = useState<LlamaCliConfig>({
    modelSource: 'hf',
    model: 'unsloth/gemma-4-E4B-it-GGUF:Q4_0',
    temperature: 0.2,
    topK: 40,
    topP: 0.95,
    minP: 0.05,
    predictTokens: -1,
    repeatPenalty: 1.0,
    contextWindow: 8192,
    cpuMoe: false,
    fitMemory: true,
    reasoningMode: 'on',
    reasoningBudget: 1024,
    specType: 'none',
  });

  const [activeTab, setActiveTab] = useState<'terminal' | 'builder' | 'speculative' | 'presets'>('terminal');
  const [copied, setCopied] = useState(false);
  const [terminalInput, setTerminalInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const [manualCmd, setManualCmd] = useState('');
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [attachedAudio, setAttachedAudio] = useState<string[]>([]);

  const [history, setHistory] = useState<TerminalLine[]>([
    {
      id: 'init-1',
      type: 'system',
      content: 'llama.cpp CLI interface initialized (v-build-2026.10)',
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 'init-2',
      type: 'info',
      content: 'BEEP Daemon: Model context ready. Type /help for media slash commands (/image, /audio) or enter prompt.',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Synchronize compiled command
  const generatedCommand = buildLlamaCliCommand({
    ...config,
    images: attachedImages.length > 0 ? attachedImages : config.images,
    audioFiles: attachedAudio.length > 0 ? attachedAudio : config.audioFiles,
  });

  useEffect(() => {
    setManualCmd(generatedCommand);
  }, [generatedCommand]);

  // Check llama server liveliness
  useEffect(() => {
    let mounted = true;
    pingLlamaCpp().then((alive) => {
      if (mounted) setServerOnline(alive);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Auto scroll terminal
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollTop = terminalEndRef.current.scrollHeight;
    }
  }, [history]);

  const handleCopyCommand = async () => {
    try {
      await navigator.clipboard.writeText(generatedCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleApplyPreset = (preset: LlamaCliPreset) => {
    setConfig({ ...preset.config });
    setHistory((prev) => [
      ...prev,
      {
        id: `preset-${Date.now()}`,
        type: 'info',
        content: `Loaded Preset [${preset.name}] → ${preset.badge}`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const handleManualCmdChange = (value: string) => {
    setManualCmd(value);
    const parsed = parseLlamaCliCommand(value);
    if (parsed.model || parsed.temperature !== undefined || parsed.modelSource) {
      setConfig((prev) => ({
        ...prev,
        ...parsed,
      }));
    }
  };

  const handleSendPrompt = async (rawInput?: string) => {
    const text = (rawInput ?? terminalInput).trim();
    if (!text || isGenerating) return;

    setTerminalInput('');
    const timestamp = new Date().toLocaleTimeString();

    // Check slash commands
    const repl = parseLlamaReplInput(text);

    if (repl.type === 'help') {
      setHistory((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, type: 'prompt', content: text, timestamp },
        {
          id: `h-${Date.now()}`,
          type: 'info',
          content: [
            '─── LLAMA CLI COMMAND REFERENCE ───',
            '/image <path>        : Attach image for vision models (media first, then prompt)',
            '/audio <path>        : Attach audio file for transcription/multimodal input',
            '/clear               : Clear terminal transcript history',
            '/help                : Display this guide',
            'Sampling: --temp (default 0.8), --top-k 40, --top-p 0.95, --min-p 0.05, -n (max tokens)',
            'Memory:   -c <ctx>, -cmoe (CPU MoE experts), --fit on',
            'Reason:   -rea on|off, --reasoning-budget <tokens>',
            'Drafter:  -md <draft.gguf> --spec-type draft-simple|draft-mtp|draft-eagle3',
          ].join('\n'),
          timestamp,
        },
      ]);
      return;
    }

    if (repl.type === 'clear') {
      setHistory([]);
      return;
    }

    if (repl.type === 'image') {
      const imgPath = repl.payload || 'image.png';
      setAttachedImages((prev) => [...prev, imgPath]);
      setHistory((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, type: 'prompt', content: text, timestamp },
        { id: `i-${Date.now()}`, type: 'info', content: `Loaded media from '${imgPath}'`, timestamp },
      ]);
      return;
    }

    if (repl.type === 'audio') {
      const audPath = repl.payload || 'sample.mp3';
      setAttachedAudio((prev) => [...prev, audPath]);
      setHistory((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, type: 'prompt', content: text, timestamp },
        { id: `a-${Date.now()}`, type: 'info', content: `Loaded media from '${audPath}'`, timestamp },
      ]);
      return;
    }

    // Standard Prompt
    setHistory((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, type: 'prompt', content: text, timestamp },
    ]);

    setIsGenerating(true);

    try {
      // Try local llama-server if live, else synthetic realistic streaming
      if (serverOnline) {
        const res = await postLlamaCppChat(
          [
            ...(config.systemPrompt ? [{ role: 'system' as const, content: config.systemPrompt }] : []),
            { role: 'user' as const, content: text },
          ],
          config.model,
          {
            temperature: config.temperature,
            top_k: config.topK,
            top_p: config.topP,
            min_p: config.minP,
            repeat_penalty: config.repeatPenalty,
            reasoning_budget: config.reasoningBudget,
          }
        );

        setHistory((prev) => [
          ...prev,
          {
            id: `resp-${Date.now()}`,
            type: 'output',
            content: res.text,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      } else {
        // High-fidelity CLI response simulation with reasoning breakdown
        await new Promise((r) => setTimeout(r, 600));

        let responseBody = '';
        if (config.reasoningMode === 'on') {
          responseBody += `[Thinking Process: Evaluating prompt '${text.slice(0, 30)}...' with reasoning budget ${config.reasoningBudget ?? 1024} tokens. Synthesizing latent GGUF representations...]\n\n`;
        }

        if (attachedImages.length > 0) {
          responseBody += `[Visual Inspection: Multi-frame visual projection resolved for ${attachedImages.join(', ')}]\n`;
        }
        if (attachedAudio.length > 0) {
          responseBody += `[Audio Spectrogram: Transcribing waveform from ${attachedAudio.join(', ')}]\n`;
        }

        if (text.toLowerCase().includes('baklava')) {
          responseBody += `Here is a crisp, traditional baklava recipe:\n• Ingredients: Phyllo dough, melted clarified butter, chopped walnuts/pistachios, cinnamon, honey-lemon syrup.\n• Assembly: Layer 8 sheets brushing butter between each, spread crushed nuts, repeat 3x, cut diamond shapes.\n• Bake at 175°C (350°F) for 45 min until golden. Pour cold honey syrup over hot pastry immediately.`;
        } else if (text.toLowerCase().includes('speculative')) {
          responseBody += `Speculative decoding accelerates generation by pairing a large model with a small assistant model (e.g., --spec-type draft-mtp). The drafter quickly proposes candidate tokens in parallel, which the primary model verifies in a single forward pass, achieving 2x-3x speedups without degrading precision.`;
        } else {
          responseBody += `[Model: ${config.model}] Execution completed with temp=${config.temperature ?? 0.8}, top_p=${config.topP ?? 0.95}, context=${config.contextWindow ?? 'max'}.\nAnalysis: Sovereign query processed under GGUF quantisation parameters. Ready for subsequent vector inference.`;
        }

        setHistory((prev) => [
          ...prev,
          {
            id: `resp-${Date.now()}`,
            type: 'output',
            content: responseBody,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      }
    } catch (err: any) {
      setHistory((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          type: 'error',
          content: `CLI Error: ${err.message || String(err)}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative flex flex-col h-full w-full min-h-[750px] bg-[#0c0d12]/90 rounded-2xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-2xl">
      {/* ─── Top Command Hub & Navigation ─── */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-white/10 bg-black/40">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-roman-aqua/20 to-patina-green/20 border border-roman-aqua/40 flex items-center justify-center text-roman-aqua shadow-[0_0_15px_rgba(32,178,170,0.2)]">
            <BrainIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold font-comfortaa text-white tracking-wide">
                Llama CLI Studio
              </h2>
              <span className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded-full bg-roman-aqua/10 border border-roman-aqua/30 text-roman-aqua">
                llama.cpp 2026
              </span>
            </div>
            <p className="text-[11px] font-lexend text-text-tertiary">
              Interactive terminal playground, GGUF orchestrator &amp; flag synthesizer
            </p>
          </div>
        </div>

        {/* Status Bio-Digital Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[11px] font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                serverOnline ? 'bg-patina-green animate-pulse shadow-[0_0_8px_#3EB991]' : 'bg-yellow-400'
              }`}
            />
            <span className="text-text-secondary">
              {serverOnline ? 'Local llama-server Online' : 'CLI Synthesis Mode'}
            </span>
          </div>

          {/* Navigation Tabs */}
          <div className="flex rounded-lg bg-black/50 p-1 border border-white/10 font-comfortaa text-xs">
            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-3 py-1.5 rounded-md transition-all font-bold ${
                activeTab === 'terminal'
                  ? 'bg-roman-aqua/20 text-roman-aqua border border-roman-aqua/30'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              Terminal
            </button>
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-3 py-1.5 rounded-md transition-all font-bold ${
                activeTab === 'builder'
                  ? 'bg-roman-aqua/20 text-roman-aqua border border-roman-aqua/30'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              Flag Matrix
            </button>
            <button
              onClick={() => setActiveTab('speculative')}
              className={`px-3 py-1.5 rounded-md transition-all font-bold ${
                activeTab === 'speculative'
                  ? 'bg-roman-aqua/20 text-roman-aqua border border-roman-aqua/30'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              Speculative &amp; Media
            </button>
            <button
              onClick={() => setActiveTab('presets')}
              className={`px-3 py-1.5 rounded-md transition-all font-bold ${
                activeTab === 'presets'
                  ? 'bg-roman-aqua/20 text-roman-aqua border border-roman-aqua/30'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              Presets
            </button>
          </div>
        </div>
      </div>

      {/* ─── Live Command Strip (Always Visible) ─── */}
      <div className="px-4 py-2.5 bg-black/60 border-b border-white/5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-grow overflow-hidden font-mono text-xs">
          <span className="text-patina-green shrink-0 font-bold">$</span>
          <input
            type="text"
            value={manualCmd}
            onChange={(e) => handleManualCmdChange(e.target.value)}
            className="w-full bg-transparent text-roman-aqua focus:outline-none truncate selection:bg-roman-aqua/30"
            title="Edit command directly or copy"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyCommand}
            className="px-3 py-1.5 rounded-lg bg-roman-aqua/10 hover:bg-roman-aqua/20 border border-roman-aqua/30 text-roman-aqua font-comfortaa text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-[0_0_10px_rgba(32,178,170,0.15)]"
          >
            {copied ? (
              <>
                <SparkIcon className="w-3.5 h-3.5 text-patina-green" />
                <span className="text-patina-green">Copied!</span>
              </>
            ) : (
              <>
                <ZapIcon className="w-3.5 h-3.5" />
                <span>Copy CLI Command</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─── Main Content Panels ─── */}
      <div className="flex-grow flex flex-col md:flex-row overflow-hidden relative">
        {/* Terminal Area */}
        {activeTab === 'terminal' && (
          <div className="flex-1 flex flex-col h-full bg-[#0a0a0f] border-r border-white/5">
            {/* Terminal Window Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-white/[0.03] border-b border-white/5 text-[11px] font-mono">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                <span className="ml-2 text-text-tertiary">llama-cli: session@{config.model.split('/').pop() || config.model}</span>
              </div>
              <div className="flex items-center gap-3 text-text-tertiary">
                <span>ctx: {config.contextWindow || 'auto'}</span>
                <span>temp: {config.temperature ?? 0.8}</span>
                {config.reasoningMode === 'on' && (
                  <span className="text-roman-aqua">rea: {config.reasoningBudget ?? 'on'}</span>
                )}
              </div>
            </div>

            {/* Transcript Area */}
            <div
              ref={terminalEndRef}
              className="flex-grow p-4 overflow-y-auto space-y-3 font-mono text-xs custom-scrollbar select-text"
            >
              {history.map((line) => (
                <div key={line.id} className="leading-relaxed">
                  {line.type === 'system' && (
                    <div className="text-roman-aqua/90 flex items-start gap-2">
                      <span className="text-white/40">[{line.timestamp}]</span>
                      <span># {line.content}</span>
                    </div>
                  )}
                  {line.type === 'info' && (
                    <div className="text-patina-green/90 bg-patina-green/5 p-2 rounded border border-patina-green/20 whitespace-pre-wrap">
                      {line.content}
                    </div>
                  )}
                  {line.type === 'prompt' && (
                    <div className="text-white flex items-start gap-2 font-bold">
                      <span className="text-roman-aqua">&gt;</span>
                      <span>{line.content}</span>
                    </div>
                  )}
                  {line.type === 'output' && (
                    <div className="text-[#e2e8f0] bg-white/[0.02] p-3 rounded-lg border border-white/5 whitespace-pre-wrap pl-4 border-l-2 border-l-roman-aqua">
                      {line.content}
                    </div>
                  )}
                  {line.type === 'error' && (
                    <div className="text-red-400 bg-red-500/10 p-2.5 rounded border border-red-500/30">
                      {line.content}
                    </div>
                  )}
                </div>
              ))}
              {isGenerating && (
                <div className="flex items-center gap-2 text-roman-aqua animate-pulse text-xs">
                  <span>●</span>
                  <span>llama cli inference streaming tokens...</span>
                </div>
              )}
            </div>

            {/* Attached Media Chips */}
            {(attachedImages.length > 0 || attachedAudio.length > 0) && (
              <div className="px-4 py-2 bg-black/40 border-t border-white/5 flex flex-wrap gap-2 text-[10px] font-mono">
                {attachedImages.map((img, i) => (
                  <span
                    key={`img-${i}`}
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-roman-aqua/10 text-roman-aqua border border-roman-aqua/30"
                  >
                    <span>🖼 {img}</span>
                    <button
                      onClick={() => setAttachedImages((p) => p.filter((_, idx) => idx !== i))}
                      className="hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {attachedAudio.map((aud, i) => (
                  <span
                    key={`aud-${i}`}
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-patina-green/10 text-patina-green border border-patina-green/30"
                  >
                    <span>🎙 {aud}</span>
                    <button
                      onClick={() => setAttachedAudio((p) => p.filter((_, idx) => idx !== i))}
                      className="hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Command Prompt Input */}
            <div className="p-3 bg-black/70 border-t border-white/10 flex items-center gap-3">
              <span className="text-roman-aqua font-mono font-bold text-sm pl-2">&gt;</span>
              <input
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendPrompt();
                  }
                }}
                placeholder="Type prompt or command (e.g. Give me a baklava recipe, /image path.png, /help)..."
                className="flex-grow bg-transparent text-white font-mono text-xs focus:outline-none placeholder:text-text-tertiary"
              />
              <button
                onClick={() => handleSendPrompt()}
                disabled={isGenerating || !terminalInput.trim()}
                className="px-4 py-1.5 rounded-lg bg-roman-aqua/20 hover:bg-roman-aqua/30 disabled:opacity-30 border border-roman-aqua/40 text-roman-aqua font-comfortaa text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_0_8px_rgba(32,178,170,0.2)]"
              >
                <SendIcon className="w-3.5 h-3.5" />
                <span>Execute</span>
              </button>
            </div>
          </div>
        )}

        {/* Builder / Sampling Parameters Panel */}
        {(activeTab === 'builder' || activeTab === 'terminal') && (
          <div
            className={`w-full md:w-80 lg:w-96 flex flex-col p-4 bg-black/30 border-t md:border-t-0 md:border-l border-white/5 overflow-y-auto space-y-5 custom-scrollbar text-xs font-lexend ${
              activeTab === 'terminal' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <div>
              <h3 className="text-xs font-bold font-comfortaa uppercase tracking-wider text-roman-aqua mb-1">
                Model Acquisition
              </h3>
              <p className="text-[10px] text-text-tertiary mb-3">
                Point at Hugging Face Hub or local filesystem GGUF file.
              </p>

              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setConfig((p) => ({ ...p, modelSource: 'hf' }))}
                  className={`flex-1 py-1 rounded text-center font-bold border transition-all ${
                    config.modelSource === 'hf'
                      ? 'bg-roman-aqua/20 border-roman-aqua text-roman-aqua'
                      : 'bg-white/5 border-white/5 text-text-secondary'
                  }`}
                >
                  HF Repo (-hf)
                </button>
                <button
                  onClick={() => setConfig((p) => ({ ...p, modelSource: 'local' }))}
                  className={`flex-1 py-1 rounded text-center font-bold border transition-all ${
                    config.modelSource === 'local'
                      ? 'bg-roman-aqua/20 border-roman-aqua text-roman-aqua'
                      : 'bg-white/5 border-white/5 text-text-secondary'
                  }`}
                >
                  Local File (-m)
                </button>
              </div>

              <input
                type="text"
                value={config.model}
                onChange={(e) => setConfig((p) => ({ ...p, model: e.target.value }))}
                placeholder={config.modelSource === 'hf' ? 'repo/model-GGUF:Q4_0' : 'path/to/model.gguf'}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 font-mono text-[11px] text-white focus:border-roman-aqua outline-none"
              />
            </div>

            {/* System Prompt & Single Turn */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-text-secondary">System Directive (-sys)</label>
              <textarea
                value={config.systemPrompt || ''}
                onChange={(e) => setConfig((p) => ({ ...p, systemPrompt: e.target.value }))}
                rows={2}
                placeholder="You are a concise assistant that answers in bullet points."
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 font-mono text-[11px] text-white focus:border-roman-aqua outline-none"
              />
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-text-secondary">Single Turn Mode (-st)</span>
                <input
                  type="checkbox"
                  checked={!!config.singleTurn}
                  onChange={(e) => setConfig((p) => ({ ...p, singleTurn: e.target.checked }))}
                  className="accent-roman-aqua"
                />
              </div>
            </div>

            {/* Sampling Sliders */}
            <div className="space-y-3 pt-3 border-t border-white/5">
              <h4 className="text-xs font-bold font-comfortaa uppercase tracking-wider text-patina-green">
                Sampling Parameters
              </h4>

              {/* Temperature */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-text-secondary">Temperature (--temp)</span>
                  <span className="font-mono text-roman-aqua">{config.temperature ?? 0.8}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="2.0"
                  step="0.05"
                  value={config.temperature ?? 0.8}
                  onChange={(e) => setConfig((p) => ({ ...p, temperature: parseFloat(e.target.value) }))}
                  className="w-full accent-roman-aqua"
                />
              </div>

              {/* Top-K */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-text-secondary">Top-K (--top-k)</span>
                  <span className="font-mono text-roman-aqua">{config.topK ?? 40}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={config.topK ?? 40}
                  onChange={(e) => setConfig((p) => ({ ...p, topK: parseInt(e.target.value, 10) }))}
                  className="w-full accent-roman-aqua"
                />
              </div>

              {/* Top-P */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-text-secondary">Nucleus Top-P (--top-p)</span>
                  <span className="font-mono text-roman-aqua">{config.topP ?? 0.95}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={config.topP ?? 0.95}
                  onChange={(e) => setConfig((p) => ({ ...p, topP: parseFloat(e.target.value) }))}
                  className="w-full accent-roman-aqua"
                />
              </div>

              {/* Min-P */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-text-secondary">Min-P Probability (--min-p)</span>
                  <span className="font-mono text-roman-aqua">{config.minP ?? 0.05}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="0.5"
                  step="0.01"
                  value={config.minP ?? 0.05}
                  onChange={(e) => setConfig((p) => ({ ...p, minP: parseFloat(e.target.value) }))}
                  className="w-full accent-roman-aqua"
                />
              </div>

              {/* Repeat Penalty */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-text-secondary">Repeat Penalty (--repeat-penalty)</span>
                  <span className="font-mono text-roman-aqua">{config.repeatPenalty ?? 1.0}</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.5"
                  step="0.05"
                  value={config.repeatPenalty ?? 1.0}
                  onChange={(e) => setConfig((p) => ({ ...p, repeatPenalty: parseFloat(e.target.value) }))}
                  className="w-full accent-roman-aqua"
                />
              </div>
            </div>

            {/* Hardware & Memory */}
            <div className="space-y-3 pt-3 border-t border-white/5">
              <h4 className="text-xs font-bold font-comfortaa uppercase tracking-wider text-yellow-400">
                Memory &amp; Offload
              </h4>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-text-secondary">Context Size (-c)</span>
                <input
                  type="number"
                  value={config.contextWindow ?? 8192}
                  onChange={(e) => setConfig((p) => ({ ...p, contextWindow: parseInt(e.target.value, 10) }))}
                  className="w-24 bg-white/5 border border-white/10 rounded p-1 font-mono text-right text-white"
                />
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-text-secondary">Keep MoE Experts on CPU (-cmoe)</span>
                <input
                  type="checkbox"
                  checked={!!config.cpuMoe}
                  onChange={(e) => setConfig((p) => ({ ...p, cpuMoe: e.target.checked }))}
                  className="accent-roman-aqua"
                />
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-text-secondary">Auto Fit Device Memory (--fit on)</span>
                <input
                  type="checkbox"
                  checked={config.fitMemory !== false}
                  onChange={(e) => setConfig((p) => ({ ...p, fitMemory: e.target.checked }))}
                  className="accent-roman-aqua"
                />
              </div>
            </div>
          </div>
        )}

        {/* Speculative & Multimodal Panel */}
        {activeTab === 'speculative' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar font-lexend">
            <div>
              <h3 className="text-base font-bold font-comfortaa text-white mb-2 flex items-center gap-2">
                <ZapIcon className="w-5 h-5 text-roman-aqua" />
                <span>Speculative Decoding &amp; Assistant Models</span>
              </h3>
              <p className="text-xs text-text-tertiary leading-relaxed max-w-2xl">
                Speed up generation using speculative decoding assistant models. Specify both the primary model
                and the drafter to achieve higher throughput on supported hardware.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-roman-aqua uppercase font-comfortaa">Draft Engine</h4>
                <div>
                  <label className="text-[11px] text-text-secondary block mb-1">Speculative Type (--spec-type)</label>
                  <select
                    value={config.specType || 'none'}
                    onChange={(e) => setConfig((p) => ({ ...p, specType: e.target.value as any }))}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2 font-mono text-xs text-white"
                  >
                    <option value="none">none (Standard inference)</option>
                    <option value="draft-simple">draft-simple (Small draft model)</option>
                    <option value="draft-mtp">draft-mtp (Multi-token prediction)</option>
                    <option value="draft-eagle3">draft-eagle3 (Eagle-3 drafter)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-text-secondary block mb-1">Local Draft Model (-md)</label>
                  <input
                    type="text"
                    value={config.draftModel || ''}
                    onChange={(e) => setConfig((p) => ({ ...p, draftModel: e.target.value }))}
                    placeholder="small-draft-model.gguf"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2 font-mono text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-text-secondary block mb-1">Hugging Face Draft Repo (--hf-repo-draft)</label>
                  <input
                    type="text"
                    value={config.hfRepoDraft || ''}
                    onChange={(e) => setConfig((p) => ({ ...p, hfRepoDraft: e.target.value }))}
                    placeholder="ggml-org/gemma-4-e4b-it-GGUF:Q4_0"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2 font-mono text-xs text-white"
                  />
                </div>
              </div>

              {/* Reasoning Engine */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-patina-green uppercase font-comfortaa">Thinking / Reasoning</h4>
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-text-secondary">Reasoning Mode (-rea)</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfig((p) => ({ ...p, reasoningMode: 'on' }))}
                      className={`px-3 py-1 rounded font-bold border ${
                        config.reasoningMode === 'on'
                          ? 'bg-patina-green/20 border-patina-green text-patina-green'
                          : 'bg-white/5 border-white/5 text-text-tertiary'
                      }`}
                    >
                      on
                    </button>
                    <button
                      onClick={() => setConfig((p) => ({ ...p, reasoningMode: 'off' }))}
                      className={`px-3 py-1 rounded font-bold border ${
                        config.reasoningMode === 'off'
                          ? 'bg-red-500/20 border-red-500 text-red-400'
                          : 'bg-white/5 border-white/5 text-text-tertiary'
                      }`}
                    >
                      off (-rea off)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-text-secondary block mb-1">
                    Reasoning Token Budget (--reasoning-budget)
                  </label>
                  <input
                    type="number"
                    value={config.reasoningBudget ?? 1024}
                    onChange={(e) => setConfig((p) => ({ ...p, reasoningBudget: parseInt(e.target.value, 10) }))}
                    placeholder="1024"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2 font-mono text-xs text-white"
                  />
                  <span className="text-[10px] text-text-tertiary mt-1 block">
                    Caps intermediate chain-of-thought tokens before final synthesis.
                  </span>
                </div>
              </div>
            </div>

            {/* Multimodal File Arrays */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase font-comfortaa">
                Multimodal Input Assets (--image / --audio)
              </h4>
              <p className="text-[11px] text-text-tertiary">
                Pass media files alongside your one-off prompts or use the REPL commands /image and /audio.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-text-secondary block mb-1">Image Paths (comma-separated)</label>
                  <input
                    type="text"
                    value={attachedImages.join(', ')}
                    onChange={(e) =>
                      setAttachedImages(
                        e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean)
                      )
                    }
                    placeholder="diagram.png, screenshot.png"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2 font-mono text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-text-secondary block mb-1">Audio Paths (comma-separated)</label>
                  <input
                    type="text"
                    value={attachedAudio.join(', ')}
                    onChange={(e) =>
                      setAttachedAudio(
                        e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean)
                      )
                    }
                    placeholder="/path/to/speech.mp3"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2 font-mono text-xs text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Presets Catalog Panel */}
        {activeTab === 'presets' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar font-lexend">
            <div>
              <h3 className="text-base font-bold font-comfortaa text-white mb-1">Curated Llama CLI Configurations</h3>
              <p className="text-xs text-text-tertiary">
                Click any preset to load complete command flags and parameter structures directly into the compiler.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {LLAMA_CLI_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  className="group cursor-pointer p-5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-roman-aqua/40 rounded-xl transition-all duration-300 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-white text-sm font-comfortaa group-hover:text-roman-aqua transition-colors">
                      {preset.name}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-roman-aqua/10 text-roman-aqua border border-roman-aqua/20">
                      {preset.badge}
                    </span>
                  </div>
                  <p className="text-xs text-text-tertiary mb-3 leading-relaxed">{preset.description}</p>
                  <div className="bg-black/40 p-2.5 rounded font-mono text-[10px] text-patina-green truncate border border-white/5">
                    {buildLlamaCliCommand(preset.config)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── Bio-Digital Living Indicator Footer ─── */}
      <div className="px-4 py-2 bg-black/80 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-text-tertiary">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-roman-aqua animate-pulse" />
            <span>THE VEIN: SYSTEM FLOW NORMAL</span>
          </span>
          <span className="hidden sm:inline text-white/30">|</span>
          <span className="hidden sm:inline">ACCELERATION: VULKAN/CUDA AUTO-FIT</span>
        </div>

        {/* ─── Mandatory Brand Signature Stamp ─── */}
        <div className="flex flex-col items-end opacity-40 select-none mix-blend-overlay">
          <span className="font-comfortaa font-bold text-[10px] tracking-normal text-white">ΛΞV Inc</span>
          <span className="font-lexend text-[8px] tracking-[0.2em] text-white uppercase">The Future Needs Context</span>
        </div>
      </div>
    </div>
  );
};

export default LlamaCliPlayground;
