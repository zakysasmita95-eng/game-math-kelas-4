import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Flame, Zap, Shield, Trophy, CheckCircle2, XCircle } from 'lucide-react';
import { MathQuestion, TeamConfig, PowerUpType } from '../../types';
import { soundManager } from '../../utils/audio';
import { VisualMathHelper } from '../VisualMathHelper';

interface Props {
  currentRound: number;
  maxRounds: number;
  question: MathQuestion;
  team1: TeamConfig;
  team2: TeamConfig;
  enablePowerUps: boolean;
  enableVisualAids: boolean;
  onQuestionCompleted: (
    team1Ans: number | null,
    team2Ans: number | null,
    team1Correct: boolean,
    team2Correct: boolean,
    timeMs1: number,
    timeMs2: number,
    ropeDelta: number
  ) => void;
  onUsePowerUp: (teamId: 'team1' | 'team2', powerUpType: PowerUpType) => void;
  ropePosition: number; // -100 (Team 1 wins) to +100 (Team 2 wins)
}

export const TugOfWarMode = ({
  currentRound,
  maxRounds,
  question,
  team1,
  team2,
  enablePowerUps,
  enableVisualAids,
  onQuestionCompleted,
  onUsePowerUp,
  ropePosition,
}: Props) => {
  const [team1Selected, setTeam1Selected] = useState<number | null>(null);
  const [team2Selected, setTeam2Selected] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [lastPullText, setLastPullText] = useState<string>('');

  useEffect(() => {
    setTeam1Selected(null);
    setTeam2Selected(null);
    setStartTime(Date.now());
    setShowFeedback(false);
    setLastPullText('');
  }, [question]);

  const handleSelectAnswer = (teamId: 'team1' | 'team2', answer: number) => {
    soundManager.playClick();
    const elapsed = Date.now() - startTime;

    let newT1 = team1Selected;
    let newT2 = team2Selected;

    if (teamId === 'team1') {
      if (team1Selected !== null) return;
      newT1 = answer;
      setTeam1Selected(answer);
    } else {
      if (team2Selected !== null) return;
      newT2 = answer;
      setTeam2Selected(answer);
    }

    if ((teamId === 'team1' && newT2 !== null) || (teamId === 'team2' && newT1 !== null)) {
      evaluateTugOfWar(newT1, newT2, elapsed);
    }
  };

  const evaluateTugOfWar = (ans1: number | null, ans2: number | null, elapsed: number) => {
    setShowFeedback(true);
    const t1Correct = ans1 === question.correctAnswer;
    const t2Correct = ans2 === question.correctAnswer;

    // Calculate rope delta: negative pulls left (team1), positive pulls right (team2)
    let delta = 0;
    let pullMsg = '';

    const t1Double = team1.activePowerUps.some((p) => p.type === 'double-points') ? 2 : 1;
    const t2Double = team2.activePowerUps.some((p) => p.type === 'double-points') ? 2 : 1;

    if (t1Correct && !t2Correct) {
      const pullAmount = 25 * t1Double * (1 + (team1.streak >= 2 ? 0.5 : 0));
      delta = -pullAmount;
      pullMsg = `🔥 ${team1.name} menarik tali sebesar ${Math.round(pullAmount)} meter ke kiri!`;
      soundManager.playTugPull();
      soundManager.playCorrect(team1.streak);
    } else if (t2Correct && !t1Correct) {
      const pullAmount = 25 * t2Double * (1 + (team2.streak >= 2 ? 0.5 : 0));
      delta = pullAmount;
      pullMsg = `🔥 ${team2.name} menarik tali sebesar ${Math.round(pullAmount)} meter ke kanan!`;
      soundManager.playTugPull();
      soundManager.playCorrect(team2.streak);
    } else if (t1Correct && t2Correct) {
      pullMsg = `⚡ Kedua tim menjawab benar! Posisi tali bertahan seimbang.`;
      soundManager.playCorrect(1);
    } else {
      pullMsg = `❌ Kedua tim belum tepat! Tali tidak bergerak.`;
      soundManager.playWrong();
    }

    setLastPullText(pullMsg);

    setTimeout(() => {
      onQuestionCompleted(ans1, ans2, t1Correct, t2Correct, elapsed, elapsed, delta);
    }, 2400);
  };

  // Convert ropePosition (-100 to +100) into 0% to 100% css percentage
  // -100 = 0% (Team 1 end zone), 0 = 50% (Center), +100 = 100% (Team 2 end zone)
  const ropePercentage = Math.min(100, Math.max(0, 50 + ropePosition / 2));

  return (
    <div id="tug-of-war-mode" className="w-full max-w-7xl mx-auto flex flex-col gap-4">
      {/* Top Banner & Tug of War Arena Stage */}
      <div className="bg-black/60 border-4 border-black rounded-[2.5rem] p-5 sm:p-7 shadow-[8px_8px_0px_0px_#000] relative overflow-hidden">
        {/* Stage Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FF2E63] border-2 border-black flex items-center justify-center text-xl shadow-[2px_2px_0px_0px_#000]">
              {team1.mascot.emoji}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white leading-tight">{team1.name}</h3>
              <span className="text-[10px] font-black text-[#FF2E63] uppercase tracking-wider">Zona Merah (Kiri)</span>
            </div>
          </div>

          <div className="text-center">
            <span className="px-4 py-1.5 bg-black border-2 border-[#FFFB00] text-[#FFFB00] rounded-full font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000]">
              Tarik Tambang • Ronde {currentRound}/{maxRounds}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-right">
            <div>
              <h3 className="text-sm sm:text-base font-black text-white leading-tight">{team2.name}</h3>
              <span className="text-[10px] font-black text-[#08D9D6] uppercase tracking-wider">Zona Biru (Kanan)</span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#08D9D6] border-2 border-black flex items-center justify-center text-xl shadow-[2px_2px_0px_0px_#000]">
              {team2.mascot.emoji}
            </div>
          </div>
        </div>

        {/* The Visual Rope & Tug Track */}
        <div className="relative py-8 px-2">
          {/* Ground Track */}
          <div className="h-8 bg-black rounded-full border-4 border-black overflow-hidden relative flex items-center shadow-inner">
            {/* Team 1 Win Zone */}
            <div className="w-1/4 h-full bg-[#FF2E63] border-r-2 border-black flex items-center justify-center text-[10px] font-black text-white uppercase tracking-wider">
              Zona Menang
            </div>
            {/* Neutral Center Zone */}
            <div className="w-2/4 h-full bg-white/10 relative flex items-center justify-center">
              <div className="w-1 h-full bg-white"></div>
            </div>
            {/* Team 2 Win Zone */}
            <div className="w-1/4 h-full bg-[#08D9D6] border-l-2 border-black flex items-center justify-center text-[10px] font-black text-black uppercase tracking-wider">
              Zona Menang
            </div>
          </div>

          {/* Animated Rope & Characters */}
          <div
            className="absolute top-0 bottom-0 transition-all duration-700 ease-out flex flex-col items-center pointer-events-none"
            style={{ left: `${ropePercentage}%`, transform: 'translateX(-50%)' }}
          >
            {/* Center Flag / Knot */}
            <motion.div
              animate={{ rotate: [-6, 6, -6], y: [-3, 3, -3] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="flex flex-col items-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FFFB00] text-black border-2 border-black flex items-center justify-center text-2xl font-black shadow-[3px_3px_0px_0px_#000] z-20">
                🚩
              </div>
              <div className="w-2 h-10 bg-[#FFFB00] border-x border-black"></div>
              <span className="text-[10px] font-black bg-black text-[#FFFB00] px-3 py-0.5 rounded-full border-2 border-black whitespace-nowrap mt-1 uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]">
                {ropePosition === 0
                  ? 'SEIMBANG'
                  : ropePosition < 0
                  ? `${Math.abs(Math.round(ropePosition))}% ke ${team1.name}`
                  : `${Math.abs(Math.round(ropePosition))}% ke ${team2.name}`}
              </span>
            </motion.div>
          </div>
        </div>

        {/* Pull message banner */}
        {lastPullText && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-2 text-center text-xs sm:text-sm font-black text-black bg-[#FFFB00] p-2.5 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000]"
          >
            {lastPullText}
          </motion.div>
        )}
      </div>

      {/* Central Question Display */}
      <div className="relative overflow-hidden bg-white border-4 sm:border-[6px] border-black rounded-[2.5rem] p-6 text-center shadow-[10px_10px_0px_0px_#000] text-black">
        <div className="inline-flex items-center gap-2 bg-black text-[#00F0FF] px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-2 border border-[#00F0FF]/40">
          {question.topic === 'word-problem'
            ? 'Tantangan Cerita Tarik Tambang'
            : `Operasi Hitung: ${question.operator === 'x' ? 'Perkalian' : 'Pembagian'}`}
        </div>
        <h2 className="text-4xl sm:text-6xl font-black text-black tracking-tight leading-none mt-1">
          {question.questionText}
        </h2>
        {question.subText && (
          <p className="text-xs sm:text-base text-black/80 font-bold mt-2 max-w-xl mx-auto">{question.subText}</p>
        )}

        {enableVisualAids && <VisualMathHelper question={question} />}

        {showFeedback && (
          <div className="mt-4 p-3.5 bg-black rounded-2xl border-2 border-black text-xs text-white max-w-md mx-auto shadow-[4px_4px_0px_0px_#000]">
            <span className="font-black text-[#FFFB00]">KUNCI JAWABAN: {question.correctAnswer}</span>
            <p className="text-slate-300 text-xs mt-1">{question.explanation}</p>
          </div>
        )}
      </div>

      {/* 2-Side Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Team 1 Controls (Hot Neon Pink) */}
        <div className="p-5 rounded-[2.5rem] bg-[#FF2E63] border-4 border-black shadow-[8px_8px_0px_0px_#000] relative text-white">
          <div className="absolute -top-3.5 -left-2 bg-black text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border-2 border-white/20">
            Kelompok 1 (Kiri)
          </div>

          <div className="flex items-center justify-between mb-4 pt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center text-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                {team1.mascot.emoji}
              </div>
              <span className="font-black text-white text-base">{team1.name} (Tarik Kiri)</span>
            </div>
            {enablePowerUps && team1.inventory.includes('double-points') && (
              <button
                onClick={() => onUsePowerUp('team1', 'double-points')}
                className="pop-btn px-2.5 py-1 rounded-xl bg-[#FFFB00] text-black border-2 border-black text-xs font-black shadow-[2px_2px_0px_0px_#000] cursor-pointer"
              >
                ⚡ TARIKAN 2x
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {question.options.map((opt, idx) => (
              <button
                key={idx}
                disabled={team1Selected !== null || showFeedback}
                onClick={() => handleSelectAnswer('team1', opt)}
                className={`pop-btn h-16 sm:h-20 rounded-2xl border-2 border-black text-2xl sm:text-3xl font-black transition-all cursor-pointer shadow-[4px_4px_0px_0px_#000] ${
                  showFeedback && opt === question.correctAnswer
                    ? 'bg-[#FFFB00] text-black border-4 border-black scale-105'
                    : team1Selected === opt
                    ? 'bg-[#FFFB00] text-black border-4 border-black'
                    : 'bg-black hover:bg-black/80 text-white'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Team 2 Controls (Vibrant Cyan) */}
        <div className="p-5 rounded-[2.5rem] bg-[#08D9D6] border-4 border-black shadow-[8px_8px_0px_0px_#000] relative text-black">
          <div className="absolute -top-3.5 -right-2 bg-black text-[#08D9D6] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border-2 border-black">
            Kelompok 2 (Kanan)
          </div>

          <div className="flex items-center justify-between mb-4 pt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center text-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                {team2.mascot.emoji}
              </div>
              <span className="font-black text-black text-base">{team2.name} (Tarik Kanan)</span>
            </div>
            {enablePowerUps && team2.inventory.includes('double-points') && (
              <button
                onClick={() => onUsePowerUp('team2', 'double-points')}
                className="pop-btn px-2.5 py-1 rounded-xl bg-[#FFFB00] text-black border-2 border-black text-xs font-black shadow-[2px_2px_0px_0px_#000] cursor-pointer"
              >
                ⚡ TARIKAN 2x
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {question.options.map((opt, idx) => (
              <button
                key={idx}
                disabled={team2Selected !== null || showFeedback}
                onClick={() => handleSelectAnswer('team2', opt)}
                className={`pop-btn h-16 sm:h-20 rounded-2xl border-2 border-black text-2xl sm:text-3xl font-black transition-all cursor-pointer shadow-[4px_4px_0px_0px_#000] ${
                  showFeedback && opt === question.correctAnswer
                    ? 'bg-[#FFFB00] text-black border-4 border-black scale-105'
                    : team2Selected === opt
                    ? 'bg-[#FFFB00] text-black border-4 border-black'
                    : 'bg-white hover:bg-white/80 text-black'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
