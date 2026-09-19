export type GamePhase = 'intro' | 'playing' | 'breached' | 'flatlined';

export type SubsystemId = 'frequency' | 'matrix' | 'circuit' | 'terminal';

export interface SubsystemStatus {
  id: SubsystemId;
  name: string;
  codeName: string;
  cleared: boolean;
  active: boolean;
  description: string;
  iconName: string;
}

export interface TerminalLog {
  id: string;
  timestamp: string;
  sender: string;
  subject: string;
  content: string;
  encrypted?: boolean;
  decrypted?: boolean;
  cipherKey?: string;
  revealsClue?: string;
}

export interface AIAttackDialogue {
  id: string;
  triggerCondition: 'start' | 'first_clear' | 'halfway' | 'three_clears' | 'time_warning' | 'error' | 'success' | 'taunt';
  speaker: string;
  text: string;
  threatLevel: 'nominal' | 'elevated' | 'critical';
}

export interface DifficultySetting {
  id: 'ghost' | 'runner' | 'hardcore';
  name: string;
  timeLimitSec: number;
  description: string;
  integrityDrainRate: number; // multiplier
}
