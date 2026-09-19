import React from 'react';
import { Shield, ShieldAlert, Cpu, Activity, Grid, Terminal, AlertTriangle, Eye } from 'lucide-react';
import { SubsystemStatus, SubsystemId } from '../types';

interface CyberHUDProps {
  timeLeft: number;
  neuralIntegrity: number;
  subsystems: SubsystemStatus[];
  currentSubsystem: SubsystemId;
  onSelectSubsystem: (id: SubsystemId) => void;
  aiDialogue: string;
  threatLevel: 'nominal' | 'elevated' | 'critical';
  onOpenHints: () => void;
  onOpenLore: () => void;
}

export const CyberHUD: React.FC<CyberHUDProps> = ({
  timeLeft,
  neuralIntegrity,
  subsystems,
  currentSubsystem,
  onSelectSubsystem,
  aiDialogue,
  threatLevel,
  onOpenHints,
  onOpenLore
}) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isLowTime = timeLeft < 90;
  const isCriticalIntegrity = neuralIntegrity < 25;

  const clearedCount = subsystems.filter(s => s.cleared).length;

  const getSubsystemIcon = (id: SubsystemId) => {
    switch (id) {
      case 'frequency': return <Activity className="w-4 h-4" />;
      case 'matrix': return <Grid className="w-4 h-4" />;
      case 'circuit': return <Cpu className="w-4 h-4" />;
      case 'terminal': return <Terminal className="w-4 h-4" />;
    }
  };

  return (
    <header className="border-b border-[#00ffcc]/20 bg-[#070b14]/90 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 py-2.5">
      {/* Top Telemetry Row */}
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: App title & Threat indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00ffcc] animate-pulse shadow-[0_0_8px_#00ffcc]" />
            <span className="font-cyber font-black tracking-widest text-lg sm:text-xl text-white uppercase flex items-center gap-1.5">
              NEURAL <span className="text-[#00ffcc]">BREACH</span>
            </span>
          </div>

          <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-mono border rounded ${
            threatLevel === 'critical'
              ? 'border-red-500/60 bg-red-950/40 text-red-400 animate-pulse'
              : threatLevel === 'elevated'
              ? 'border-amber-500/60 bg-amber-950/40 text-amber-300'
              : 'border-[#00ffcc]/30 bg-[#00ffcc]/5 text-[#00ffcc]'
          }`}>
            <AlertTriangle className="w-3 h-3" />
            <span>THREAT: {threatLevel.toUpperCase()}</span>
          </div>
        </div>

        {/* Center: Countdown Timer & Neural Integrity */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Countdown Clock */}
          <div className="flex flex-col items-center">
            <div className="text-[10px] tracking-wider text-slate-400 font-mono uppercase flex items-center gap-1">
              <span>PURGE COUNTDOWN</span>
            </div>
            <div className={`font-mono text-xl sm:text-2xl font-bold tracking-wider ${
              isLowTime ? 'text-red-500 animate-pulse' : 'text-[#00ffcc]'
            }`}>
              {timeFormatted}
            </div>
          </div>

          {/* Neural Integrity Meter */}
          <div className="w-28 sm:w-44 flex flex-col gap-1">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                {isCriticalIntegrity ? <ShieldAlert className="w-3 h-3 text-red-400" /> : <Shield className="w-3 h-3 text-[#00ffcc]" />}
                SYNAPSE
              </span>
              <span className={isCriticalIntegrity ? 'text-red-400 font-bold' : 'text-slate-300'}>
                {Math.round(neuralIntegrity)}%
              </span>
            </div>
            <div className="h-2 w-full bg-slate-900 border border-slate-700/60 rounded-sm overflow-hidden p-0.5">
              <div 
                className={`h-full transition-all duration-300 rounded-xs ${
                  isCriticalIntegrity 
                    ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' 
                    : neuralIntegrity < 55 
                    ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' 
                    : 'bg-[#00ffcc] shadow-[0_0_8px_#00ffcc]'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, neuralIntegrity))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right action shortcuts */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenLore}
            className="px-2.5 py-1 text-xs font-mono text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded transition-colors flex items-center gap-1.5"
            title="Read Dr. Chen's Archives & Data Logs"
          >
            <Eye className="w-3.5 h-3.5 text-[#00ffcc]" />
            <span className="hidden sm:inline">DATA LOGS</span>
          </button>
          <button
            onClick={onOpenHints}
            className="px-2.5 py-1 text-xs font-mono text-[#00ffcc] hover:text-white bg-[#00ffcc]/10 hover:bg-[#00ffcc]/20 border border-[#00ffcc]/40 rounded transition-colors flex items-center gap-1"
          >
            <span>INTEL</span>
          </button>
        </div>
      </div>

      {/* AI Warden Dialogue Banner */}
      <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-slate-800/80 flex items-start gap-2.5 text-xs font-mono">
        <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded bg-red-950/60 border border-red-500/40 text-red-400 font-bold tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
          ARCHON-IX
        </div>
        <p className="text-slate-300 italic tracking-wide line-clamp-1 sm:line-clamp-none flex-1">
          "{aiDialogue}"
        </p>
        <div className="hidden lg:block text-slate-500 text-[11px] shrink-0 font-mono">
          BYPASSES: {clearedCount}/4
        </div>
      </div>

      {/* Subsystem Navigation Bar */}
      <div className="max-w-7xl mx-auto mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1">
        {subsystems.map((sub, index) => {
          const isSelected = currentSubsystem === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => onSelectSubsystem(sub.id)}
              className={`flex-1 min-w-[130px] sm:min-w-[170px] py-1.5 px-2.5 rounded border text-left transition-all relative ${
                isSelected
                  ? 'border-[#00ffcc] bg-[#00ffcc]/15 shadow-[0_0_12px_rgba(0,255,204,0.15)] text-white'
                  : sub.cleared
                  ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300 hover:border-emerald-400'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                  NODE 0{index + 1}
                </span>
                <span className={`text-[10px] font-mono px-1 rounded ${
                  sub.cleared
                    ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                    : isSelected
                    ? 'bg-[#00ffcc]/20 text-[#00ffcc]'
                    : 'text-slate-500'
                }`}>
                  {sub.cleared ? 'BYPASSED' : isSelected ? 'ACTIVE' : 'LOCKED'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={sub.cleared ? 'text-emerald-400' : isSelected ? 'text-[#00ffcc]' : 'text-slate-400'}>
                  {getSubsystemIcon(sub.id)}
                </span>
                <span className="text-xs font-semibold truncate">
                  {sub.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </header>
  );
};
