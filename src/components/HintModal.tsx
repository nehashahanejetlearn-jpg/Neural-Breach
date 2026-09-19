import React from 'react';
import { X, HelpCircle, Lightbulb, ShieldAlert } from 'lucide-react';
import { SubsystemId } from '../types';
import { SUBSYSTEM_HINTS } from '../data/story';

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSubsystem: SubsystemId;
}

export const HintModal: React.FC<HintModalProps> = ({
  isOpen,
  onClose,
  currentSubsystem
}) => {
  if (!isOpen) return null;

  const hints = SUBSYSTEM_HINTS[currentSubsystem] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0b101e] border border-[#00ffcc]/40 rounded-xl max-w-lg w-full p-5 sm:p-6 shadow-[0_0_24px_rgba(0,255,204,0.15)] relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-cyber font-bold tracking-wider">
            <HelpCircle className="w-5 h-5 text-[#00ffcc]" />
            <span>NEURAL DECK INTEL & PROTOCOLS</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
            <div className="flex items-center gap-1.5 text-xs font-mono text-amber-300 font-bold uppercase tracking-wider mb-1">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              Tactical Analysis: Subsystem {currentSubsystem.toUpperCase()}
            </div>
            <ul className="space-y-2 mt-2">
              {hints.map((hint, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs font-mono text-slate-300">
                  <span className="text-[#00ffcc] font-bold">[{idx + 1}]</span>
                  <span>{hint}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-lg flex items-start gap-2.5 text-xs font-mono text-red-300/90">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-red-400">COUNTERMEASURE WARNING:</span> Each incorrect override attempt or buffer overflow drains your neural synaptic integrity.
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#00ffcc] hover:bg-[#00e6b8] text-slate-950 font-mono font-bold text-xs rounded uppercase tracking-wider transition-colors"
          >
            ACKNOWLEDGE & RETURN
          </button>
        </div>
      </div>
    </div>
  );
};
