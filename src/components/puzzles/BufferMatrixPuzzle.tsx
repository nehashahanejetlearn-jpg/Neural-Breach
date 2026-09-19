import React, { useState, useEffect } from 'react';
import { Grid, CheckCircle2, RotateCcw, ShieldCheck, CornerDownRight } from 'lucide-react';
import { sound } from '../../utils/audio';

interface BufferMatrixPuzzleProps {
  onClear: () => void;
  cleared: boolean;
  onError: () => void;
}

const MATRIX_SIZE = 5;
const HEX_VALUES = ['1C', 'BD', 'E9', '55', '7A'];

// Pre-seeded solvable layout so every game has a clear strategic path
const DEFAULT_GRID = [
  ['1C', '55', 'BD', '7A', 'E9'],
  ['E9', '7A', '1C', 'BD', '55'],
  ['BD', 'E9', '7A', '55', '1C'],
  ['55', 'BD', 'E9', '1C', '7A'],
  ['7A', '1C', '55', 'E9', 'BD']
];

const TARGET_SEQUENCE = ['1C', '7A', '55', 'BD'];
const MAX_BUFFER = 6;

export const BufferMatrixPuzzle: React.FC<BufferMatrixPuzzleProps> = ({
  onClear,
  cleared,
  onError
}) => {
  const [grid] = useState<string[][]>(DEFAULT_GRID);
  const [buffer, setBuffer] = useState<string[]>([]);
  const [selectedCoords, setSelectedCoords] = useState<{ r: number; c: number }[]>([]);
  
  // Alternating axis: 'row' means player must select from currentRow; 'col' means from currentCol
  const [currentAxis, setCurrentAxis] = useState<'row' | 'col'>('row');
  const [activeRow, setActiveRow] = useState<number>(0);
  const [activeCol, setActiveCol] = useState<number | null>(null);

  // Check if target sequence is present in buffer in order
  const checkSequenceMatch = (buf: string[]): boolean => {
    if (buf.length < TARGET_SEQUENCE.length) return false;
    
    // Check if target sequence exists as a contiguous substring in buffer
    for (let i = 0; i <= buf.length - TARGET_SEQUENCE.length; i++) {
      let match = true;
      for (let j = 0; j < TARGET_SEQUENCE.length; j++) {
        if (buf[i + j] !== TARGET_SEQUENCE[j]) {
          match = false;
          break;
        }
      }
      if (match) return true;
    }
    return false;
  };

  const handleCellClick = (r: number, c: number) => {
    if (cleared) return;

    // Validate valid pick based on current active row/col
    if (currentAxis === 'row' && r !== activeRow) {
      sound.playErrorBuzz();
      return;
    }
    if (currentAxis === 'col' && c !== activeCol) {
      sound.playErrorBuzz();
      return;
    }

    // Check if already selected
    const alreadyPicked = selectedCoords.some(coord => coord.r === r && coord.c === c);
    if (alreadyPicked) {
      sound.playErrorBuzz();
      return;
    }

    const value = grid[r][c];
    sound.playNodeSelect();

    const newBuffer = [...buffer, value];
    const newCoords = [...selectedCoords, { r, c }];

    setBuffer(newBuffer);
    setSelectedCoords(newCoords);

    // Switch axis: if row -> now col (at col c). If col -> now row (at row r).
    if (currentAxis === 'row') {
      setCurrentAxis('col');
      setActiveCol(c);
    } else {
      setCurrentAxis('row');
      setActiveRow(r);
    }

    // Check victory
    if (checkSequenceMatch(newBuffer)) {
      sound.playSuccessChime();
      onClear();
      return;
    }

    // Check if buffer is full without matching
    if (newBuffer.length >= MAX_BUFFER) {
      sound.playErrorBuzz();
      onError();
      // Auto-reset buffer to allow retry
      setTimeout(() => {
        handleReset();
      }, 1000);
    }
  };

  const handleReset = () => {
    sound.playKeyClick();
    setBuffer([]);
    setSelectedCoords([]);
    setCurrentAxis('row');
    setActiveRow(0);
    setActiveCol(null);
  };

  return (
    <div className="bg-[#0b101d]/90 border border-[#00ffcc]/20 rounded-lg p-4 sm:p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Grid className="w-5 h-5 text-[#00ffcc]" />
            <h2 className="font-cyber text-lg sm:text-xl font-bold text-white tracking-wide">
              SUBSYSTEM BETA: QUANTUM BUFFER MATRIX
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Alternate row and column hops to input the target breach daemon into the corporate buffer.
          </p>
        </div>

        {cleared ? (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/60 border border-emerald-500/50 text-emerald-400 text-xs font-mono font-bold rounded">
            <CheckCircle2 className="w-4 h-4" />
            <span>BUFFER ACCESS GRANTED</span>
          </div>
        ) : (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-white bg-slate-800 px-2.5 py-1 rounded border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Buffer
          </button>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 5x5 Hex Matrix Grid */}
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2 px-1">
            <span className="flex items-center gap-1 text-[#00ffcc]">
              <CornerDownRight className="w-3.5 h-3.5" />
              ACTIVE HOP: {currentAxis.toUpperCase()} {currentAxis === 'row' ? activeRow + 1 : (activeCol ?? 0) + 1}
            </span>
            <span>MEMORY RANGE: 0x00F - 0x7FA</span>
          </div>

          <div className="bg-[#060a12] border border-slate-800 p-3 sm:p-4 rounded-lg inline-block w-full">
            <div className="grid grid-cols-5 gap-2 sm:gap-2.5 max-w-md mx-auto">
              {grid.map((row, rIdx) =>
                row.map((val, cIdx) => {
                  const isSelected = selectedCoords.some(c => c.r === rIdx && c.c === cIdx);
                  const isEligible = !cleared && !isSelected && (
                    (currentAxis === 'row' && rIdx === activeRow) ||
                    (currentAxis === 'col' && cIdx === activeCol)
                  );
                  const isCurrentPivot = selectedCoords.length > 0 &&
                    selectedCoords[selectedCoords.length - 1].r === rIdx &&
                    selectedCoords[selectedCoords.length - 1].c === cIdx;

                  return (
                    <button
                      key={`${rIdx}-${cIdx}`}
                      onClick={() => handleCellClick(rIdx, cIdx)}
                      disabled={cleared || isSelected || !isEligible}
                      className={`h-11 sm:h-13 rounded font-mono text-sm sm:text-base font-bold transition-all relative flex items-center justify-center border ${
                        isSelected
                          ? 'border-slate-800 bg-slate-900/40 text-slate-600 cursor-not-allowed'
                          : isCurrentPivot
                          ? 'border-[#00ffcc] bg-[#00ffcc]/20 text-[#00ffcc] shadow-[0_0_12px_#00ffcc]'
                          : isEligible
                          ? 'border-[#00ffcc]/60 bg-[#00ffcc]/10 text-white hover:bg-[#00ffcc]/30 hover:border-[#00ffcc] hover:scale-105 shadow-[0_0_8px_rgba(0,255,204,0.2)]'
                          : 'border-slate-800/60 bg-slate-950/50 text-slate-500 opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <span>{val}</span>
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center text-[9px] text-slate-600 bg-black/40">
                          [USED]
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right: Target Sequence & Buffer Slots */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Target Payload sequence */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-2">
              <span className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#00ffcc]" />
                TARGET EXPLOIT SEQUENCE
              </span>
              <span className="text-slate-500 text-[11px]">ORDER CRITICAL</span>
            </div>

            <div className="flex items-center gap-2 p-2.5 bg-black/40 border border-slate-800 rounded">
              {TARGET_SEQUENCE.map((byte, idx) => (
                <div
                  key={idx}
                  className="flex-1 py-2 text-center font-mono font-bold text-sm rounded bg-[#00ffcc]/10 border border-[#00ffcc]/40 text-[#00ffcc] shadow-[0_0_6px_rgba(0,255,204,0.2)]"
                >
                  {byte}
                </div>
              ))}
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-2">
              Inject these 4 tokens into the buffer memory array in consecutive sequence.
            </p>
          </div>

          {/* Current Buffer Slots */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-2">
              <span>CYBERDECK BUFFER MEMORY</span>
              <span className="text-[11px] text-slate-400">
                {buffer.length} / {MAX_BUFFER} SLOTS
              </span>
            </div>

            <div className="grid grid-cols-6 gap-1.5">
              {Array.from({ length: MAX_BUFFER }).map((_, idx) => {
                const filledVal = buffer[idx];
                return (
                  <div
                    key={idx}
                    className={`h-11 rounded border flex items-center justify-center font-mono text-xs font-bold transition-all ${
                      filledVal
                        ? 'border-[#00ffcc] bg-[#00ffcc]/15 text-[#00ffcc]'
                        : 'border-dashed border-slate-800 bg-slate-950/40 text-slate-700'
                    }`}
                  >
                    {filledVal || '--'}
                  </div>
                );
              })}
            </div>

            {buffer.length >= MAX_BUFFER && !cleared && (
              <div className="mt-2 text-xs font-mono text-rose-400">
                Buffer capacity exceeded without matching target. Resetting buffer...
              </div>
            )}
          </div>

          {/* Rules / Hint */}
          <div className="p-3 bg-blue-950/20 border border-blue-500/20 rounded text-[11px] font-mono text-blue-300/80 space-y-1">
            <div className="font-bold text-blue-200">BUFFER INJECTION PROTOCOL:</div>
            <div>1. First token chosen from row 1.</div>
            <div>2. Subsequent token must share column of previous choice.</div>
            <div>3. Following token must share row of previous choice.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
