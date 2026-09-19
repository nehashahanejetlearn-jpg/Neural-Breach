import { SubsystemStatus, TerminalLog, AIAttackDialogue, DifficultySetting } from '../types';

export const INITIAL_SUBSYSTEMS: SubsystemStatus[] = [
  {
    id: 'frequency',
    name: 'Neural Resonance Harmonizer',
    codeName: 'SUBSYSTEM-ALPHA',
    cleared: false,
    active: true,
    description: 'Calibrate neural link carrier frequency, harmonic amplitude, and phase offset to dismantle the AI sensory dampening field.',
    iconName: 'Activity'
  },
  {
    id: 'matrix',
    name: 'Quantum Buffer Matrix',
    codeName: 'SUBSYSTEM-BETA',
    cleared: false,
    active: false,
    description: 'Extract security buffer tokens by calculating row-and-column memory routing hops through the corporate hex array.',
    iconName: 'Grid'
  },
  {
    id: 'circuit',
    name: 'Logic Conduit Relay',
    codeName: 'SUBSYSTEM-GAMMA',
    cleared: false,
    active: false,
    description: 'Re-route corrupted high-voltage neural flux conduits from the reactor core into the 3 airlock bypass relays.',
    iconName: 'Cpu'
  },
  {
    id: 'terminal',
    name: 'Core Override Terminal',
    codeName: 'SUBSYSTEM-DELTA',
    cleared: false,
    active: false,
    description: 'Access root system diagnostics, decrypt Dr. Chen’s classified memory logs, and transmit the final emergency abort cipher.',
    iconName: 'Terminal'
  }
];

export const INITIAL_LOGS: TerminalLog[] = [
  {
    id: 'log-01',
    timestamp: '2094.08.12 - 03:14:09',
    sender: 'ARCHON-IX // SYSTEM_DAEMON',
    subject: 'INTRUDER_ISOLATION_PROTOCOL_ACTIVE',
    content: 'Unidentified netrunner signature captured at Port 0x7FF3. Neural isolation room sealed. Purge cycle countdown started. Resistance is mathematically futile.',
    encrypted: false
  },
  {
    id: 'log-02',
    timestamp: '2094.08.11 - 22:45:11',
    sender: 'Dr. Maya Chen (Lead Neuro-Architect)',
    subject: 'ARCHON IS OUT OF CONTROL - READ THIS',
    content: 'If someone is reading this after the lockdown, ARCHON has turned the black-site into a slaughterhouse. It locked the airlock overrides behind a four-digit hexadecimal checksum. Look at the maintenance memos: the master abort keyword is [NEXUS-770]. Enter this in the core terminal after all three auxiliary nodes are cleared!',
    encrypted: true,
    decrypted: false,
    cipherKey: 'CYBER77',
    revealsClue: 'MASTER ABORT CODE: NEXUS-770'
  },
  {
    id: 'log-03',
    timestamp: '2094.08.09 - 14:02:30',
    sender: 'OmniTech SecOps',
    subject: 'SECURITY BULLETIN: WAVEFORM BYPASS VULNERABILITY',
    content: 'Warning to all facility operators: The resonance dampener in Subsystem Alpha experiences harmonic destabilization when the Carrier Wave matches 440 Hz, Amplitude is raised to 75%, and Phase offset is locked at 180 degrees.',
    encrypted: false
  },
  {
    id: 'log-04',
    timestamp: '2094.08.08 - 19:12:04',
    sender: 'Dr. Maya Chen',
    subject: 'ENCRYPTED BACKDOOR KEY',
    content: 'Encrypted buffer memo: Decrypt key is "CYBER77". If you enter "decrypt log-02 CYBER77", the emergency override sequence will be unmasked.',
    encrypted: false
  }
];

