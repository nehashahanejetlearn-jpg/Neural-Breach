import React from 'react';
import { Volume2, VolumeX, Monitor, HelpCircle, BookOpen } from 'lucide-react';
import { sound } from '../utils/audio';

interface AudioSettingsProps {
  isMuted: boolean;
  onToggleMute: () => void;
  showScanlines: boolean;
  onToggleScanlines: () => void;
  onOpenHints: () => void;
  onOpenLore: () => void;
}

export const AudioSettings: React.FC<AudioSettingsProps> = ({
  isMuted,
  onToggleMute,
  showScanlines,
  onToggleScanlines,
  onOpenHints,
  onOpenLore
}) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onToggleMute}
        className={`p-2 rounded border transition-colors flex items-center justify-center ${
          isMuted
            ? 'border-slate-800 bg-slate-900/60 text-slate-500 hover:text-slate-300'
            : 'border-[#00ffcc]/40 bg-[#00ffcc]/10 text-[#00ffcc]'
        }`}
        title={isMuted ? 'Unmute Audio Synthesizer' : 'Mute Audio Synthesizer'}
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>

      <button
        onClick={onToggleScanlines}
        className={`p-2 rounded border transition-colors flex items-center justify-center ${
          showScanlines
            ? 'border-[#00ffcc]/40 bg-[#00ffcc]/10 text-[#00ffcc]'
            : 'border-slate-800 bg-slate-900/60 text-slate-500 hover:text-slate-300'
        }`}
        title="Toggle CRT Scanline Overlay"
      >
        <Monitor className="w-4 h-4" />
      </button>

      <button
        onClick={onOpenHints}
        className="px-2.5 py-1.5 rounded border border-slate-800 hover:border-[#00ffcc]/50 bg-slate-900/80 hover:bg-slate-800 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
        title="Tactical Intel & Drone Hints"
      >
        <HelpCircle className="w-3.5 h-3.5 text-[#00ffcc]" />
        <span className="hidden sm:inline">INTEL</span>
      </button>

      <button
        onClick={onOpenLore}
        className="px-2.5 py-1.5 rounded border border-slate-800 hover:border-[#00ffcc]/50 bg-slate-900/80 hover:bg-slate-800 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
        title="Corporate Black-site Data Memos"
      >
        <BookOpen className="w-3.5 h-3.5 text-amber-400" />
        <span className="hidden sm:inline">ARCHIVES</span>
      </button>
    </div>
  );
};
