import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle2, RotateCw, Zap, AlertOctagon, RotateCcw } from 'lucide-react';
import { sound } from '../../utils/audio';

interface CircuitBypassPuzzleProps {
  onClear: () => void;
  cleared: boolean;
  onError: () => void;
}

// Connections in directions: [Top, Right, Bottom, Left]
type TileType = 'straight' | 'corner' | 'tee' | 'cross' | 'source' | 'target' | 'null';

interface TileData {
  r: number;
  c: number;
  type: TileType;
  rotation: number; // 0, 90, 180, 270 degrees
  targetId?: string;
  isSource?: boolean;
}

// Initial setup of 4x4 circuit board
// Center (1, 1) and (1, 2) can connect, with 3 target relays on edges
const INITIAL_TILES: TileData[] = [
  // Row 0
  { r: 0, c: 0, type: 'corner', rotation: 90 },
  { r: 0, c: 1, type: 'target', rotation: 180, targetId: 'RELAY-A' }, // Top target
  { r: 0, c: 2, type: 'straight', rotation: 90 },
  { r: 0, c: 3, type: 'corner', rotation: 180 },

  // Row 1
  { r: 1, c: 0, type: 'straight', rotation: 0 },
  { r: 1, c: 1, type: 'source', rotation: 0, isSource: true }, // Central Reactor
  { r: 1, c: 2, type: 'tee', rotation: 270 },
  { r: 1, c: 3, type: 'target', rotation: 270, targetId: 'RELAY-B' }, // Right target

  // Row 2
  { r: 2, c: 0, type: 'tee', rotation: 90 },
  { r: 2, c: 1, type: 'straight', rotation: 90 },
  { r: 2, c: 2, type: 'corner', rotation: 0 },
  { r: 2, c: 3, type: 'null', rotation: 0 },

  // Row 3
  { r: 3, c: 0, type: 'target', rotation: 0, targetId: 'RELAY-C' }, // Bottom-left target
  { r: 3, c: 1, type: 'corner', rotation: 270 },
  { r: 3, c: 2, type: 'straight', rotation: 0 },
  { r: 3, c: 3, type: 'corner', rotation: 90 }
];

