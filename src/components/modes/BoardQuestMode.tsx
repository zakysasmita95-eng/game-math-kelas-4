import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dices, Sparkles, Rocket, Gift, HelpCircle, Flag, Zap } from 'lucide-react';
import { MathQuestion, TeamConfig, PowerUpType } from '../../types';
import { soundManager } from '../../utils/audio';
import { VisualMathHelper } from '../VisualMathHelper';

interface Props {
  currentRound: number;
  maxRounds: number;
  question: MathQuestion;
  team1: TeamConfig;
  team2: TeamConfig;
  enableVisualAids: boolean;
  onQuestionCompleted: (
    team1Ans: number | null,
    team2Ans: number | null,
    team1Correct: boolean,
    team2Correct: boolean,
    timeMs1: number,
    timeMs2: number
  ) => void;
  onBoardMove: (teamId: 'team1' | 'team2', steps: number, pointsBonus: number) => void;
  team1Pos: number;
  team2Pos: number;
}

const TOTAL_TILES = 16;

export const BoardQuestMode = ({
  currentRound,
  maxRounds,
  question,
  team1,
  team2,
  enableVisualAids,
  onQuestionCompleted,
  onBoardMove,
  team1Pos,
  team2Pos,
}: Props) => {
  // Current active turn: 'team1' or 'team2'
  const [activeTurn, setActiveTurn] = useState<'team1' | 'team2'>('team1');
  const [diceRolling, setDiceRolling] = useState<boolean>(false);
  const [rolledDice, setRolledDice] = useState<number | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [eventNotification, setEventNotification] = useState<string>('');

  useEffect(() => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    setRolledDice(null);
    setEventNotification('');
  }, [question]);

  const currentTeam = activeTurn === 'team1' ? team1 : team2;

  const handleSelectAnswer = (ans: number) => {
    soundManager.playClick();
    setSelectedAnswer(ans);
    setShowExplanation(true);

    const isCorrect = ans === question.correctAnswer;

    if (isCorrect) {
      soundManager.playCorrect(currentTeam.streak);
      // Roll dice to advance
      setDiceRolling(true);
      setTimeout(() => {
        const dice = Math.floor(Math.random() * 3) + 1; // 1 to 3 steps
        setRolledDice(dice);
        setDiceRolling(false);
        soundManager.playPowerUp();

        // Calculate tile effect
        const targetPos = Math.min(
          TOTAL_TILES - 1,
          (activeTurn === 'team1' ? team1Pos : team2Pos) + dice
        );

        let bonusPts = 100;
        let eventMsg = `🎲 Dadu ${dice}! ${currentTeam.name} maju ${dice} langkah!`;

        if (targetPos === 4 || targetPos === 10) {
          bonusPts += 50;
          eventMsg += ' 🌟 Mendarat di Petak Bintang (+50 Poin Ekstra!)';
        } else if (targetPos === 7) {
          eventMsg += ' 🚀 Pendorong Roket! (+1 Langkah Bonus)';
        }

        setEventNotification(eventMsg);
        onBoardMove(activeTurn, dice, bonusPts);

        setTimeout(() => {
          const t1Ans = activeTurn === 'team1' ? ans : null;
          const t2Ans = activeTurn === 'team2' ? ans : null;
          // Switch turn
          setActiveTurn((prev) => (prev === 'team1' ? 'team2' : 'team1'));
          onQuestionCompleted(t1Ans, t2Ans, isCorrect, false, 1000, 1000);
        }, 2200);
      }, 1000);
    } else {
      soundManager.playWrong();
      setEventNotification(`❌ Jawaban belum tepat. Giliran berganti ke tim lawan.`);

      setTimeout(() => {
        const t1Ans = activeTurn === 'team1' ? ans : null;
        const t2Ans = activeTurn === 'team2' ? ans : null;
        setActiveTurn((prev) => (prev === 'team1' ? 'team2' : 'team1'));
        onQuestionCompleted(t1Ans, t2Ans, false, false, 1000, 1000);
      }, 2200);
    }
  };

  return (
    <div id="board-quest-mode" className="w-full max-w-7xl mx-auto flex flex-col gap-4">
      {/* Top Banner with Scores */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-black/60 border-4 border-black rounded-3xl shadow-[6px_6px_0px_0px_#000]">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#FF2E63] border-2 border-black flex items-center justify-center text-lg shadow-[2px_2px_0px_0px_#000]">
            {team1.mascot.emoji}
          </div>
          <span className="font-black text-sm text-white">{team1.name}</span>
          <span className="px-3 py-0.5 rounded-xl bg-[#FF2E63] text-white font-black text-sm border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            {team1.score}
          </span>
          <span className="text-xs font-black text-[#FFFB00] bg-black px-2 py-0.5 rounded-lg border border-black">Petak {team1Pos + 1}/{TOTAL_TILES}</span>
        </div>

        <div className="text-center">
          <span className="px-4 py-1.5 bg-black text-[#FFFB00] border-2 border-[#FFFB00] rounded-full font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000]">
            Petualangan Papan • Ronde {currentRound}/{maxRounds}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-[#08D9D6] bg-black px-2 py-0.5 rounded-lg border border-black">Petak {team2Pos + 1}/{TOTAL_TILES}</span>
          <span className="px-3 py-0.5 rounded-xl bg-[#08D9D6] text-black font-black text-sm border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            {team2.score}
          </span>
          <span className="font-black text-sm text-white">{team2.name}</span>
          <div className="w-9 h-9 rounded-xl bg-[#08D9D6] border-2 border-black flex items-center justify-center text-lg shadow-[2px_2px_0px_0px_#000]">
            {team2.mascot.emoji}
          </div>
        </div>
      </div>

      {/* Interactive Board Map View */}
      <div className="bg-black/60 border-4 border-black rounded-[2.5rem] p-5 shadow-[8px_8px_0px_0px_#000]">
        <div className="flex items-center justify-between mb-3 text-xs font-black text-white uppercase tracking-wider">
          <span className="flex items-center gap-1.5 text-[#FFFB00]">
            <Sparkles className="w-4 h-4" />
            PETA LINTASAN PULAU MATEMATIKA
          </span>
          <span className="bg-black px-3 py-1 rounded-full border-2 border-white/20">
            Giliran:{' '}
            <strong className={activeTurn === 'team1' ? 'text-[#FF2E63]' : 'text-[#08D9D6]'}>
              {currentTeam.name}
            </strong>
          </span>
        </div>

        {/* Board Tiles Track Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
          {Array.from({ length: TOTAL_TILES }).map((_, idx) => {
            const hasT1 = team1Pos === idx;
            const hasT2 = team2Pos === idx;
            const isStart = idx === 0;
            const isFinish = idx === TOTAL_TILES - 1;
            const isStar = idx === 4 || idx === 10;
            const isRocket = idx === 7;

            return (
              <div
                key={idx}
                className={`relative min-h-[74px] sm:min-h-[82px] rounded-2xl p-2 border-2 border-black flex flex-col justify-between transition-all shadow-[3px_3px_0px_0px_#000] ${
                  isFinish
                    ? 'bg-[#FFFB00] text-black'
                    : isStar
                    ? 'bg-[#00F0FF] text-black'
                    : isRocket
                    ? 'bg-[#FF2E63] text-white'
                    : isStart
                    ? 'bg-white text-black'
                    : 'bg-slate-900 text-white'
                }`}
              >
                {/* Tile Number & Icon */}
                <div className="flex items-center justify-between text-[10px] font-black">
                  <span className="font-mono">#{idx + 1}</span>
                  <span className="uppercase text-[9px] tracking-tight">
                    {isStart && '🚩 Mulai'}
                    {isFinish && '🏆 Finish'}
                    {isStar && '🌟 Bintang'}
                    {isRocket && '🚀 Roket'}
                  </span>
                </div>

                {/* Team Pawns / Avatars on this tile */}
                <div className="flex items-center justify-center gap-1.5 my-1">
                  {hasT1 && (
                    <motion.div
                      layoutId="pawn-t1"
                      className="w-8 h-8 rounded-xl bg-[#FF2E63] text-white border-2 border-black flex items-center justify-center text-base shadow-[2px_2px_0px_0px_#000] z-10"
                      title={team1.name}
                    >
                      {team1.mascot.emoji}
                    </motion.div>
                  )}
                  {hasT2 && (
                    <motion.div
                      layoutId="pawn-t2"
                      className="w-8 h-8 rounded-xl bg-[#08D9D6] text-black border-2 border-black flex items-center justify-center text-base shadow-[2px_2px_0px_0px_#000] z-10"
                      title={team2.name}
                    >
                      {team2.mascot.emoji}
                    </motion.div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Notification Banner */}
        {eventNotification && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 bg-[#FFFB00] text-center rounded-2xl border-2 border-black text-xs text-black font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000]"
          >
            {eventNotification}
          </motion.div>
        )}
      </div>

      {/* Math Challenge for Current Team Turn */}
      <div className="relative overflow-hidden bg-white border-4 sm:border-[6px] border-black rounded-[2.5rem] p-6 sm:p-8 text-center shadow-[10px_10px_0px_0px_#000] text-black">
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000] mb-3 ${
            activeTurn === 'team1' ? 'bg-[#FF2E63] text-white' : 'bg-[#08D9D6] text-black'
          }`}
        >
          <span className="text-base">{currentTeam.mascot.emoji}</span>
          <span>GILIRAN SOAL {currentTeam.name}</span>
        </div>

        <h2 className="text-4xl sm:text-6xl font-black text-black tracking-tight leading-none mt-1">
          {question.questionText}
        </h2>
        {question.subText && (
          <p className="text-xs sm:text-base text-black/80 font-bold mt-2 max-w-xl mx-auto">{question.subText}</p>
        )}

        {enableVisualAids && <VisualMathHelper question={question} />}

        {/* Multiple choice options */}
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto mt-5">
          {question.options.map((opt, idx) => (
            <button
              key={idx}
              disabled={selectedAnswer !== null || diceRolling}
              onClick={() => handleSelectAnswer(opt)}
              className={`pop-btn h-16 sm:h-20 rounded-2xl border-2 border-black text-2xl sm:text-3xl font-black transition-all cursor-pointer shadow-[4px_4px_0px_0px_#000] ${
                showExplanation && opt === question.correctAnswer
                  ? 'bg-[#FFFB00] text-black border-4 border-black scale-105'
                  : selectedAnswer === opt
                  ? activeTurn === 'team1'
                    ? 'bg-[#FF2E63] text-white border-4 border-black'
                    : 'bg-[#08D9D6] text-black border-4 border-black'
                  : 'bg-black hover:bg-black/80 text-white'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Dice Animation Indicator */}
        {diceRolling && (
          <div className="mt-4 flex items-center justify-center gap-2 text-black font-black text-sm uppercase tracking-wider bg-[#FFFB00] py-2 px-4 rounded-xl border-2 border-black max-w-xs mx-auto animate-bounce shadow-[3px_3px_0px_0px_#000]">
            <Dices className="w-5 h-5 animate-spin text-black" />
            MENGOCOK DADU LANGKAH...
          </div>
        )}

        {rolledDice !== null && (
          <div className="mt-3 text-center text-sm font-black text-black bg-[#FFFB00] py-1.5 px-4 rounded-xl border-2 border-black max-w-xs mx-auto uppercase tracking-wider shadow-[3px_3px_0px_0px_#000]">
            🎲 ANGKA DADU: +{rolledDice} LANGKAH!
          </div>
        )}
      </div>
    </div>
  );
};
