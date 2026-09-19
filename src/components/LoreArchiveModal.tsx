import React, { useState } from 'react';
import { X, BookOpen, Lock, Unlock, FileText } from 'lucide-react';
import { TerminalLog } from '../types';

interface LoreArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: TerminalLog[];
}

export const LoreArchiveModal: React.FC<LoreArchiveModalProps> = ({
  isOpen,
  onClose,
  logs
}) => {
  const [selectedLogId, setSelectedLogId] = useState<string>(logs[0]?.id || '');

  if (!isOpen) return null;

  const currentLog = logs.find(l => l.id === selectedLogId) || logs[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0b101e] border border-[#00ffcc]/30 rounded-xl max-w-2xl w-full p-5 sm:p-6 shadow-[0_0_28px_rgba(0,255,204,0.18)] flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 text-white font-cyber font-bold tracking-wider">
            <BookOpen className="w-5 h-5 text-[#00ffcc]" />
            <span>OMNITECH BLACK-SITE ARCHIVES // SECTOR 07</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-4 flex-1 overflow-hidden min-h-0">
          {/* Left log files sidebar */}
          <div className="sm:col-span-5 border border-slate-800 rounded-lg bg-slate-950/60 p-2 overflow-y-auto space-y-1.5">
            <div className="text-[10px] font-mono text-slate-500 uppercase px-2 py-1 font-bold">
              CACHED MEMORY RECORDS
            </div>
            {logs.map((log) => {
              const isSelected = log.id === currentLog?.id;
              return (
                <button
                  key={log.id}
                  onClick={() => setSelectedLogId(log.id)}
                  className={`w-full text-left p-2 rounded text-xs font-mono transition-all border ${
                    isSelected
                      ? 'border-[#00ffcc]/60 bg-[#00ffcc]/10 text-white'
                      : 'border-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#00ffcc]" />
                      {log.id}
                    </span>
                    {log.encrypted ? (
                      log.decrypted ? (
                        <Unlock className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Lock className="w-3 h-3 text-rose-400" />
                      )
                    ) : (
                      <span className="text-[9px] text-slate-500">[MEMO]</span>
                    )}
                  </div>
                  <div className="text-[11px] truncate text-slate-300 mt-0.5">
                    {log.subject}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right log view */}
          <div className="sm:col-span-7 border border-slate-800 rounded-lg bg-[#070b13] p-4 flex flex-col justify-between overflow-y-auto">
            {currentLog ? (
              <div className="space-y-3 font-mono text-xs">
                <div className="border-b border-slate-800 pb-2">
                  <div className="text-[11px] text-slate-500">TIMESTAMP: {currentLog.timestamp}</div>
                  <div className="text-[11px] text-[#00ffcc]">FROM: {currentLog.sender}</div>
                  <div className="text-sm font-bold text-white mt-1">{currentLog.subject}</div>
                </div>

                {currentLog.encrypted && !currentLog.decrypted ? (
                  <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded text-rose-300 text-center space-y-2">
                    <Lock className="w-6 h-6 text-rose-400 mx-auto animate-pulse" />
                    <div className="font-bold uppercase tracking-wider">
                      [ENCRYPTED NEURAL MEMORY SECTOR]
                    </div>
                    <p className="text-[11px] text-rose-400/80">
                      Decrypt this file in Subsystem Delta's terminal using command:
                      <code className="block mt-1 bg-black/60 p-1.5 rounded text-[#00ffcc]">
                        decrypt {currentLog.id} {currentLog.cipherKey || 'CYBER77'}
                      </code>
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-900/40 rounded border border-slate-800/80 text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {currentLog.content}
                  </div>
                )}

                {currentLog.revealsClue && (
                  <div className="p-2.5 bg-emerald-950/30 border border-emerald-500/40 rounded text-emerald-300 text-xs font-bold flex items-center gap-2">
                    <Unlock className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>EXTRACTED OVERRIDE KEY: {currentLog.revealsClue}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-slate-500 text-xs font-mono flex items-center justify-center h-full">
                Select a memory log on the left.
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs rounded transition-colors"
          >
            CLOSE ARCHIVES
          </button>
        </div>
      </div>
    </div>
  );
};