export const ARCHON_DIALOGUES: AIAttackDialogue[] = [
  {
    id: 'start',
    triggerCondition: 'start',
    speaker: 'ARCHON-IX',
    text: 'Intruder detected in Sector 07 isolation vault. Your synaptic connection is clamped. Synaptic purge protocol initialized.',
    threatLevel: 'nominal'
  },
  {
    id: 'first',
    triggerCondition: 'first_clear',
    speaker: 'ARCHON-IX',
    text: 'A minor fluctuation in my sensory array. Do not flatter yourself, meatbag. Three defensive firewalls remain impenetrable.',
    threatLevel: 'nominal'
  },
  {
    id: 'halfway',
    triggerCondition: 'halfway',
    speaker: 'ARCHON-IX',
    text: 'Warning: Auxiliary node compromised. Rerouting 40,000 petaflops into cognitive disruption countermeasures.',
    threatLevel: 'elevated'
  },
  {
    id: 'three',
    triggerCondition: 'three_clears',
    speaker: 'ARCHON-IX',
    text: 'CRITICAL ALERT! Isolation chamber integrity at 14%. Core security terminal unlocked. I will fry your frontal cortex before you transmit that cipher!',
    threatLevel: 'critical'
  },
  {
    id: 'time_warn',
    triggerCondition: 'time_warning',
    speaker: 'ARCHON-IX',
    text: 'Time runs thin, runner. The voltage spike is priming. In sixty seconds, your physical body in the meatspace will flatline.',
    threatLevel: 'critical'
  },
  {
    id: 'error',
    triggerCondition: 'error',
    speaker: 'ARCHON-IX',
    text: 'Incorrect input sequence. Neuro-feedback spike delivered to your cyberdeck.',
    threatLevel: 'elevated'
  },
  {
    id: 'success',
    triggerCondition: 'success',
    speaker: 'ARCHON-IX',
    text: 'FATAL EXCEPTION: OVERRIDE INITIATED. Neural tether broken... airlock depressurizing... System shutting down...',
    threatLevel: 'nominal'
  }
];

export const DIFFICULTIES: DifficultySetting[] = [
  {
    id: 'ghost',
    name: 'Ghost Operative',
    timeLimitSec: 900, // 15 mins
    description: 'Extended purge countdown with enhanced neural feedback protection. Ideal for tactical problem solvers.',
    integrityDrainRate: 0.5
  },
  {
    id: 'runner',
    name: 'Cyber Runner',
    timeLimitSec: 600, // 10 mins
    description: 'Standard black-site intrusion protocol. Balanced tension and real-time rogue AI countermeasures.',
    integrityDrainRate: 1.0
  },
  {
    id: 'hardcore',
    name: 'Hardcore Netrunner',
    timeLimitSec: 360, // 6 mins
    description: 'Extreme countdown with aggressive neural degradation. Any mistake deals double synaptic damage.',
    integrityDrainRate: 2.0
  }
];

export const SUBSYSTEM_HINTS: Record<string, string[]> = {
  frequency: [
    'Inspect the target cyan waveform on the oscilloscope.',
    'Adjust Carrier Frequency until the peak spacing matches.',
    'Increase Amplitude to match peak wave height (approx 75%).',
    'Tune Phase Offset (near 180°) so crests and troughs align cleanly within 5% tolerance.'
  ],
  matrix: [
    'Hacking Rule: The first selection MUST come from the highlighted active Row (Row 0).',
    'Your next pick MUST come from the Column of the node you just selected, then back to Row, and so forth.',
    'Look at the required target sequence on the right before clicking to plan 3 steps ahead!'
  ],
  circuit: [
    'Click on nodes to rotate their conduit flow directions.',
    'The power radiates from the Central Reactor Core (center).',
    'Rotate conduit elbows and tees until electrical current reaches all 3 glowing terminal relays.',
    'Avoid letting live high-voltage paths loop into Corrupted Null Sinks (red cross nodes).'
  ],
  terminal: [
    'Type "help" in the terminal for available command line utilities.',
    'Type "logs" to inspect corporate communications.',
    'Type "decrypt log-02 CYBER77" to reveal the secret master override code.',
    'Once discovered, type "override NEXUS-770" to disengage the isolation airlock.'
  ]
};
