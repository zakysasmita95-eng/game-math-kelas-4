import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Clock, Zap, CheckCircle2, XCircle, Volume2, ShieldAlert } from 'lucide-react';
import { MathQuestion, TeamConfig } from '../../types';
import { soundManager } from '../../utils/audio';
import { VisualMathHelper } from '../VisualMathHelper';

interface Props {
  currentRound: number;
  maxRounds: number;
  question: MathQuestion;
  team1: TeamConfig;
  team2: TeamConfig;
  buzzerKeyTeam1: string; // e.g. 'A'
  buzzerKeyTeam2: string; // e.g. 'L'
  enableVisualAids: boolean;
  onQuestionCompleted: (
    team1Ans: number | null,
    team2Ans: number | null,
    team1Correct: boolean,
    team2Correct: boolean,
    timeMs1: number,
    timeMs2: number
  ) => void;
}

export const BuzzerClashMode = ({
  currentRound,
  maxRounds,
  question,
  team1,
  team2,
  buzzerKeyTeam1,
  buzzerKeyTeam2,
  enableVisualAids,
  onQuestionCompleted,
}: Props) => {
  const [buzzedTeam, setBuzzedTeam] = useState<'team1' | 'team2' | null>(null);
  const [answerTimeLeft, setAnswerTimeLeft] = useState<number>(7);
  const [isStealOpportunity, setIsStealOpportunity] = useState<boolean>(false);
  const [team1Ans, setTeam1Ans] = useState<number | null>(null);
  const [team2Ans, setTeam2Ans] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Reset state on new question
  useEffect(() => {
    setBuzzedTeam(null);
    setAnswerTimeLeft(7);
    setIsStealOpportunity(false);
    setTeam1Ans(null);
    setTeam2Ans(null);
    setShowExplanation(false);
  }, [question]);

  // Keyboard shortcut listener for buzzers
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (buzzedTeam !== null || showExplanation) return;

      const key = e.key.toUpperCase();
      if (key === buzzerKeyTeam1.toUpperCase()) {
        triggerBuzzer('team1');
      } else if (key === buzzerKeyTeam2.toUpperCase()) {
        triggerBuzzer('team2');
      }
    },
    [buzzedTeam, showExplanation, buzzerKeyTeam1, buzzerKeyTeam2]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Answer countdown after buzzer is pressed
  useEffect(() => {
    if (buzzedTeam === null || showExplanation) return;

    const timer = setInterval(() => {
      setAnswerTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAnswerTimeout();
          return 0;
        }
        if (prev <= 3) soundManager.playTick();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [buzzedTeam, showExplanation]);

  const triggerBuzzer = (teamId: 'team1' | 'team2') => {
    if (buzzedTeam !== null || showExplanation) return;
    soundManager.playBuzzer(teamId);
    setBuzzedTeam(teamId);
    setAnswerTimeLeft(7);
  };

  const handleAnswerTimeout = () => {
    soundManager.playWrong();
    if (!isStealOpportunity) {
      // Give steal chance to the opponent
      const opponent = buzzedTeam === 'team1' ? 'team2' : 'team1';
      setIsStealOpportunity(true);
      setBuzzedTeam(opponent);
      setAnswerTimeLeft(7);
    } else {
      // Both failed
      finishBuzzerRound(team1Ans, team2Ans);
    }
  };

  const handleSelectAnswer = (chosenAnswer: number) => {
    soundManager.playClick();
    const isCorrect = chosenAnswer === question.correctAnswer;

    if (buzzedTeam === 'team1') {
      setTeam1Ans(chosenAnswer);
      if (isCorrect) {
        soundManager.playCorrect(team1.streak);
        finishBuzzerRound(chosenAnswer, team2Ans);
      } else {
        soundManager.playWrong();
        if (!isStealOpportunity) {
          // Grant steal opportunity to team2
          setIsStealOpportunity(true);
          setBuzzedTeam('team2');
          setAnswerTimeLeft(7);
        } else {
          finishBuzzerRound(chosenAnswer, team2Ans);
        }
      }
    } else if (buzzedTeam === 'team2') {
      setTeam2Ans(chosenAnswer);
      if (isCorrect) {
        soundManager.playCorrect(team2.streak);
        finishBuzzerRound(team1Ans, chosenAnswer);
      } else {
        soundManager.playWrong();
        if (!isStealOpportunity) {
          // Grant steal opportunity to team1
          setIsStealOpportunity(true);
          setBuzzedTeam('team1');
          setAnswerTimeLeft(7);
        } else {
          finishBuzzerRound(team1Ans, chosenAnswer);
        }
      }
    }
  };

  const finishBuzzerRound = (ans1: number | null, ans2: number | null) => {
    setShowExplanation(true);
    const t1Correct = ans1 === question.correctAnswer;
    const t2Correct = ans2 === question.correctAnswer;

    setTimeout(() => {
      onQuestionCompleted(ans1, ans2, t1Correct, t2Correct, 1000, 1000);
    }, 2800);
  };

  const activeTeamObj = buzzedTeam === 'team1' ? team1 : team2;

  return (
    <div id="buzzer-clash-mode" className="w-full max-w-6xl mx-auto flex flex-col gap-4">
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
        </div>

        <div className="text-center">
          <span className="px-4 py-1.5 bg-black text-[#FFFB00] border-2 border-[#FFFB00] rounded-full font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000]">
            Rebutan Bel • Ronde {currentRound}/{maxRounds}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-0.5 rounded-xl bg-[#08D9D6] text-black font-black text-sm border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            {team2.score}
          </span>
          <span className="font-black text-sm text-white">{team2.name}</span>
          <div className="w-9 h-9 rounded-xl bg-[#08D9D6] border-2 border-black flex items-center justify-center text-lg shadow-[2px_2px_0px_0px_#000]">
            {team2.mascot.emoji}
          </div>
        </div>
      </div>

      {/* Main Classroom Projection Display */}
      <div className="relative overflow-hidden bg-white border-4 sm:border-[6px] border-black rounded-[2.5rem] p-6 sm:p-8 text-center shadow-[10px_10px_0px_0px_#000] text-black">
        {/* Status Badge */}
        <div className="mb-3">
          {buzzedTeam === null ? (
            <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#FFFB00] text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] animate-pulse">
              <Bell className="w-4 h-4" />
              SIAP! TEKAN BEL CEPAT UNTUK MENJAWAB
            </span>
          ) : (
            <span
              className={`inline-flex items-center gap-2 px-5 py-1.5 rounded-full text-xs font-black border-2 border-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] ${
                isStealOpportunity
                  ? 'bg-[#FF2E63] text-white'
                  : 'bg-[#08D9D6] text-black'
              }`}
            >
              {isStealOpportunity ? (
                <>
                  <ShieldAlert className="w-4 h-4 text-white" />
                  KESEMPATAN REBUT: {activeTeamObj.name}
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-black" />
                  BEL BERBUNYI! GILIRAN {activeTeamObj.name}
                </>
              )}
            </span>
          )}
        </div>

        {/* Question Text */}
        <h2 className="text-4xl sm:text-6xl font-black text-black tracking-tight leading-none">
          {question.questionText}
        </h2>
        {question.subText && (
          <p className="text-sm sm:text-base text-black/80 font-bold mt-2 max-w-xl mx-auto">
            {question.subText}
          </p>
        )}

        {enableVisualAids && <VisualMathHelper question={question} />}

        {/* Buzzer Answer Time Bar */}
        {buzzedTeam !== null && !showExplanation && (
          <div className="mt-5 max-w-sm mx-auto">
            <div className="flex items-center justify-between text-xs font-black text-black uppercase tracking-wider mb-1">
              <span>Waktu Menjawab:</span>
              <span className="text-[#FF2E63] font-mono text-sm">{answerTimeLeft}s</span>
            </div>
            <div className="w-full h-4 bg-black rounded-full overflow-hidden border-2 border-black p-0.5">
              <div
                className="h-full bg-[#FFFB00] rounded-full transition-all duration-1000"
                style={{ width: `${(answerTimeLeft / 7) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Options Grid (Enabled only for the team that pressed buzzer) */}
        {buzzedTeam !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 grid grid-cols-2 gap-3 max-w-md mx-auto"
          >
            {question.options.map((opt, idx) => (
              <button
                key={idx}
                disabled={showExplanation}
                onClick={() => handleSelectAnswer(opt)}
                className={`pop-btn h-16 sm:h-20 rounded-2xl border-2 border-black text-2xl sm:text-3xl font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_0px_0px_#000] ${
                  showExplanation && opt === question.correctAnswer
                    ? 'bg-[#FFFB00] text-black border-4 border-black scale-105'
                    : 'bg-black hover:bg-black/80 text-white'
                }`}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}

        {/* Explanation Card */}
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 p-4 bg-black rounded-2xl border-2 border-black text-xs text-white max-w-lg mx-auto shadow-[4px_4px_0px_0px_#000]"
          >
            <div className="font-black text-[#FFFB00] text-sm">
              KUNCI JAWABAN: {question.correctAnswer}
            </div>
            <p className="text-slate-300 text-xs mt-1 font-medium">{question.explanation}</p>
          </motion.div>
        )}
      </div>

      {/* Big Physical/Screen Buzzer Buttons for 2 Teams */}
      {buzzedTeam === null && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Team 1 Buzzer */}
          <button
            id="buzzer-team-1"
            onClick={() => triggerBuzzer('team1')}
            className="pop-btn p-7 rounded-[2.5rem] bg-[#FF2E63] text-white font-black shadow-[8px_8px_0px_0px_#000] border-4 border-black transition-all flex flex-col items-center justify-center gap-2 text-center cursor-pointer min-h-[160px]"
          >
            <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center text-3xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              🔔
            </div>
            <div className="text-2xl sm:text-3xl font-black tracking-tight">{team1.name}</div>
            <span className="text-xs bg-black text-[#FFFB00] px-4 py-1 rounded-full border border-black font-mono font-black uppercase tracking-wider">
              TEKAN BEL / TOMBOL [{buzzerKeyTeam1}]
            </span>
          </button>

          {/* Team 2 Buzzer */}
          <button
            id="buzzer-team-2"
            onClick={() => triggerBuzzer('team2')}
            className="pop-btn p-7 rounded-[2.5rem] bg-[#08D9D6] text-black font-black shadow-[8px_8px_0px_0px_#000] border-4 border-black transition-all flex flex-col items-center justify-center gap-2 text-center cursor-pointer min-h-[160px]"
          >
            <div className="w-16 h-16 rounded-2xl bg-white text-black flex items-center justify-center text-3xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              🔔
            </div>
            <div className="text-2xl sm:text-3xl font-black tracking-tight">{team2.name}</div>
            <span className="text-xs bg-black text-[#08D9D6] px-4 py-1 rounded-full border border-black font-mono font-black uppercase tracking-wider">
              TEKAN BEL / TOMBOL [{buzzerKeyTeam2}]
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