export const CircuitBypassPuzzle: React.FC<CircuitBypassPuzzleProps> = ({
  onClear,
  cleared,
  onError
}) => {
  const [tiles, setTiles] = useState<TileData[]>(INITIAL_TILES);
  const [poweredCoords, setPoweredCoords] = useState<Set<string>>(new Set());
  const [poweredTargets, setPoweredTargets] = useState<Set<string>>(new Set());

  // Helper to determine active connection directions [top, right, bottom, left]
  const getConnections = (type: TileType, rotation: number): boolean[] => {
    let base: boolean[] = [false, false, false, false];
    switch (type) {
      case 'straight':
        base = [true, false, true, false];
        break;
      case 'corner':
        base = [true, true, false, false]; // top & right
        break;
      case 'tee':
        base = [true, true, false, true]; // top, right, left
        break;
      case 'cross':
      case 'source':
        base = [true, true, true, true];
        break;
      case 'target':
        base = [true, false, false, false]; // accepts connection from top of its local frame
        break;
      case 'null':
        base = [false, false, false, false];
        break;
    }

    const steps = (rotation / 90) % 4;
    const rotated: boolean[] = [false, false, false, false];
    for (let i = 0; i < 4; i++) {
      rotated[(i + steps) % 4] = base[i];
    }
    return rotated;
  };

  // Re-calculate power flow via BFS whenever tile orientations change
  useEffect(() => {
    const grid: Record<string, TileData> = {};
    tiles.forEach(t => {
      grid[`${t.r},${t.c}`] = t;
    });

    const powered = new Set<string>();
    const targets = new Set<string>();
    const queue: [number, number][] = [];

    // Find source
    const sourceTile = tiles.find(t => t.isSource);
    if (sourceTile) {
      queue.push([sourceTile.r, sourceTile.c]);
      powered.add(`${sourceTile.r},${sourceTile.c}`);
    }

    // Direction offsets: top (0), right (1), bottom (2), left (3)
    const dr = [-1, 0, 1, 0];
    const dc = [0, 1, 0, -1];
    const oppositeDir = [2, 3, 0, 1];

    while (queue.length > 0) {
      const [currR, currC] = queue.shift()!;
      const currTile = grid[`${currR},${currC}`];
      if (!currTile) continue;

      const currConns = getConnections(currTile.type, currTile.rotation);

      for (let dir = 0; dir < 4; dir++) {
        if (!currConns[dir]) continue;

        const nextR = currR + dr[dir];
        const nextC = currC + dc[dir];
        const key = `${nextR},${nextC}`;

        if (nextR >= 0 && nextR < 4 && nextC >= 0 && nextC < 4 && !powered.has(key)) {
          const nextTile = grid[key];
          if (!nextTile || nextTile.type === 'null') continue;

          const nextConns = getConnections(nextTile.type, nextTile.rotation);
          // Check if opposite direction connects back
          if (nextConns[oppositeDir[dir]]) {
            powered.add(key);
            queue.push([nextR, nextC]);
            if (nextTile.type === 'target' && nextTile.targetId) {
              targets.add(nextTile.targetId);
            }
          }
        }
      }
    }

    setPoweredCoords(powered);
    setPoweredTargets(targets);

    // If all 3 targets are powered, clear the puzzle!
    if (targets.has('RELAY-A') && targets.has('RELAY-B') && targets.has('RELAY-C') && !cleared) {
      sound.playSuccessChime();
      onClear();
    }
  }, [tiles, cleared, onClear]);

  const handleRotate = (r: number, c: number) => {
    if (cleared) return;
    const tile = tiles.find(t => t.r === r && t.c === c);
    if (!tile || tile.isSource || tile.type === 'null') return;

    sound.playKeyClick();
    setTiles(prev =>
      prev.map(t => {
        if (t.r === r && t.c === c) {
          return { ...t, rotation: (t.rotation + 90) % 360 };
        }
        return t;
      })
    );
  };

  const handleReset = () => {
    sound.playKeyClick();
    setTiles(INITIAL_TILES);
  };

  return (
    <div className="bg-[#0b101d]/90 border border-[#00ffcc]/20 rounded-lg p-4 sm:p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#00ffcc]" />
            <h2 className="font-cyber text-lg sm:text-xl font-bold text-white tracking-wide">
              SUBSYSTEM GAMMA: LOGIC CONDUIT RELAY
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Click circuit nodes to rotate flow channels. Energize all 3 auxiliary airlock relays from the reactor core.
          </p>
        </div>

        {cleared ? (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/60 border border-emerald-500/50 text-emerald-400 text-xs font-mono font-bold rounded">
            <CheckCircle2 className="w-4 h-4" />
            <span>POWER RELAYS SYNCHRONIZED</span>
          </div>
        ) : (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-white bg-slate-800 px-2.5 py-1 rounded border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Conduits
          </button>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Circuit Grid (4x4) */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="bg-[#060a12] border-2 border-slate-800 p-3 sm:p-4 rounded-xl shadow-2xl relative">
            <div className="grid grid-cols-4 gap-2 sm:gap-3 w-[280px] sm:w-[360px] h-[280px] sm:h-[360px]">
              {tiles.map((tile) => {
                const key = `${tile.r},${tile.c}`;
                const isPowered = poweredCoords.has(key);
                const conns = getConnections(tile.type, tile.rotation);

                return (
                  <button
                    key={key}
                    onClick={() => handleRotate(tile.r, tile.c)}
                    disabled={cleared || tile.isSource || tile.type === 'null'}
                    className={`relative rounded-lg flex items-center justify-center transition-all ${
                      tile.isSource
                        ? 'bg-amber-950/40 border-2 border-amber-400 text-amber-400 shadow-[0_0_12px_#f59e0b]'
                        : tile.type === 'null'
                        ? 'bg-red-950/20 border border-red-900/40 text-red-700 cursor-not-allowed'
                        : tile.type === 'target'
                        ? isPowered
                          ? 'bg-emerald-950/50 border-2 border-emerald-400 text-emerald-300 shadow-[0_0_12px_#10b981]'
                          : 'bg-slate-900/80 border border-slate-700 text-slate-400'
                        : isPowered
                        ? 'bg-slate-900 border border-[#00ffcc]/60 shadow-[0_0_8px_rgba(0,255,204,0.3)] hover:scale-105'
                        : 'bg-slate-950/80 border border-slate-800 hover:border-slate-700 hover:scale-105'
                    }`}
                  >
                    {/* SVG Conduit Visualizer based on conns [T, R, B, L] */}
                    <svg viewBox="0 0 100 100" className="w-full h-full p-1.5 pointer-events-none">
                      {/* Center Node */}
                      <circle
                        cx="50"
                        cy="50"
                        r={tile.isSource ? '18' : '10'}
                        fill={
                          tile.isSource
                            ? '#f59e0b'
                            : isPowered
                            ? '#00ffcc'
                            : '#334155'
                        }
                      />

                      {/* Conduit lines */}
                      {conns[0] && (
                        <line
                          x1="50"
                          y1="50"
                          x2="50"
                          y2="0"
                          stroke={isPowered ? '#00ffcc' : '#334155'}
                          strokeWidth="8"
                          strokeLinecap="round"
                        />
                      )}
                      {conns[1] && (
                        <line
                          x1="50"
                          y1="50"
                          x2="100"
                          y2="50"
                          stroke={isPowered ? '#00ffcc' : '#334155'}
                          strokeWidth="8"
                          strokeLinecap="round"
                        />
                      )}
                      {conns[2] && (
                        <line
                          x1="50"
                          y1="50"
                          x2="50"
                          y2="100"
                          stroke={isPowered ? '#00ffcc' : '#334155'}
                          strokeWidth="8"
                          strokeLinecap="round"
                        />
                      )}
                      {conns[3] && (
                        <line
                          x1="50"
                          y1="50"
                          x2="0"
                          y2="50"
                          stroke={isPowered ? '#00ffcc' : '#334155'}
                          strokeWidth="8"
                          strokeLinecap="round"
                        />
                      )}

                      {/* Icon overlay for Special Nodes */}
                      {tile.isSource && (
                        <text x="50" y="55" textAnchor="middle" fill="#000" fontSize="18" fontWeight="bold" fontFamily="monospace">
                          CORE
                        </text>
                      )}
                      {tile.type === 'target' && (
                        <text x="50" y="55" textAnchor="middle" fill={isPowered ? '#000' : '#94a3b8'} fontSize="13" fontWeight="bold" fontFamily="monospace">
                          {tile.targetId?.replace('RELAY-', '')}
                        </text>
                      )}
                      {tile.type === 'null' && (
                        <text x="50" y="56" textAnchor="middle" fill="#ef4444" fontSize="24" fontWeight="bold">
                          ×
                        </text>
                      )}
                    </svg>

                    {!tile.isSource && tile.type !== 'null' && !cleared && (
                      <div className="absolute top-1 right-1 opacity-20 hover:opacity-100 transition-opacity">
                        <RotateCw className="w-2.5 h-2.5 text-slate-400" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Target Status Panel */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4">
            <div className="text-xs font-mono font-bold text-slate-300 mb-3 flex items-center justify-between">
              <span>AIRLOCK RELAY TELEMETRY</span>
              <span className="text-[#00ffcc]">{poweredTargets.size} / 3 ACTIVE</span>
            </div>

            <div className="space-y-2.5">
              {[
                { id: 'RELAY-A', name: 'Auxiliary Vent Valve (North)', desc: 'Hydraulic isolation circuit' },
                { id: 'RELAY-B', name: 'Secondary Mag-Latch (East)', desc: 'Electromagnetic seal breaker' },
                { id: 'RELAY-C', name: 'Manual Decoupler (South-West)', desc: 'Physical atmospheric release' }
              ].map(relay => {
                const isOnline = poweredTargets.has(relay.id);
                return (
                  <div
                    key={relay.id}
                    className={`p-3 rounded border flex items-center justify-between font-mono transition-all ${
                      isOnline
                        ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                        : 'border-slate-800 bg-slate-950/60 text-slate-500'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <Zap className={`w-3.5 h-3.5 ${isOnline ? 'text-emerald-400' : 'text-slate-600'}`} />
                        <span>{relay.id}: {relay.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{relay.desc}</div>
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${
                      isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'
                    }`}>
                      {isOnline ? 'ENERGIZED' : 'OFFLINE'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded text-xs font-mono text-slate-400 space-y-1.5">
            <div className="text-slate-300 font-bold flex items-center gap-1">
              <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
              OPERATOR NOTE:
            </div>
            <p className="text-[11px]">
              Power propagates automatically along connected conduit arms. Click any standard or elbow node to rotate it 90 degrees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
