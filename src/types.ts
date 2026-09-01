export type GameMode = 'duel-split' | 'tug-of-war' | 'buzzer-clash' | 'board-quest';

export type MathTopic = 'all' | 'multiplication' | 'division' | 'mixed-word-problems';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'custom';

export type PowerUpType = 'double-points' | 'freeze' | 'bomb-5050' | 'shield' | 'extra-time';

export interface PowerUp {
  id: string;
  type: PowerUpType;
  name: string;
  description: string;
  icon: string;
  color: string;
  appliedToOpponent?: boolean;
}

export interface TeamConfig {
  id: 'team1' | 'team2';
  name: string;
  color: string;
  bgGradient: string;
  borderAccent: string;
  textColor: string;
  mascot: {
    name: string;
    emoji: string;
    description: string;
  };
  score: number;
  streak: number;
  maxStreak: number;
  correctCount: number;
  wrongCount: number;
  totalAnswerTimeMs: number;
  activePowerUps: {
    type: PowerUpType;
    durationRounds?: number;
    expiresAt?: number;
  }[];
  inventory: PowerUpType[];
  boardPosition?: number; // for board quest
}

export interface MathQuestion {
  id: string;
  topic: 'multiplication' | 'division' | 'word-problem';
  questionText: string;
  subText?: string;
  num1: number;
  num2: number;
  operator: 'x' | ':';
  correctAnswer: number;
  options: number[];
  explanation: string;
  visualData?: {
    type: 'grid' | 'groups' | 'number-line' | 'division-baskets';
    groupsCount?: number;
    itemsPerGroup?: number;
    itemEmoji?: string;
    totalItems?: number;
  };
  storyContext?: {
    title: string;
    character: string;
  };
}

export interface GameSettings {
  mode: GameMode;
  topic: MathTopic;
  difficulty: DifficultyLevel;
  maxRounds: number;
  timePerQuestionSec: number; // 0 = unlimited
  enablePowerUps: boolean;
  enableVisualAids: boolean;
  soundEnabled: boolean;
  buzzerKeyTeam1: string;
  buzzerKeyTeam2: string;
  customMultipliers?: number[]; // e.g. [2, 3, 4, 5]
}

export interface QuestionHistoryItem {
  question: MathQuestion;
  answeredBy: 'team1' | 'team2' | 'both' | 'none';
  team1Answer?: number;
  team2Answer?: number;
  team1Correct?: boolean;
  team2Correct?: boolean;
  team1TimeMs?: number;
  team2TimeMs?: number;
  roundNumber: number;
}
