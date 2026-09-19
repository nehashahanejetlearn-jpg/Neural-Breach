import React, { useState, useEffect, useCallback } from 'react';
import {
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Monitor,
  HelpCircle,
  BookOpen,
  Terminal,
  Shield,
  Zap,
  Activity,
  Grid,
  Cpu,
  Radio,
  Sparkles
} from 'lucide-react';
import { GamePhase, SubsystemId, SubsystemStatus, TerminalLog, DifficultySetting } from './types';
import {
  INITIAL_SUBSYSTEMS,
  INITIAL_LOGS,
  ARCHON_DIALOGUES,
  DIFFICULTIES
} from './data/story';
import { sound } from './utils/audio';
import { CyberHUD } from './components/CyberHUD';
import { ChamberOverview } from './components/ChamberOverview';
import { FrequencyPuzzle } from './components/puzzles/FrequencyPuzzle';
import { BufferMatrixPuzzle } from './components/puzzles/BufferMatrixPuzzle';
import { CircuitBypassPuzzle } from './components/puzzles/CircuitBypassPuzzle';
import { TerminalPuzzle } from './components/puzzles/TerminalPuzzle';
import { HintModal } from './components/HintModal';
import { LoreArchiveModal } from './components/LoreArchiveModal';
import { EscapeSequenceModal } from './components/EscapeSequenceModal';

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [difficulty, setDifficulty] = useState<DifficultySetting>(DIFFICULTIES[1]);
  const [timeLeft, setTimeLeft] = useState<number>(DIFFICULTIES[1].timeLimitSec);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [neuralIntegrity, setNeuralIntegrity] = useState<number>(100);

  const [subsystems, setSubsystems] = useState<SubsystemStatus[]>(INITIAL_SUBSYSTEMS);
  const [currentSubsystem, setCurrentSubsystem] = useState<SubsystemId>('frequency');
  const [logs, setLogs] = useState<TerminalLog[]>(INITIAL_LOGS);

  const [aiDialogue, setAiDialogue] = useState<string>(
    'Intruder detected in Sector 07 isolation vault. Neural purge cycle initialized.'
  );
  const [threatLevel, setThreatLevel] = useState<'nominal' | 'elevated' | 'critical'>('nominal');

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showScanlines, setShowScanlines] = useState<boolean>(true);
  const [showHints, setShowHints] = useState<boolean>(false);
  const [showLore, setShowLore] = useState<boolean>(false);

  // Trigger ARCHON-IX dynamic reaction
  const triggerAIDialogue = useCallback((condition: 'first_clear' | 'halfway' | 'three_clears' | 'time_warning' | 'error' | 'success') => {
    const found = ARCHON_DIALOGUES.find(d => d.triggerCondition === condition);
    if (found) {
      setAiDialogue(found.text);
      setThreatLevel(found.threatLevel);
    }
  }, []);

  // Main countdown timer loop
  useEffect(() => {
    if (phase !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setPhase('flatlined');
          sound.playAlertAlarm();
          return 0;
        }
        if (prev === 60) {
          triggerAIDialogue('time_warning');
          sound.playAlertAlarm();
        }
        return prev - 1;
      });

      setTimeSpent(prev => prev + 1);

      // Slow passive integrity drain based on difficulty
      setNeuralIntegrity(prev => {
        const drain = (0.05 * difficulty.integrityDrainRate);
        const next = prev - drain;
        if (next <= 0) {
          setPhase('flatlined');
          sound.playAlertAlarm();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, difficulty, triggerAIDialogue]);

  // Start game session
  const handleStartGame = (chosenDiff?: DifficultySetting) => {
    const diff = chosenDiff || difficulty;
    setDifficulty(diff);
    setTimeLeft(diff.timeLimitSec);
    setTimeSpent(0);
    setNeuralIntegrity(100);
    setSubsystems(INITIAL_SUBSYSTEMS);
    setLogs(INITIAL_LOGS);
    setCurrentSubsystem('frequency');
    setPhase('playing');
    setAiDialogue(ARCHON_DIALOGUES[0].text);
    setThreatLevel('nominal');
    sound.startNeuralHum();
    sound.playSuccessChime();
  };

  // Puzzle error penalty
  const handlePuzzleError = () => {
    setNeuralIntegrity(prev => {
      const penalty = 7 * difficulty.integrityDrainRate;
      const next = Math.max(0, prev - penalty);
      if (next <= 0) {
        setPhase('flatlined');
        sound.playAlertAlarm();
      }
      return next;
    });
    triggerAIDialogue('error');
  };

  // Clear a subsystem puzzle
  const handleSubsystemClear = (id: SubsystemId) => {
    const updated = subsystems.map(s => (s.id === id ? { ...s, cleared: true } : s));
    setSubsystems(updated);

    const clearedCount = updated.filter(s => s.cleared).length;

    // Small integrity recovery burst on successful breach
    setNeuralIntegrity(prev => Math.min(100, prev + 12));

    if (id === 'terminal') {
      // Game victory!
      setPhase('breached');
      triggerAIDialogue('success');
      sound.stopNeuralHum();
      return;
    }

    if (clearedCount === 1) {
      triggerAIDialogue('first_clear');
      setCurrentSubsystem('matrix');
    } else if (clearedCount === 2) {
      triggerAIDialogue('halfway');
      setCurrentSubsystem('circuit');
    } else if (clearedCount === 3) {
      triggerAIDialogue('three_clears');
      setCurrentSubsystem('terminal');
    }
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
  };

  // Calculate if nodes Alpha, Beta, Gamma are cleared
  const priorSubsystemsCleared = subsystems
    .filter(s => s.id !== 'terminal')
    .every(s => s.cleared);

  return (
    <div className="min-h-screen bg-[#05070d] text-slate-100 flex flex-col relative selection:bg-[#00ffcc] selection:text-black">
      {/* Optional CRT Scanlines Effect */}
      {showScanlines && (
        <div className="scanline-overlay fixed inset-0 z-50 pointer-events-none" />
      )}

      {/* INTRO SCREEN */}
      {phase === 'intro' && (
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative cyber-grid">
          <div className="max-w-2xl w-full bg-[#0a0f1d]/95 border-2 border-[#00ffcc]/30 rounded-2xl p-6 sm:p-10 shadow-[0_0_40px_rgba(0,255,204,0.15)] relative overflow-hidden">
            {/* Header / Brand */}
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ffcc]/10 border border-[#00ffcc]/30 text-[#00ffcc] text-xs font-mono mb-4">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>SECTOR 07 BLACK-SITE // CLASSIFIED INTRUSION</span>
              </div>

              <h1 className="font-cyber font-black text-3xl sm:text-5xl tracking-widest text-white uppercase">
                NEURAL <span className="text-[#00ffcc]">BREACH</span>
              </h1>
              <p className="font-mono text-xs sm:text-sm text-slate-400 mt-2 max-w-lg">
                An escape room protocol set in a neon-drenched dystopia. Outsmart the corporate rogue AI before your mind flatlines.
              </p>
            </div>

            {/* Narrative Briefing */}
            <div className="mt-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm font-mono text-slate-300 space-y-2 leading-relaxed">
              <div className="text-amber-300 font-bold flex items-center gap-1.5 uppercase">
                <Sparkles className="w-4 h-4 text-amber-400" />
                MISSION BRIEFING:
              </div>
              <p>
                You are <strong className="text-white">Zero-K</strong>, a rogue cyber-infiltrator. While jacked into OmniTech Corporation's clandestine neural laboratory, <strong className="text-rose-400">ARCHON-IX</strong> initiated a lockdown isolation protocol.
              </p>
              <p>
                The containment unit is purging synaptic life-support. You must breach and align the <strong className="text-[#00ffcc]">4 physical containment nodes</strong> in the chamber to trigger the airlock decoupled escape.
              </p>
            </div>

            {/* Difficulty Selection */}
            <div className="mt-6 space-y-2">
              <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                SELECT OPERATION PROTOCOL:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {DIFFICULTIES.map(diff => {
                  const isSelected = difficulty.id === diff.id;
                  return (
                    <button
                      key={diff.id}
                      onClick={() => {
                        setDifficulty(diff);
                        sound.playKeyClick();
                      }}
                      className={`p-3 rounded-lg border text-left transition-all font-mono ${
                        isSelected
                          ? 'border-[#00ffcc] bg-[#00ffcc]/15 text-white shadow-[0_0_12px_rgba(0,255,204,0.2)]'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span>{diff.name}</span>
                        <span className="text-[10px] text-[#00ffcc]">{Math.round(diff.timeLimitSec / 60)}m</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                        {diff.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Launch Action */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <button
                  onClick={toggleMute}
                  className="p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300"
                  title="Toggle Audio"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#00ffcc]" />}
                </button>
                <button
                  onClick={() => setShowScanlines(!showScanlines)}
                  className="p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300"
                  title="Toggle Scanlines"
                >
                  <Monitor className="w-4 h-4 text-[#00ffcc]" />
                </button>
                <span className="text-[11px]">Audio & CRT Effects Ready</span>
              </div>

              <button
                onClick={() => handleStartGame()}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#00ffcc] hover:bg-[#00e6b8] text-slate-950 font-cyber font-bold text-sm tracking-widest uppercase rounded-lg shadow-[0_0_20px_rgba(0,255,204,0.4)] transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                JACK IN & COMMENCE BREACH
              </button>
            </div>
          </div>
        </main>
      )}

      {/* ACTIVE GAMEPLAY SCREEN */}
      {phase === 'playing' && (
        <div className="flex-1 flex flex-col pb-8">
          <CyberHUD
            timeLeft={timeLeft}
            neuralIntegrity={neuralIntegrity}
            subsystems={subsystems}
            currentSubsystem={currentSubsystem}
            onSelectSubsystem={(id) => {
              sound.playKeyClick();
              setCurrentSubsystem(id);
            }}
            aiDialogue={aiDialogue}
            threatLevel={threatLevel}
            onOpenHints={() => setShowHints(true)}
            onOpenLore={() => setShowLore(true)}
          />

          <main className="max-w-7xl w-full mx-auto px-3 sm:px-6 pt-4 flex-1">
            {/* Interactive Chamber Map / Node Selector */}
            <ChamberOverview
              subsystems={subsystems}
              currentSubsystem={currentSubsystem}
              onSelectSubsystem={(id) => {
                sound.playKeyClick();
                setCurrentSubsystem(id);
              }}
            />

            {/* Active Puzzle Console View */}
            <div className="transition-all duration-300">
              {currentSubsystem === 'frequency' && (
                <FrequencyPuzzle
                  cleared={subsystems.find(s => s.id === 'frequency')?.cleared || false}
                  onClear={() => handleSubsystemClear('frequency')}
                  onError={handlePuzzleError}
                />
              )}

              {currentSubsystem === 'matrix' && (
                <BufferMatrixPuzzle
                  cleared={subsystems.find(s => s.id === 'matrix')?.cleared || false}
                  onClear={() => handleSubsystemClear('matrix')}
                  onError={handlePuzzleError}
                />
              )}

              {currentSubsystem === 'circuit' && (
                <CircuitBypassPuzzle
                  cleared={subsystems.find(s => s.id === 'circuit')?.cleared || false}
                  onClear={() => handleSubsystemClear('circuit')}
                  onError={handlePuzzleError}
                />
              )}

              {currentSubsystem === 'terminal' && (
                <TerminalPuzzle
                  logs={logs}
                  onUpdateLogs={setLogs}
                  cleared={subsystems.find(s => s.id === 'terminal')?.cleared || false}
                  priorSubsystemsCleared={priorSubsystemsCleared}
                  onClear={() => handleSubsystemClear('terminal')}
                  onError={handlePuzzleError}
                />
              )}
            </div>
          </main>

          {/* Bottom quick utility bar */}
          <footer className="max-w-7xl w-full mx-auto px-3 sm:px-6 pt-6 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-500 border-t border-slate-800/80 mt-6">
            <div className="flex items-center gap-4">
              <span>PROTOCOL: {difficulty.name.toUpperCase()}</span>
              <span>TIME SPENT: {Math.floor(timeSpent / 60)}m {timeSpent % 60}s</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleMute}
                className="hover:text-white flex items-center gap-1 transition-colors"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#00ffcc]" />}
                <span>{isMuted ? 'Muted' : 'Sound ON'}</span>
              </button>
              <button
                onClick={() => setShowScanlines(!showScanlines)}
                className="hover:text-white flex items-center gap-1 transition-colors"
              >
                <Monitor className="w-3.5 h-3.5 text-[#00ffcc]" />
                <span>CRT: {showScanlines ? 'ON' : 'OFF'}</span>
              </button>
              <button
                onClick={() => handleStartGame()}
                className="hover:text-rose-400 flex items-center gap-1 transition-colors ml-2"
                title="Abort & Restart Session"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Abort / Reset</span>
              </button>
            </div>
          </footer>
        </div>
      )}

      {/* INTEL & HINT MODAL */}
      <HintModal
        isOpen={showHints}
        onClose={() => setShowHints(false)}
        currentSubsystem={currentSubsystem}
      />

      {/* DATA LOGS ARCHIVE MODAL */}
      <LoreArchiveModal
        isOpen={showLore}
        onClose={() => setShowLore(false)}
        logs={logs}
      />

      {/* ESCAPE / FLATLINE OUTCOME MODAL */}
      <EscapeSequenceModal
        phase={phase}
        timeSpentSec={timeSpent}
        neuralIntegrity={neuralIntegrity}
        difficulty={difficulty}
        onRestart={(newDiff) => handleStartGame(newDiff)}
      />
    </div>
  );
}
