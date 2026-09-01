import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Flame, Shield, Snowflake, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { MathQuestion, TeamConfig, PowerUpType, QuestionHistoryItem } from '../../types';
import { soundManager } from '../../utils/audio';
import { VisualMathHelper } from '../VisualMathHelper';

interface Props {
  currentRound: number;
  maxRounds: number;
  question: MathQuestion;
  team1: TeamConfig;
  team2: TeamConfig;
  timePerQuestionSec: number;
  enablePowerUps: boolean;
  enableVisualAids: boolean;
  onQuestionCompleted: (
    team1Ans: number | null,
    team2Ans: number | null,
    team1Correct: boolean,
    team2Correct: boolean,
    timeMs1: number,
    timeMs2: number
  ) => void;
  onUsePowerUp: (teamId: 'team1' | 'team2', powerUpType: PowerUpType) => void;
}

export const SplitScreenDuel = ({
  currentRound,
  maxRounds,
  question,
  team1,
  team2,
  timePerQuestionSec,
  enablePowerUps,
  enableVisualAids,
  onQuestionCompleted,
  onUsePowerUp,
}: Props) => {
  const [timeLeft, setTimeLeft] = useState<number>(timePerQuestionSec || 15);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [team1Selected, setTeam1Selected] = useState<number | null>(null);
  const [team2Selected, setTeam2Selected] = useState<number | null>(null);
  const [team1AnswerTime, setTeam1AnswerTime] = useState<number>(0);
  const [team2AnswerTime, setTeam2AnswerTime] = useState<number>(0);
  const [showResultFeedback, setShowResultFeedback] = useState<boolean>(false);
  const [eliminatedOptionsT1, setEliminatedOptionsT1] = useState<number[]>([]);
  const [eliminatedOptionsT2, setEliminatedOptionsT2] = useState<number[]>([]);

  // Check freeze status
  const isT1Frozen = team1.activePowerUps.some((p) => p.type === 'freeze');
  const isT2Frozen = team2.activePowerUps.some((p) => p.type === 'freeze');

  // Reset states on new question
  useEffect(() => {
    setTimeLeft(timePerQuestionSec > 0 ? timePerQuestionSec : 0);
    setStartTime(Date.now());
    setTeam1Selected(null);
    setTeam2Selected(null);
    setTeam1AnswerTime(0);
    setTeam2AnswerTime(0);
    setShowResultFeedback(false);
    setEliminatedOptionsT1([]);
    setEliminatedOptionsT2([]);
  }, [question, timePerQuestionSec]);

  // Timer countdown
  useEffect(() => {
    if (timePerQuestionSec <= 0 || showResultFeedback) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeExpired();
          return 0;
        }
        if (prev <= 4) soundManager.playTick();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timePerQuestionSec, showResultFeedback, team1Selected, team2Selected]);

  const handleTimeExpired = () => {
    soundManager.playWrong();
    finishRound(team1Selected, team2Selected);
  };

  const handleSelectAnswer = (teamId: 'team1' | 'team2', answer: number) => {
    const elapsed = Date.now() - startTime;
    soundManager.playClick();

    let newT1 = team1Selected;
    let newT2 = team2Selected;

    if (teamId === 'team1') {
      if (team1Selected !== null || isT1Frozen) return;
      newT1 = answer;
      setTeam1Selected(answer);
      setTeam1AnswerTime(elapsed);
    } else {
      if (team2Selected !== null || isT2Frozen) return;
      newT2 = answer;
      setTeam2Selected(answer);
      setTeam2AnswerTime(elapsed);
    }

    // If both answered, complete round after short visual delay
    if ((teamId === 'team1' && newT2 !== null) || (teamId === 'team2' && newT1 !== null)) {
      finishRound(newT1, newT2, elapsed);
    }
  };

  const finishRound = (ans1: number | null, ans2: number | null, overrideElapsed?: number) => {
    setShowResultFeedback(true);

    const t1Correct = ans1 === question.correctAnswer;
    const t2Correct = ans2 === question.correctAnswer;

    if (t1Correct || t2Correct) {
      soundManager.playCorrect(Math.max(team1.streak, team2.streak));
    } else {
      soundManager.playWrong();
    }

    const t1Time = team1AnswerTime || (overrideElapsed ?? 1000);
    const t2Time = team2AnswerTime || (overrideElapsed ?? 1000);

    setTimeout(() => {
      onQuestionCompleted(ans1, ans2, t1Correct, t2Correct, t1Time, t2Time);
    }, 2200);
  };

  const applyBomb5050 = (teamId: 'team1' | 'team2') => {
    const wrongOptions = question.options.filter((opt) => opt !== question.correctAnswer);
    const shuffled = [...wrongOptions].sort(() => 0.5 - Math.random());
    const toEliminate = shuffled.slice(0, 2);

    if (teamId === 'team1') {
      setEliminatedOptionsT1(toEliminate);
    } else {
      setEliminatedOptionsT2(toEliminate);
    }
    onUsePowerUp(teamId, 'bomb-5050');
  };

  return (
    <div id="split-screen-duel-mode" className="w-full max-w-7xl mx-auto flex flex-col gap-4">
      {/* Top Match Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-black/60 border-4 border-black rounded-3xl shadow-[6px_6px_0px_0px_#000]">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#FF2E63] border-2 border-black flex items-center justify-center text-lg shadow-[2px_2px_0px_0px_#000]">
            {team1.mascot.emoji}
          </div>
          <span className="text-sm font-black text-white">{team1.name}</span>
          <span className="px-3 py-0.5 rounded-xl bg-[#FF2E63] border-2 border-black text-white font-black text-sm shadow-[2px_2px_0px_0px_#000]">
            {team1.score}
          </span>
          {team1.streak > 1 && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-black text-[#FFFB00] animate-pulse">
              <Flame className="w-4 h-4 fill-[#FFFB00] text-black" />
              {team1.streak}x 🔥
            </span>
          )}
        </div>

        {/* Center Round & Timer */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-white bg-black px-3.5 py-1 rounded-full border-2 border-white/20 uppercase tracking-wider">
            Ronde {currentRound}/{maxRounds}
          </span>

          {timePerQuestionSec > 0 && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-black font-mono font-black text-xs transition ${
                timeLeft <= 4
                  ? 'bg-[#FF2E63] text-white animate-bounce shadow-[3px_3px_0px_0px_#000]'
                  : 'bg-[#FFFB00] text-black shadow-[3px_3px_0px_0px_#000]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{timeLeft}s</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {team2.streak > 1 && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-black text-[#FFFB00] animate-pulse">
              <Flame className="w-4 h-4 fill-[#FFFB00] text-black" />
              {team2.streak}x 🔥
            </span>
          )}
          <span className="px-3 py-0.5 rounded-xl bg-[#08D9D6] border-2 border-black text-black font-black text-sm shadow-[2px_2px_0px_0px_#000]">
            {team2.score}
          </span>
          <span className="text-sm font-black text-white">{team2.name}</span>
          <div className="w-9 h-9 rounded-xl bg-[#08D9D6] border-2 border-black flex items-center justify-center text-lg shadow-[2px_2px_0px_0px_#000]">
            {team2.mascot.emoji}
          </div>
        </div>
      </div>

      {/* Central High-Contrast Pop Question Card */}
      <div className="relative overflow-hidden bg-white border-4 sm:border-[6px] border-black rounded-[2.5rem] p-6 sm:p-8 text-center shadow-[10px_10px_0px_0px_#000] text-black">
        <div className="inline-flex items-center gap-2 bg-black text-[#00F0FF] px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-3 border border-[#00F0FF]/40">
          {question.topic === 'word-problem'
            ? 'Soal Cerita Matematika'
            : question.operator === 'x'
            ? 'Tantangan Perkalian'
            : 'Tantangan Pembagian'}
        </div>

        <div className="mt-1 mb-2">
          <h2 className="text-4xl sm:text-6xl font-black text-black tracking-tight leading-none">
            {question.questionText}
          </h2>
          {question.subText && (
            <p className="text-xs sm:text-base text-black/80 font-bold mt-2 max-w-xl mx-auto">
              {question.subText}
            </p>
          )}
        </div>

        {/* Optional Visual Aid */}
        {enableVisualAids && <VisualMathHelper question={question} />}

        {/* Feedback explanation reveal */}
        <AnimatePresence>
          {showResultFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 p-4 bg-black border-2 border-black rounded-2xl max-w-xl mx-auto text-xs text-white shadow-[4px_4px_0px_0px_#000]"
            >
              <div className="font-black text-[#FFFB00] text-sm mb-1">
                KUNCI JAWABAN: <span className="text-white bg-[#08D9D6] text-black px-2 py-0.5 rounded-lg">{question.correctAnswer}</span>
              </div>
              <p className="text-slate-300 text-xs font-medium">{question.explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Split Duel Control Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Team 1 Control Area (Hot Neon Pink) */}
        <div
          className={`p-5 rounded-[2.5rem] border-4 border-black transition-all shadow-[8px_8px_0px_0px_#000] relative ${
            isT1Frozen
              ? 'bg-[#FF2E63]/70 opacity-70'
              : 'bg-[#FF2E63] text-white'
          }`}
        >
          <div className="absolute -top-3.5 -left-2 bg-black text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border-2 border-white/20">
            Kelompok 1 (Kiri)
          </div>

          {/* Team 1 Header & Power-ups */}
          <div className="flex items-center justify-between mb-4 pt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-black text-white flex items-center justify-center text-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                {team1.mascot.emoji}
              </div>
              <div>
                <h3 className="font-black text-white text-base leading-tight">{team1.name}</h3>
                <span className="text-xs font-black text-[#FFFB00] uppercase tracking-wider">Pilih Jawaban</span>
              </div>
            </div>

            {/* Powerups inventory */}
            {enablePowerUps && (
              <div className="flex items-center gap-1.5">
                {team1.inventory.includes('double-points') && (
                  <button
                    onClick={() => onUsePowerUp('team1', 'double-points')}
                    className="pop-btn px-2.5 py-1 rounded-xl bg-[#FFFB00] text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs flex items-center gap-1 cursor-pointer"
                    title="Aktifkan 2x Poin"
                  >
                    <Zap className="w-3.5 h-3.5" /> 2x
                  </button>
                )}
                {team1.inventory.includes('bomb-5050') && eliminatedOptionsT1.length === 0 && (
                  <button
                    onClick={() => applyBomb5050('team1')}
                    className="pop-btn px-2.5 py-1 rounded-xl bg-white text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs flex items-center gap-1 cursor-pointer"
                    title="Bom 50:50 (Hapus 2 Opsi Salah)"
                  >
                    💣 50:50
                  </button>
                )}
                {team1.inventory.includes('freeze') && (
                  <button
                    onClick={() => onUsePowerUp('team1', 'freeze')}
                    className="pop-btn px-2.5 py-1 rounded-xl bg-[#08D9D6] text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs flex items-center gap-1 cursor-pointer"
                    title="Bekukan Tim Lawan"
                  >
                    <Snowflake className="w-3.5 h-3.5" /> ES
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Active status alerts */}
          {isT1Frozen && (
            <div className="mb-3 p-2.5 bg-black border-2 border-black rounded-2xl text-xs text-[#08D9D6] font-black flex items-center justify-center gap-2 animate-pulse">
              <Snowflake className="w-4 h-4 text-[#08D9D6]" />
              TOMBOL MEMBEKU! TUNGGU SEBENTAR...
            </div>
          )}

          {/* Options Grid for Team 1 */}
          <div className="grid grid-cols-2 gap-3">
            {question.options.map((option, idx) => {
              const isEliminated = eliminatedOptionsT1.includes(option);
              const isSelected = team1Selected === option;
              const isCorrect = option === question.correctAnswer;

              let btnStyle =
                'bg-black hover:bg-black/80 text-white border-2 border-black shadow-[4px_4px_0px_0px_#000]';

              if (showResultFeedback) {
                if (isCorrect) {
                  btnStyle = 'bg-[#FFFB00] text-black border-4 border-black font-black shadow-[4px_4px_0px_0px_#000] scale-105';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'bg-black text-white border-2 border-black opacity-50';
                } else {
                  btnStyle = 'bg-black/30 border-2 border-black/50 text-white/40';
                }
              } else if (isSelected) {
                btnStyle =
                  'bg-[#FFFB00] text-black border-4 border-black font-black shadow-[4px_4px_0px_0px_#000] scale-105';
              }

              return (
                <button
                  key={idx}
                  disabled={team1Selected !== null || showResultFeedback || isT1Frozen || isEliminated}
                  onClick={() => handleSelectAnswer('team1', option)}
                  className={`pop-btn h-16 sm:h-20 rounded-2xl text-2xl sm:text-3xl font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${btnStyle} ${
                    isEliminated ? 'opacity-20 cursor-not-allowed line-through' : ''
                  }`}
                >
                  <span>{option}</span>
                  {showResultFeedback && isSelected && (
                    <span>
                      {isCorrect ? (
                        <CheckCircle2 className="w-6 h-6 text-black" />
                      ) : (
                        <XCircle className="w-6 h-6 text-white" />
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {team1Selected !== null && !showResultFeedback && (
            <div className="mt-3 text-center text-xs font-black text-white bg-black/60 py-1.5 rounded-xl animate-pulse">
              ✓ TERKUNCI ({team1Selected})! Menunggu tim lawan...
            </div>
          )}
        </div>

        {/* Team 2 Control Area (Vibrant Cyan) */}
        <div
          className={`p-5 rounded-[2.5rem] border-4 border-black transition-all shadow-[8px_8px_0px_0px_#000] relative ${
            isT2Frozen
              ? 'bg-[#08D9D6]/70 opacity-70'
              : 'bg-[#08D9D6] text-black'
          }`}
        >
          <div className="absolute -top-3.5 -right-2 bg-black text-[#08D9D6] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border-2 border-black">
            Kelompok 2 (Kanan)
          </div>

          {/* Team 2 Header & Power-ups */}
          <div className="flex items-center justify-between mb-4 pt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-white text-black flex items-center justify-center text-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                {team2.mascot.emoji}
              </div>
              <div>
                <h3 className="font-black text-black text-base leading-tight">{team2.name}</h3>
                <span className="text-xs font-black text-black/70 uppercase tracking-wider">Pilih Jawaban</span>
              </div>
            </div>

            {/* Powerups inventory */}
            {enablePowerUps && (
              <div className="flex items-center gap-1.5">
                {team2.inventory.includes('double-points') && (
                  <button
                    onClick={() => onUsePowerUp('team2', 'double-points')}
                    className="pop-btn px-2.5 py-1 rounded-xl bg-[#FFFB00] text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs flex items-center gap-1 cursor-pointer"
                    title="Aktifkan 2x Poin"
                  >
                    <Zap className="w-3.5 h-3.5" /> 2x
                  </button>
                )}
                {team2.inventory.includes('bomb-5050') && eliminatedOptionsT2.length === 0 && (
                  <button
                    onClick={() => applyBomb5050('team2')}
                    className="pop-btn px-2.5 py-1 rounded-xl bg-white text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs flex items-center gap-1 cursor-pointer"
                    title="Bom 50:50 (Hapus 2 Opsi Salah)"
                  >
                    💣 50:50
                  </button>
                )}
                {team2.inventory.includes('freeze') && (
                  <button
                    onClick={() => onUsePowerUp('team2', 'freeze')}
                    className="pop-btn px-2.5 py-1 rounded-xl bg-[#FF2E63] text-white font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs flex items-center gap-1 cursor-pointer"
                    title="Bekukan Tim Lawan"
                  >
                    <Snowflake className="w-3.5 h-3.5" /> ES
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Active status alerts */}
          {isT2Frozen && (
            <div className="mb-3 p-2.5 bg-black border-2 border-black rounded-2xl text-xs text-[#08D9D6] font-black flex items-center justify-center gap-2 animate-pulse">
              <Snowflake className="w-4 h-4 text-[#08D9D6]" />
              TOMBOL MEMBEKU! TUNGGU SEBENTAR...
            </div>
          )}

          {/* Options Grid for Team 2 */}
          <div className="grid grid-cols-2 gap-3">
            {question.options.map((option, idx) => {
              const isEliminated = eliminatedOptionsT2.includes(option);
              const isSelected = team2Selected === option;
              const isCorrect = option === question.correctAnswer;

              let btnStyle =
                'bg-white hover:bg-white/80 text-black border-2 border-black shadow-[4px_4px_0px_0px_#000]';

              if (showResultFeedback) {
                if (isCorrect) {
                  btnStyle = 'bg-[#FFFB00] text-black border-4 border-black font-black shadow-[4px_4px_0px_0px_#000] scale-105';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'bg-black text-white border-2 border-black opacity-50';
                } else {
                  btnStyle = 'bg-black/15 border-2 border-black/30 text-black/40';
                }
              } else if (isSelected) {
                btnStyle =
                  'bg-[#FFFB00] text-black border-4 border-black font-black shadow-[4px_4px_0px_0px_#000] scale-105';
              }

              return (
                <button
                  key={idx}
                  disabled={team2Selected !== null || showResultFeedback || isT2Frozen || isEliminated}
                  onClick={() => handleSelectAnswer('team2', option)}
                  className={`pop-btn h-16 sm:h-20 rounded-2xl text-2xl sm:text-3xl font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${btnStyle} ${
                    isEliminated ? 'opacity-20 cursor-not-allowed line-through' : ''
                  }`}
                >
                  <span>{option}</span>
                  {showResultFeedback && isSelected && (
                    <span>
                      {isCorrect ? (
                        <CheckCircle2 className="w-6 h-6 text-black" />
                      ) : (
                        <XCircle className="w-6 h-6 text-white" />
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {team2Selected !== null && !showResultFeedback && (
            <div className="mt-3 text-center text-xs font-black text-black bg-white/60 py-1.5 rounded-xl animate-pulse">
              ✓ TERKUNCI ({team2Selected})! Menunggu tim lawan...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
