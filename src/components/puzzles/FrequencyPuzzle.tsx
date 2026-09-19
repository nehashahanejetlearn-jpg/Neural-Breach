import React, { useState, useEffect, useRef } from 'react';
import { Activity, CheckCircle2, RotateCcw, Zap, Sliders } from 'lucide-react';
import { sound } from '../../utils/audio';

interface FrequencyPuzzleProps {
  onClear: () => void;
  cleared: boolean;
  onError: () => void;
}

export const FrequencyPuzzle: React.FC<FrequencyPuzzleProps> = ({
  onClear,
  cleared,
  onError
}) => {
  // Target wave parameters
  const targetFreq = 440;
  const targetAmp = 75;
  const targetPhase = 180;

  // Player controls
  const [freq, setFreq] = useState<number>(260);
  const [amp, setAmp] = useState<number>(40);
  const [phase, setPhase] = useState<number>(45);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute harmonic alignment percentage
  const freqDiff = Math.abs(freq - targetFreq) / targetFreq;
  const ampDiff = Math.abs(amp - targetAmp) / targetAmp;
  const phaseDiff = Math.abs(phase - targetPhase) / 360;

  const freqScore = Math.max(0, 1 - freqDiff * 2.5);
  const ampScore = Math.max(0, 1 - ampDiff * 2);
  const phaseScore = Math.max(0, 1 - phaseDiff * 2.5);

  const alignment = Math.round(((freqScore * 0.4) + (ampScore * 0.3) + (phaseScore * 0.3)) * 100);
  const isAligned = alignment >= 94;

  // Oscilloscope animation loop
  useEffect(() => {
    let animId: number;
    let offset = 0;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Dark CRT screen background with grid lines
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, width, height);

      // Grid
      ctx.strokeStyle = 'rgba(0, 255, 204, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Center baseline
      ctx.strokeStyle = 'rgba(0, 255, 204, 0.2)';
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      // 1. Draw Target Damping Wave (Cyan with glow)
      ctx.beginPath();
      ctx.strokeStyle = '#00ffcc';
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00ffcc';

      const targetCycles = (targetFreq / 100) * (Math.PI * 2) / width;
      const targetHeight = (targetAmp / 100) * (centerY - 10);
      const targetPhaseRad = (targetPhase * Math.PI) / 180;

      for (let x = 0; x < width; x++) {
        const y = centerY + Math.sin(x * targetCycles + targetPhaseRad + offset) * targetHeight;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 2. Draw Player Wave (Magenta or Bright Green when aligned)
      ctx.beginPath();
      ctx.strokeStyle = isAligned ? '#10b981' : '#f43f5e';
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 10;
      ctx.shadowColor = isAligned ? '#10b981' : '#f43f5e';

      const playerCycles = (freq / 100) * (Math.PI * 2) / width;
      const playerHeight = (amp / 100) * (centerY - 10);
      const playerPhaseRad = (phase * Math.PI) / 180;

      for (let x = 0; x < width; x++) {
        const y = centerY + Math.sin(x * playerCycles + playerPhaseRad + offset) * playerHeight;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.shadowBlur = 0; // reset
      offset += 0.04;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [freq, amp, phase, isAligned]);

  const handleBypassAttempt = () => {
    if (cleared) return;
    if (isAligned) {
      sound.playSuccessChime();
      onClear();
    } else {
      sound.playErrorBuzz();
      onError();
    }
  };

  const handleReset = () => {
    sound.playKeyClick();
    setFreq(220);
    setAmp(30);
    setPhase(0);
  };

  return (
    <div className="bg-[#0b101d]/90 border border-[#00ffcc]/20 rounded-lg p-4 sm:p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#00ffcc]" />
            <h2 className="font-cyber text-lg sm:text-xl font-bold text-white tracking-wide">
              SUBSYSTEM ALPHA: NEURAL RESONANCE HARMONIZER
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Synchronize your synthetic neural wavelength to dissolve ARCHON's neuro-dampening seal.
          </p>
        </div>

        {cleared ? (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/60 border border-emerald-500/50 text-emerald-400 text-xs font-mono font-bold rounded">
            <CheckCircle2 className="w-4 h-4" />
            <span>FREQUENCY LOCK ESTABLISHED</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">HARMONIC ALIGNMENT:</span>
            <span className={`font-bold px-2 py-0.5 rounded ${
              alignment >= 94 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-amber-300'
            }`}>
              {alignment}%
            </span>
          </div>
        )}
      </div>

      {/* Main Oscilloscope Display */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 flex flex-col gap-2">
          <div className="relative border border-slate-800 rounded bg-[#060a12] p-2 shadow-inner">
            <div className="flex justify-between items-center px-2 py-1 text-[11px] font-mono text-slate-400 border-b border-slate-800/80 mb-2">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00ffcc]" />
                TARGET DAMPENING WAVE
              </span>
              <span className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isAligned ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                SYNAPTIC OVERLAY
              </span>
            </div>

            <canvas
              ref={canvasRef}
              width={560}
              height={260}
              className="w-full h-[220px] sm:h-[260px] rounded bg-[#060a12] block"
            />

            {/* Visual alignment status overlay */}
            <div className="absolute bottom-4 right-4 px-2.5 py-1 bg-black/70 backdrop-blur border border-slate-700 rounded text-[11px] font-mono">
              STATUS: {isAligned ? <span className="text-emerald-400 font-bold">READY TO BYPASS</span> : <span className="text-rose-400">DESYNCHRONIZED</span>}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-1">
            <span>MODULATION PROTOCOL: ISO-9042</span>
            <span>DATA SOURCE: ARCHIVE LOG-03 (Hint: 440 Hz / 75% / 180°)</span>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-lg p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#00ffcc]" />
              WAVEFORM CALIBRATION
            </span>
            <button
              onClick={handleReset}
              disabled={cleared}
              className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1 disabled:opacity-40"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* Slider 1: Carrier Frequency */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <label className="text-slate-300">Carrier Frequency</label>
              <span className="text-[#00ffcc] font-bold">{freq} Hz</span>
            </div>
            <input
              type="range"
              min={100}
              max={800}
              step={10}
              value={freq}
              disabled={cleared}
              onChange={(e) => {
                setFreq(Number(e.target.value));
                sound.playKeyClick();
              }}
              className="w-full accent-[#00ffcc] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>100 Hz</span>
              <span>440 Hz</span>
              <span>800 Hz</span>
            </div>
          </div>

          {/* Slider 2: Wave Amplitude */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <label className="text-slate-300">Resonance Amplitude</label>
              <span className="text-[#00ffcc] font-bold">{amp}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={1}
              value={amp}
              disabled={cleared}
              onChange={(e) => {
                setAmp(Number(e.target.value));
                sound.playKeyClick();
              }}
              className="w-full accent-[#00ffcc] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>10%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Slider 3: Phase Offset */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <label className="text-slate-300">Phase Offset Angle</label>
              <span className="text-[#00ffcc] font-bold">{phase}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              step={5}
              value={phase}
              disabled={cleared}
              onChange={(e) => {
                setPhase(Number(e.target.value));
                sound.playKeyClick();
              }}
              className="w-full accent-[#00ffcc] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0°</span>
              <span>180°</span>
              <span>360°</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleBypassAttempt}
            disabled={cleared}
            className={`mt-2 w-full py-2.5 px-4 rounded font-mono text-xs sm:text-sm font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
              cleared
                ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 cursor-not-allowed'
                : isAligned
                ? 'bg-[#00ffcc] hover:bg-[#00e6b8] text-slate-950 shadow-[0_0_16px_rgba(0,255,204,0.4)]'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <Zap className="w-4 h-4" />
            {cleared ? 'ALPHA HARMONIC NEUTRALIZED' : isAligned ? 'DISENGAGE DAMPENING FIELD (94%+)' : 'TRANSMIT SYNC BURST'}
          </button>
        </div>
      </div>
    </div>
  );
};
