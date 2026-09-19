import React from 'react';
import { Activity, Grid, Cpu, Terminal, DoorClosed, Lock, Unlock } from 'lucide-react';
import { SubsystemStatus, SubsystemId } from '../types';

interface ChamberOverviewProps {
  subsystems: SubsystemStatus[];
  currentSubsystem: SubsystemId;
  onSelectSubsystem: (id: SubsystemId) => void;
}

export const ChamberOverview: React.FC<ChamberOverviewProps> = ({
  subsystems,
  currentSubsystem,
  onSelectSubsystem
}) => {
  const allBypassed = subsystems.every(s => s.cleared);

  const getSub = (id: SubsystemId) => subsystems.find(s => s.id === id);
  const alpha = getSub('frequency');
  const beta = getSub('matrix');
  const gamma = getSub('circuit');
  const delta = getSub('terminal');

  return (
    <div className="bg-[#070b13] border border-slate-800 rounded-lg p-4 sm:p-5 mb-5 relative overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00ffcc] animate-ping" />
          <span>FACILITY SECTOR 07: ISOLATION CHAMBER SCHEMATIC</span>
        </div>
        <div className="text-[11px] font-mono text-slate-500">
          CLICK ANY CONSOLE NODE TO SWITCH DIRECT INTERFACE
        </div>
      </div>

      {/* Schematic Layout */}
      <div className="relative border border-slate-800/80 rounded-lg bg-[#04060c] p-4 sm:p-6 min-h-[160px] flex flex-col justify-between cyber-grid">
        {/* Top Node (Alpha: Frequency) */}
        <div className="flex justify-center">
          <button
            onClick={() => onSelectSubsystem('frequency')}
            className={`px-3 py-1.5 rounded border text-xs font-mono transition-all flex items-center gap-2 ${
              currentSubsystem === 'frequency'
                ? 'border-[#00ffcc] bg-[#00ffcc]/20 text-[#00ffcc] shadow-[0_0_12px_#00ffcc]'
                : alpha?.cleared
                ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300'
                : 'border-slate-700 bg-slate-900/80 text-slate-300 hover:border-slate-500'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>NODE ALPHA: RESONANCE HARMONIZER</span>
            {alpha?.cleared ? <Unlock className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-slate-500" />}
          </button>
        </div>

        {/* Center Row: Beta (Left) - Delta Terminal (Center) - Gamma (Right) */}
        <div className="flex flex-wrap items-center justify-between gap-3 my-4">
          <button
            onClick={() => onSelectSubsystem('matrix')}
            className={`px-3 py-1.5 rounded border text-xs font-mono transition-all flex items-center gap-2 ${
              currentSubsystem === 'matrix'
                ? 'border-[#00ffcc] bg-[#00ffcc]/20 text-[#00ffcc] shadow-[0_0_12px_#00ffcc]'
                : beta?.cleared
                ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300'
                : 'border-slate-700 bg-slate-900/80 text-slate-300 hover:border-slate-500'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>NODE BETA: BUFFER MATRIX</span>
            {beta?.cleared ? <Unlock className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-slate-500" />}
          </button>

          {/* Central Terminal */}
          <button
            onClick={() => onSelectSubsystem('terminal')}
            className={`px-4 py-2 rounded-lg border-2 text-xs font-mono font-bold transition-all flex items-center gap-2 ${
              currentSubsystem === 'terminal'
                ? 'border-[#00ffcc] bg-[#00ffcc]/25 text-[#00ffcc] shadow-[0_0_16px_#00ffcc]'
                : delta?.cleared
                ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                : 'border-amber-500/50 bg-amber-950/30 text-amber-300 hover:border-amber-400'
            }`}
          >
            <Terminal className="w-4 h-4 text-[#00ffcc]" />
            <span>CORE OVERRIDE TERMINAL (DELTA)</span>
            {delta?.cleared ? <Unlock className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-amber-400" />}
          </button>

          <button
            onClick={() => onSelectSubsystem('circuit')}
            className={`px-3 py-1.5 rounded border text-xs font-mono transition-all flex items-center gap-2 ${
              currentSubsystem === 'circuit'
                ? 'border-[#00ffcc] bg-[#00ffcc]/20 text-[#00ffcc] shadow-[0_0_12px_#00ffcc]'
                : gamma?.cleared
                ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300'
                : 'border-slate-700 bg-slate-900/80 text-slate-300 hover:border-slate-500'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>NODE GAMMA: LOGIC CONDUIT</span>
            {gamma?.cleared ? <Unlock className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-slate-500" />}
          </button>
        </div>

        {/* Bottom Airlock Exit Door */}
        <div className="flex justify-center">
          <div className={`px-4 py-1.5 rounded border text-xs font-mono flex items-center gap-2 transition-all ${
            allBypassed
              ? 'border-emerald-500 bg-emerald-950/50 text-emerald-300 shadow-[0_0_14px_#10b981]'
              : 'border-red-900/60 bg-red-950/30 text-red-400'
          }`}>
            <DoorClosed className="w-4 h-4" />
            <span>MAIN AIRLOCK SEAL: {allBypassed ? 'DECOUPLED // READY FOR EXTRACTION' : 'HERMETICALLY LOCKED BY ARCHON-IX'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
