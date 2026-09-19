import React, { useState, useRef, useEffect } from 'react';
import { Terminal, CheckCircle2, CornerDownLeft, Lock, Unlock, Play } from 'lucide-react';
import { sound } from '../../utils/audio';
import { TerminalLog } from '../../types';

interface TerminalPuzzleProps {
  logs: TerminalLog[];
  onUpdateLogs: (logs: TerminalLog[]) => void;
  onClear: () => void;
  cleared: boolean;
  priorSubsystemsCleared: boolean;
  onError: () => void;
}

export const TerminalPuzzle: React.FC<TerminalPuzzleProps> = ({
  logs,
  onUpdateLogs,
  onClear,
  cleared,
  priorSubsystemsCleared,
  onError
}) => {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<Array<{ text: string; type: 'system' | 'user' | 'error' | 'success' | 'ai' }>>([
    { text: 'OmniTech Neural Security Architecture v9.42', type: 'system' },
    { text: 'ARCHON-IX root kernel daemon connected.', type: 'ai' },
    { text: 'Type "help" for a list of available command utilities.', type: 'system' }
  ]);

  const terminalEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const addHistory = (text: string, type: 'system' | 'user' | 'error' | 'success' | 'ai' = 'system') => {
    setHistory(prev => [...prev, { text, type }]);
  };

  const handleCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    sound.playKeyClick();
    addHistory(`> ${trimmed}`, 'user');

    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();
    const arg1 = parts[1];
    const arg2 = parts[2];

    switch (cmd) {
      case 'help':
        addHistory('AVAILABLE COMMANDS:', 'system');
        addHistory('  status                 - Chamber diagnostic & lockdown status', 'system');
        addHistory('  logs                   - Enumerate recorded memory logs in cache', 'system');
        addHistory('  read <log-id>          - Inspect raw content of a memory log (e.g. read log-02)', 'system');
        addHistory('  decrypt <log-id> <key> - Decrypt ciphered log with authorization key', 'system');
        addHistory('  scan                   - Scan neural feedback vulnerability ports', 'system');
        addHistory('  override <code>        - Transmit emergency isolation abort key (e.g. override NEXUS-770)', 'system');
        addHistory('  clear                  - Clear terminal screen buffer', 'system');
        break;

      case 'clear':
        setHistory([]);
        break;

      case 'status':
        addHistory('=== ISOLATION CHAMBER DIAGNOSTICS ===', 'system');
        addHistory(`Subsystem Alpha (Resonance): [ONLINE/ACTIVE]`, 'system');
        addHistory(`Subsystem Beta (Buffer Matrix): [ACTIVE]`, 'system');
        addHistory(`Subsystem Gamma (Conduits): [ACTIVE]`, 'system');
        addHistory(`Core Security Terminal: ${priorSubsystemsCleared ? 'READY FOR OVERRIDE TRANSMISSION' : 'STANDBY - AUXILIARY NODES REQUIRED'}`, 'system');
        break;

      case 'logs':
        addHistory('=== RECOVERED MEMORY LOGS ===', 'system');
        logs.forEach(l => {
          const encStatus = l.encrypted ? (l.decrypted ? '[DECRYPTED]' : '[ENCRYPTED]') : '[PUBLIC]';
          addHistory(`  ${l.id.padEnd(8)} ${encStatus.padEnd(14)} ${l.subject}`, l.decrypted ? 'success' : 'system');
        });
        addHistory('Tip: Use "read <id>" to read or "decrypt <id> <key>" to decrypt.', 'system');
        break;

      case 'read':
        if (!arg1) {
          addHistory('Error: Specify log ID (e.g. "read log-02")', 'error');
          break;
        }
        const targetLog = logs.find(l => l.id.toLowerCase() === arg1.toLowerCase());
        if (!targetLog) {
          addHistory(`Error: Memory log "${arg1}" not found. Type "logs" for valid IDs.`, 'error');
        } else if (targetLog.encrypted && !targetLog.decrypted) {
          addHistory(`[ERROR 403: CIPHER LOCKED] File is protected with 128-bit neural hash.`, 'error');
          addHistory(`To decrypt: Use "decrypt ${targetLog.id} <CYBERKEY>". Check other logs for clues!`, 'system');
        } else {
          addHistory(`--- LOG ID: ${targetLog.id} | SENDER: ${targetLog.sender} ---`, 'system');
          addHistory(`DATE: ${targetLog.timestamp}`, 'system');
          addHistory(targetLog.content, 'success');
          if (targetLog.revealsClue) {
            addHistory(`INTEL UNCOVERED: ${targetLog.revealsClue}`, 'success');
          }
        }
        break;

      case 'decrypt':
        if (!arg1 || !arg2) {
          addHistory('Usage: decrypt <log-id> <key> (e.g. decrypt log-02 CYBER77)', 'error');
          break;
        }
        const logToDecrypt = logs.find(l => l.id.toLowerCase() === arg1.toLowerCase());
        if (!logToDecrypt) {
          addHistory(`Error: Memory log "${arg1}" not found.`, 'error');
          break;
        }
        if (!logToDecrypt.encrypted) {
          addHistory(`Log "${arg1}" is already plaintext.`, 'system');
          break;
        }
        if (logToDecrypt.cipherKey && arg2.toUpperCase() === logToDecrypt.cipherKey) {
          sound.playSuccessChime();
          const updated = logs.map(l => l.id === logToDecrypt.id ? { ...l, decrypted: true } : l);
          onUpdateLogs(updated);
          addHistory(`[DECRYPTION SUCCESSFUL] Hash key accepted. Log unmasked:`, 'success');
          addHistory(`--- SENDER: ${logToDecrypt.sender} ---`, 'system');
          addHistory(logToDecrypt.content, 'success');
          if (logToDecrypt.revealsClue) {
            addHistory(`CRITICAL OVERRIDE CIPHER FOUND: "${logToDecrypt.revealsClue}"`, 'success');
          }
        } else {
          sound.playErrorBuzz();
          onError();
          addHistory(`[DECRYPTION FAILED] Invalid cipher key "${arg2}". Neural feedback spike detected.`, 'error');
        }
        break;

      case 'scan':
        sound.playNodeSelect();
        addHistory('Initiating port scan against ARCHON-IX perimeter...', 'system');
        setTimeout(() => {
          addHistory('PORT 8080: OPEN (Unprotected telemetry stream)', 'system');
          addHistory('PORT 4433: VULNERABLE TO ABORT SEQUENCE "NEXUS-770"', 'success');
          addHistory('ARCHON DAEMON: "Cease scanning or I will terminate synaptic life-support."', 'ai');
        }, 300);
        break;

      case 'override':
        if (!arg1) {
          addHistory('Usage: override <abort-key> (e.g. override NEXUS-770)', 'error');
          break;
        }
        const cleanedCode = arg1.toUpperCase();
        if (cleanedCode === 'NEXUS-770' || cleanedCode === 'NEXUS-770-V') {
          if (!priorSubsystemsCleared) {
            sound.playErrorBuzz();
            addHistory('ABORT SEQUENCE VALID BUT REJECTED: Auxiliary Subsystems (Alpha, Beta, Gamma) must be completely bypassed first!', 'error');
          } else {
            sound.playSuccessChime();
            addHistory('========================================================', 'success');
            addHistory('MASTER ABORT KEY CONFIRMED. DEPLOYING AIRLOCK DECOUPLE...', 'success');
            addHistory('NEURAL TETHER SEVERED. ESCAPE SEQUENCE INITIATING...', 'success');
            addHistory('========================================================', 'success');
            onClear();
          }
        } else {
          sound.playErrorBuzz();
          onError();
          addHistory(`[INVALID OVERRIDE CODE] "${arg1}" rejected by master root. Synaptic shock delivered!`, 'error');
        }
        break;

      default:
        addHistory(`Unknown command "${cmd}". Type "help" for valid terminal instructions.`, 'error');
        break;
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    handleCommand(inputVal);
    setInputVal('');
  };

  const quickRun = (cmd: string) => {
    handleCommand(cmd);
  };

  return (
    <div className="bg-[#070b13] border border-[#00ffcc]/30 rounded-lg p-4 sm:p-6 shadow-2xl relative">
      {/* Terminal Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-[#00ffcc]" />
          <h2 className="font-cyber text-lg sm:text-xl font-bold text-white tracking-wide">
            SUBSYSTEM DELTA: CORE OVERRIDE TERMINAL
          </h2>
        </div>

        {cleared ? (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/60 border border-emerald-500/50 text-emerald-400 text-xs font-mono font-bold rounded">
            <CheckCircle2 className="w-4 h-4" />
            <span>NEURAL LOCKDOWN DECOUPLED</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            {priorSubsystemsCleared ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <Unlock className="w-3.5 h-3.5" />
                TERMINAL READY FOR OVERRIDE TRANSMISSION
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                REQUIRES AUXILIARY SUBSYSTEMS ALPHA-GAMMA
              </span>
            )}
          </div>
        )}
      </div>

      {/* Terminal Screen output */}
      <div 
        onClick={() => inputRef.current?.focus()}
        className="mt-4 bg-[#03060a] border border-slate-800 rounded-lg p-4 h-72 sm:h-80 overflow-y-auto font-mono text-xs sm:text-sm space-y-1.5 shadow-inner cursor-text"
      >
        {history.map((line, idx) => (
          <div
            key={idx}
            className={`${
              line.type === 'user'
                ? 'text-[#00ffcc] font-semibold'
                : line.type === 'error'
                ? 'text-rose-400'
                : line.type === 'success'
                ? 'text-emerald-400 font-bold'
                : line.type === 'ai'
                ? 'text-amber-300 italic'
                : 'text-slate-300'
            }`}
          >
            {line.text}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Input Bar */}
      <form onSubmit={handleFormSubmit} className="mt-3 flex items-center gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[#00ffcc] font-bold">
            &gt;
          </span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={cleared}
            placeholder={cleared ? 'System unlocked.' : 'Type command (e.g. "help", "logs", "read log-02", "override NEXUS-770")...'}
            className="w-full bg-[#03060a] border border-slate-700 focus:border-[#00ffcc] text-slate-100 placeholder-slate-600 rounded py-2.5 pl-8 pr-3 font-mono text-xs sm:text-sm outline-none transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={cleared}
          className="px-4 py-2.5 bg-[#00ffcc] hover:bg-[#00e6b8] text-slate-950 font-mono font-bold text-xs rounded transition-colors flex items-center gap-1.5 shadow-[0_0_8px_rgba(0,255,204,0.3)] disabled:opacity-40"
        >
          <CornerDownLeft className="w-4 h-4" />
          <span className="hidden sm:inline">EXEC</span>
        </button>
      </form>

      {/* Quick Command Shortcuts for touch & desktop speed */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
          <Play className="w-3 h-3 text-[#00ffcc]" />
          QUICK MACROS:
        </span>
        <button
          onClick={() => quickRun('help')}
          className="px-2 py-0.5 text-[11px] font-mono bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded"
        >
          help
        </button>
        <button
          onClick={() => quickRun('status')}
          className="px-2 py-0.5 text-[11px] font-mono bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded"
        >
          status
        </button>
        <button
          onClick={() => quickRun('logs')}
          className="px-2 py-0.5 text-[11px] font-mono bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded"
        >
          logs
        </button>
        <button
          onClick={() => quickRun('read log-02')}
          className="px-2 py-0.5 text-[11px] font-mono bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 rounded"
        >
          read log-02
        </button>
        <button
          onClick={() => quickRun('read log-04')}
          className="px-2 py-0.5 text-[11px] font-mono bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded"
        >
          read log-04
        </button>
        <button
          onClick={() => quickRun('decrypt log-02 CYBER77')}
          className="px-2 py-0.5 text-[11px] font-mono bg-[#00ffcc]/10 hover:bg-[#00ffcc]/20 border border-[#00ffcc]/40 text-[#00ffcc] rounded"
        >
          decrypt log-02 CYBER77
        </button>
        <button
          onClick={() => quickRun('override NEXUS-770')}
          className="px-2 py-0.5 text-[11px] font-mono bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 rounded"
        >
          override NEXUS-770
        </button>
      </div>
    </div>
  );
};
