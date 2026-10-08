
import React from 'react';
import { motion } from 'framer-motion';

interface SankeyFlowProps {
  data: any;
}

const Node: React.FC<{ x: number, y: number, height: number, color: string, label: string, value: string, align?: 'left' | 'right' | 'center' }> = ({ x, y, height, color, label, value, align = 'left' }) => (
  <g>
    <motion.rect
      initial={{ height: 0 }}
      animate={{ height }}
      transition={{ duration: 1 }}
      x={x} y={y} width={20} height={height} rx={4} fill={color} className="opacity-80"
    />
    <text
      x={align === 'left' ? x - 10 : align === 'right' ? x + 30 : x + 10}
      y={y + height / 2}
      textAnchor={align === 'left' ? 'end' : align === 'right' ? 'start' : 'middle'}
      dominantBaseline="middle"
      className="fill-white text-[10px] font-bold font-comfortaa uppercase tracking-tighter"
    >
      {label}
    </text>
  </g>
);

const FlowPath: React.FC<{ start: { x: number, y: number }, end: { x: number, y: number }, width: number, color: string }> = ({ start, end, width, color }) => {
  const d = `M ${start.x} ${start.y} C ${start.x + (end.x - start.x) / 2} ${start.y}, ${start.x + (end.x - start.x) / 2} ${end.y}, ${end.x} ${end.y}`;
  return (
    <path d={d} fill="none" stroke={color} strokeWidth={width} strokeOpacity={0.1} strokeLinecap="round" />
  );
};

const SankeyFlow: React.FC<SankeyFlowProps> = ({ data }) => {
  const width = 800;
  const height = 400;
  const scale = 0.002;

  return (
    <div className="w-full h-full bg-black/20 rounded-xl border border-glass-border p-4 overflow-hidden relative">
      <h3 className="absolute top-4 left-4 text-[10px] font-black uppercase text-text-tertiary">Value Transmutation Flow</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        {/* Simplified Sankey Logic */}
        <Node x={50} y={100} height={data.inputs.subscriptions * scale} color="#20B2AA" label="Subs" value="Fiat" />
        <Node x={50} y={250} height={data.inputs.overage * scale} color="#6A0DAD" label="Overage" value="Fiat" />
        
        <Node x={390} y={150} height={80} color="#FFD700" label="Syndicate Xi" value="Internal" align="center" />
        
        <Node x={730} y={100} height={data.outputs.cogniOps * scale} color="#EF4444" label="CogniOps" value="Burn" align="right" />
        <Node x={730} y={250} height={data.outputs.poaRewards * scale} color="#3EB991" label="Strategic" value="Mint" align="right" />

        {/* Paths */}
        <FlowPath start={{x: 70, y: 120}} end={{x: 390, y: 160}} width={10} color="#20B2AA" />
        <FlowPath start={{x: 70, y: 270}} end={{x: 390, y: 220}} width={5} color="#6A0DAD" />
        <FlowPath start={{x: 410, y: 180}} end={{x: 730, y: 130}} width={12} color="#EF4444" />
        <FlowPath start={{x: 410, y: 210}} end={{x: 730, y: 280}} width={8} color="#3EB991" />
      </svg>
    </div>
  );
};

export default SankeyFlow;
