/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Header } from './components/Header';
import { LobbySetup } from './components/LobbySetup';
import { SplitScreenDuel } from './components/modes/SplitScreenDuel';
import { TugOfWarMode } from './components/modes/TugOfWarMode';
import { BuzzerClashMode } from './components/modes/BuzzerClashMode';
import { BoardQuestMode } from './components/modes/BoardQuestMode';
import { VictoryModal } from './components/VictoryModal';
import { MaterialGuideModal } from './components/MaterialGuideModal';
import { GameSettings, TeamConfig, MathQuestion, QuestionHistoryItem, PowerUpType } from './types';
import { generateQuestion } from './utils/mathGenerator';
import { soundManager } from './utils/audio';

const DEFAULT_TEAM_1: TeamConfig = {
  id: 'team1',
  name: 'Tim Garuda',
  color: '#FF2E63',
  bgGradient: 'bg-[#FF2E63]',
  borderAccent: 'border-black',
  textColor: 'text-white',
  mascot: { name: 'Garuda', emoji: '🦅', description: 'Cepat & Berani' },
  score: 0,
  streak: 0,
  maxStreak: 0,
  correctCount: 0,
  wrongCount: 0,
  totalAnswerTimeMs: 0,
  activePowerUps: [],
  inventory: ['double-points', 'bomb-5050', 'freeze'],
  boardPosition: 0,
};

const DEFAULT_TEAM_2: TeamConfig = {
  id: 'team2',
  name: 'Tim Harimau',
  color: '#08D9D6',
  bgGradient: 'bg-[#08D9D6]',
  borderAccent: 'border-black',
  textColor: 'text-black',
  mascot: { name: 'Harimau', emoji: '🐯', description: 'Tangkas & Kuat' },
  score: 0,
  streak: 0,
  maxStreak: 0,
  correctCount: 0,
  wrongCount: 0,
  totalAnswerTimeMs: 0,
  activePowerUps: [],
  inventory: ['double-points', 'bomb-5050', 'freeze'],
  boardPosition: 0,
};

