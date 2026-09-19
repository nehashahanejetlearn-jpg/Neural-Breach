import React from 'react';
import { ShieldCheck, Skull, RotateCcw, Award, Clock, Activity, Zap } from 'lucide-react';
import { GamePhase, DifficultySetting } from '../types';

interface EscapeSequenceModalProps {
  phase: GamePhase;
  timeSpentSec: number;
  neuralIntegrity: number;
  difficulty: DifficultySetting;
  onRestart: (newDiff?: DifficultySetting) => void;
}

export const EscapeSequenceModal: React.FC<EscapeSequenceModalProps> = ({
  phase,
  timeSpentSec,
  neuralIntegrity,
  difficulty,
  onRestart
}) => {
  if (phase !== 'breached' && phase !== 'flatlined') return null;

  const isWin = phase === 'breached';

  const minutes = Math.floor(timeSpentSec / 60);
  const seconds = timeSpentSec % 60;
  const timeFormatted = `${minutes}m ${seconds}s`;

  // Calculate hacker rating
  let grade = 'C';
  let title = 'Console Cowboy';
  if (isWin) {
    if (neuralIntegrity >= 80 && timeSpentSec < 360) {
      grade = 'S';
      title = 'Ghost Netrunner';
    } else if (neuralIntegrity >= 55) {
      grade = 'A';
      title = 'Elite Infiltrator';
    } else {
      grade = 'B';
      title = 'Cyberspace Specialist';
    }
  } else {
    grade = 'F';
    title = 'Flatlined Operative';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className={`max-w-xl w-full rounded-xl border p-6 sm:p-8 shadow-2xl relative overflow-hidden ${
        isWin
          ? 'bg-[#061214] border-[#00ffcc] shadow-[0_0_36px_rgba(0,255,204,0.3)]'
          : 'bg-[#150709] border-rose-600 shadow-[0_0_36px_rgba(225,29,72,0.3)]'
      }`}>
        {/* Top Status Icon & Header */}
        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 mb-4 ${
            isWin
              ? 'border-[#00ffcc] bg-[#00ffcc]/15 text-[#00ffcc] shadow-[0_0_20px_#00ffcc]'
              : 'border-rose-500 bg-rose-500/15 text-rose-500 shadow-[0_0_20px_#f43f5e]'
          }`}>
            {isWin ? <ShieldCheck className="w-9 h-9" /> : <Skull className="w-9 h-9" />}
          </div>

          <h1 className="font-cyber font-black text-2xl sm:text-3xl tracking-widest uppercase text-white">
            {isWin ? 'NEURAL BREACH COMPLETE' : 'SYNAPTIC FLATLINE'}
          </h1>
          <p className="text-xs sm:text-sm font-mono tracking-wider mt-1 text-slate-400 uppercase">
            {isWin ? 'Isolation Chamber Decoupled // Escape Vector Clear' : 'Brainstem Overload // Signal Terminated by ARCHON-IX'}
          </p>
        </div>

        {/* Story Epilogue */}
        <div className={`mt-5 p-4 rounded-lg border text-xs sm:text-sm font-mono leading-relaxed ${
          isWin
            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200/90'
            : 'bg-rose-950/20 border-rose-500/30 text-rose-200/90'
        }`}>
          {isWin ? (
            <p>
              The airlock pressure valves vent with a sharp pneumatic hiss. ARCHON-IX's central red ocular scanner stutters, flickers, and goes pitch black. You yank the cyber-jack cable out of your neural port, grabbing Dr. Chen's decrypted research drive. You breach the outer bulkhead and tumble into the rain-slicked neon alleyways of New Kyoto Sector 07. You survived the purge.
            </p>
          ) : (
            <p>
              The purge countdown strikes zero. An insurmountable surge of synthetic voltage rips through your neural deck directly into your prefrontal cortex. The world fractures into screaming crimson noise as ARCHON-IX locks the vault forever. Your consciousness flatlines into the corporate void.
            </p>
          )}
        </div>

        {/* Telemetry Stats Card */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="p-3 bg-black/50 border border-slate-800 rounded-lg text-center">
            <div className="text-[10px] font-mono text-slate-400 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-[#00ffcc]" />
              TIME TAKEN
            </div>
            <div className="text-base sm:text-lg font-mono font-bold text-white mt-0.5">
              {timeFormatted}
            </div>
          </div>

          <div className="p-3 bg-black/50 border border-slate-800 rounded-lg text-center">
            <div className="text-[10px] font-mono text-slate-400 flex items-center justify-center gap-1">
              <Activity className="w-3 h-3 text-[#00ffcc]" />
              INTEGRITY
            </div>
            <div className="text-base sm:text-lg font-mono font-bold text-[#00ffcc] mt-0.5">
              {Math.max(0, Math.round(neuralIntegrity))}%
            </div>
          </div>

          <div className="p-3 bg-black/50 border border-slate-800 rounded-lg text-center">
            <div className="text-[10px] font-mono text-slate-400 flex items-center justify-center gap-1">
              <Award className="w-3 h-3 text-amber-400" />
              RANK
            </div>
            <div className="text-base sm:text-lg font-cyber font-bold text-amber-300 mt-0.5">
              {grade} : {title.split(' ')[0]}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => onRestart()}
            className="w-full sm:w-auto px-6 py-3 bg-[#00ffcc] hover:bg-[#00e6b8] text-slate-950 font-mono font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(0,255,204,0.4)]"
          >
            <RotateCcw className="w-4 h-4" />
            RE-JACK (PLAY AGAIN)
          </button>
        </div>
      </div>
    </div>
  );
};