export default function App() {
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [guideModalOpen, setGuideModalOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [settings, setSettings] = useState<GameSettings>({
    mode: 'duel-split',
    topic: 'all',
    difficulty: 'medium',
    maxRounds: 10,
    timePerQuestionSec: 15,
    enablePowerUps: true,
    enableVisualAids: true,
    soundEnabled: true,
    buzzerKeyTeam1: 'A',
    buzzerKeyTeam2: 'L',
  });

  const [team1, setTeam1] = useState<TeamConfig>(DEFAULT_TEAM_1);
  const [team2, setTeam2] = useState<TeamConfig>(DEFAULT_TEAM_2);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion | null>(null);
  const [history, setHistory] = useState<QuestionHistoryItem[]>([]);

  // Mode specific state
  const [ropePosition, setRopePosition] = useState<number>(0);
  const [team1BoardPos, setTeam1BoardPos] = useState<number>(0);
  const [team2BoardPos, setTeam2BoardPos] = useState<number>(0);

  const handleStartGame = (
    newSettings: GameSettings,
    newTeam1: TeamConfig,
    newTeam2: TeamConfig
  ) => {
    setSettings(newSettings);
    setTeam1(newTeam1);
    setTeam2(newTeam2);
    setCurrentRound(1);
    setHistory([]);
    setRopePosition(0);
    setTeam1BoardPos(0);
    setTeam2BoardPos(0);
    setIsGameOver(false);

    const firstQuestion = generateQuestion(
      newSettings.topic,
      newSettings.difficulty,
      newSettings.customMultipliers
    );
    setCurrentQuestion(firstQuestion);
    setGameStarted(true);
  };

  const handleUsePowerUp = (teamId: 'team1' | 'team2', powerUpType: PowerUpType) => {
    soundManager.playPowerUp();

    if (teamId === 'team1') {
      setTeam1((prev) => ({
        ...prev,
        inventory: prev.inventory.filter((item, i) => i !== prev.inventory.indexOf(powerUpType)),
        activePowerUps: [...prev.activePowerUps, { type: powerUpType }],
      }));

      if (powerUpType === 'freeze') {
        // Freeze team 2 for 3.5s
        setTeam2((prev) => ({
          ...prev,
          activePowerUps: [...prev.activePowerUps, { type: 'freeze' }],
        }));
        setTimeout(() => {
          setTeam2((prev) => ({
            ...prev,
            activePowerUps: prev.activePowerUps.filter((p) => p.type !== 'freeze'),
          }));
        }, 3500);
      }
    } else {
      setTeam2((prev) => ({
        ...prev,
        inventory: prev.inventory.filter((item, i) => i !== prev.inventory.indexOf(powerUpType)),
        activePowerUps: [...prev.activePowerUps, { type: powerUpType }],
      }));

      if (powerUpType === 'freeze') {
        // Freeze team 1 for 3.5s
        setTeam1((prev) => ({
          ...prev,
          activePowerUps: [...prev.activePowerUps, { type: 'freeze' }],
        }));
        setTimeout(() => {
          setTeam1((prev) => ({
            ...prev,
            activePowerUps: prev.activePowerUps.filter((p) => p.type !== 'freeze'),
          }));
        }, 3500);
      }
    }
  };

  const handleQuestionCompleted = (
    team1Ans: number | null,
    team2Ans: number | null,
    team1Correct: boolean,
    team2Correct: boolean,
    timeMs1: number,
    timeMs2: number,
    ropeDelta: number = 0
  ) => {
    if (!currentQuestion) return;

    // Record question in history
    const historyItem: QuestionHistoryItem = {
      question: currentQuestion,
      answeredBy:
        team1Ans !== null && team2Ans !== null
          ? 'both'
          : team1Ans !== null
          ? 'team1'
          : team2Ans !== null
          ? 'team2'
          : 'none',
      team1Answer: team1Ans !== null ? team1Ans : undefined,
      team2Answer: team2Ans !== null ? team2Ans : undefined,
      team1Correct,
      team2Correct,
      team1TimeMs: timeMs1,
      team2TimeMs: timeMs2,
      roundNumber: currentRound,
    };

    setHistory((prev) => [...prev, historyItem]);

    // Calculate score increments
    const basePts = 100;
    const t1HasDouble = team1.activePowerUps.some((p) => p.type === 'double-points');
    const t2HasDouble = team2.activePowerUps.some((p) => p.type === 'double-points');

    let t1ScoreDelta = 0;
    let t1NewStreak = team1Correct ? team1.streak + 1 : 0;
    if (team1Correct) {
      const streakMultiplier = t1NewStreak >= 3 ? 1.5 : t1NewStreak >= 2 ? 1.25 : 1;
      const speedBonus = timeMs1 < 4000 ? 25 : 0;
      t1ScoreDelta = Math.round((basePts + speedBonus) * (t1HasDouble ? 2 : 1) * streakMultiplier);
    }

    let t2ScoreDelta = 0;
    let t2NewStreak = team2Correct ? team2.streak + 1 : 0;
    if (team2Correct) {
      const streakMultiplier = t2NewStreak >= 3 ? 1.5 : t2NewStreak >= 2 ? 1.25 : 1;
      const speedBonus = timeMs2 < 4000 ? 25 : 0;
      t2ScoreDelta = Math.round((basePts + speedBonus) * (t2HasDouble ? 2 : 1) * streakMultiplier);
    }

    // Update teams
    setTeam1((prev) => ({
      ...prev,
      score: prev.score + t1ScoreDelta,
      streak: t1NewStreak,
      maxStreak: Math.max(prev.maxStreak, t1NewStreak),
      correctCount: prev.correctCount + (team1Correct ? 1 : 0),
      wrongCount: prev.wrongCount + (team1Ans !== null && !team1Correct ? 1 : 0),
      totalAnswerTimeMs: prev.totalAnswerTimeMs + (team1Correct ? timeMs1 : 0),
      activePowerUps: prev.activePowerUps.filter((p) => p.type !== 'double-points'),
    }));

    setTeam2((prev) => ({
      ...prev,
      score: prev.score + t2ScoreDelta,
      streak: t2NewStreak,
      maxStreak: Math.max(prev.maxStreak, t2NewStreak),
      correctCount: prev.correctCount + (team2Correct ? 1 : 0),
      wrongCount: prev.wrongCount + (team2Ans !== null && !team2Correct ? 1 : 0),
      totalAnswerTimeMs: prev.totalAnswerTimeMs + (team2Correct ? timeMs2 : 0),
      activePowerUps: prev.activePowerUps.filter((p) => p.type !== 'double-points'),
    }));

    // Check Tug of War positions
    let newRopePos = ropePosition;
    if (settings.mode === 'tug-of-war') {
      newRopePos = Math.min(100, Math.max(-100, ropePosition + ropeDelta));
      setRopePosition(newRopePos);
    }

    // Check game over conditions
    const isTugOfWarKO = settings.mode === 'tug-of-war' && Math.abs(newRopePos) >= 100;
    const isRoundsFinished = currentRound >= settings.maxRounds;

    if (isTugOfWarKO || isRoundsFinished) {
      setTimeout(() => {
        setIsGameOver(true);
      }, 1000);
    } else {
      // Next round
      setCurrentRound((prev) => prev + 1);
      const nextQ = generateQuestion(
        settings.topic,
        settings.difficulty,
        settings.customMultipliers
      );
      setCurrentQuestion(nextQ);
    }
  };

  const handleBoardMove = (
    teamId: 'team1' | 'team2',
    steps: number,
    pointsBonus: number
  ) => {
    if (teamId === 'team1') {
      const nextPos = Math.min(15, team1BoardPos + steps);
      setTeam1BoardPos(nextPos);
      setTeam1((prev) => ({ ...prev, score: prev.score + pointsBonus }));
    } else {
      const nextPos = Math.min(15, team2BoardPos + steps);
      setTeam2BoardPos(nextPos);
      setTeam2((prev) => ({ ...prev, score: prev.score + pointsBonus }));
    }
  };

  const handlePlayAgain = () => {
    handleStartGame(settings, { ...team1, score: 0, streak: 0, correctCount: 0, wrongCount: 0, totalAnswerTimeMs: 0, inventory: ['double-points', 'bomb-5050', 'freeze'] }, { ...team2, score: 0, streak: 0, correctCount: 0, wrongCount: 0, totalAnswerTimeMs: 0, inventory: ['double-points', 'bomb-5050', 'freeze'] });
  };

  const handleBackToLobby = () => {
    setGameStarted(false);
    setIsGameOver(false);
    setCurrentQuestion(null);
  };

  const getModeTitle = () => {
    switch (settings.mode) {
      case 'duel-split':
        return 'Duel Cepat Layar Terbagi';
      case 'tug-of-war':
        return 'Tarik Tambang Angka';
      case 'buzzer-clash':
        return 'Rebutan Bel Cerdas';
      case 'board-quest':
        return 'Petualangan Papan';
    }
  };

  return (
    <div className="min-h-screen bg-[#120D31] text-white flex flex-col font-sans selection:bg-[#FFFB00] selection:text-black relative overflow-x-hidden">
      {/* Background Dot Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-vibrant-dots z-0"></div>

      {/* Top Navbar */}
      <Header
        gameStarted={gameStarted}
        onReset={handleBackToLobby}
        onOpenGuide={() => setGuideModalOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={setSoundEnabled}
        currentRound={currentRound}
        maxRounds={settings.maxRounds}
        modeName={getModeTitle()}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-6 flex flex-col justify-center relative z-10">
        {!gameStarted ? (
          <LobbySetup
            onStartGame={handleStartGame}
            onOpenGuide={() => setGuideModalOpen(true)}
          />
        ) : currentQuestion ? (
          <div className="w-full">
            {settings.mode === 'duel-split' && (
              <SplitScreenDuel
                currentRound={currentRound}
                maxRounds={settings.maxRounds}
                question={currentQuestion}
                team1={team1}
                team2={team2}
                timePerQuestionSec={settings.timePerQuestionSec}
                enablePowerUps={settings.enablePowerUps}
                enableVisualAids={settings.enableVisualAids}
                onQuestionCompleted={handleQuestionCompleted}
                onUsePowerUp={handleUsePowerUp}
              />
            )}

            {settings.mode === 'tug-of-war' && (
              <TugOfWarMode
                currentRound={currentRound}
                maxRounds={settings.maxRounds}
                question={currentQuestion}
                team1={team1}
                team2={team2}
                enablePowerUps={settings.enablePowerUps}
                enableVisualAids={settings.enableVisualAids}
                onQuestionCompleted={handleQuestionCompleted}
                onUsePowerUp={handleUsePowerUp}
                ropePosition={ropePosition}
              />
            )}

            {settings.mode === 'buzzer-clash' && (
              <BuzzerClashMode
                currentRound={currentRound}
                maxRounds={settings.maxRounds}
                question={currentQuestion}
                team1={team1}
                team2={team2}
                buzzerKeyTeam1={settings.buzzerKeyTeam1}
                buzzerKeyTeam2={settings.buzzerKeyTeam2}
                enableVisualAids={settings.enableVisualAids}
                onQuestionCompleted={handleQuestionCompleted}
              />
            )}

            {settings.mode === 'board-quest' && (
              <BoardQuestMode
                currentRound={currentRound}
                maxRounds={settings.maxRounds}
                question={currentQuestion}
                team1={team1}
                team2={team2}
                enableVisualAids={settings.enableVisualAids}
                onQuestionCompleted={handleQuestionCompleted}
                onBoardMove={handleBoardMove}
                team1Pos={team1BoardPos}
                team2Pos={team2BoardPos}
              />
            )}
          </div>
        ) : null}
      </main>

      {/* Victory / Game Over Modal */}
      <VictoryModal
        isOpen={isGameOver}
        team1={team1}
        team2={team2}
        history={history}
        onPlayAgain={handlePlayAgain}
        onBackToLobby={handleBackToLobby}
        onOpenGuide={() => setGuideModalOpen(true)}
      />

      {/* Math Tricks & Concepts Modal */}
      <MaterialGuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
      />
    </div>
  );
}
