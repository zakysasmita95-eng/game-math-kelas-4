import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Award, Zap, CheckCircle2, XCircle, ArrowRight, BookOpen } from 'lucide-react';
import { TeamConfig, QuestionHistoryItem } from '../types';
import { soundManager } from '../utils/audio';

interface Props {
  isOpen: boolean;
  team1: TeamConfig;
  team2: TeamConfig;
  history: QuestionHistoryItem[];
  onPlayAgain: () => void;
  onBackToLobby: () => void;
  onOpenGuide: () => void;
}

export const VictoryModal = ({
  isOpen,
  team1,
  team2,
  history,
  onPlayAgain,
  onBackToLobby,
  onOpenGuide,
}: Props) => {
  const isDraw = team1.score === team2.score;
  const winner = team1.score > team2.score ? team1 : team2;
  const loser = team1.score > team2.score ? team2 : team1;

  useEffect(() => {
    if (isOpen) {
      soundManager.playFanfare();

      // Confetti burst
      const count = 200;
      const defaults = {
        origin: { y: 0.6 },
        zIndex: 9999,
      };

      function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });
      fire(0.2, {
        spread: 60,
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const team1TotalAns = team1.correctCount + team1.wrongCount;
  const team1Accuracy = team1TotalAns > 0 ? Math.round((team1.correctCount / team1TotalAns) * 100) : 0;
  const team1AvgSpeed =
    team1.correctCount > 0
      ? (team1.totalAnswerTimeMs / (team1.correctCount * 1000)).toFixed(1)
      : '0.0';

  const team2TotalAns = team2.correctCount + team2.wrongCount;
  const team2Accuracy = team2TotalAns > 0 ? Math.round((team2.correctCount / team2TotalAns) * 100) : 0;
  const team2AvgSpeed =
    team2.correctCount > 0
      ? (team2.totalAnswerTimeMs / (team2.correctCount * 1000)).toFixed(1)
      : '0.0';

  return (
    <div
      id="victory-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl bg-[#120D31] border-4 sm:border-[6px] border-black rounded-[2.5rem] p-6 sm:p-8 shadow-[12px_12px_0px_0px_#000] text-white my-auto max-h-[94vh] flex flex-col">
        {/* Top Banner */}
        <div className="text-center pb-4 border-b-2 border-black/50">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#FFFB00] text-black border-4 border-black shadow-[6px_6px_0px_0px_#000] mb-3 animate-bounce">
            <Trophy className="w-10 h-10 sm:w-14 sm:h-14" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
            {isDraw ? (
              <span className="text-[#FFFB00]">
                HASIL SERI! PERTANDINGAN LUAR BIASA! 🤝
              </span>
            ) : (
              <span className="text-[#FFFB00]">
                🏆 {winner.name} MERAIH KEMENANGAN!
              </span>
            )}
          </h2>
          <p className="text-xs sm:text-base text-slate-300 font-bold mt-1">
            Kerja sama dan kecepatan berhitung kalian sangat luar biasa!
          </p>
        </div>

        {/* Team Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-5">
          {/* Team 1 Card */}
          <div
            className={`p-5 rounded-[2rem] border-4 border-black transition-all shadow-[6px_6px_0px_0px_#000] bg-[#FF2E63] text-white`}
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center text-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  {team1.mascot.emoji}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-lg text-white leading-tight">{team1.name}</h3>
                    {winner.id === team1.id && !isDraw && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FFFB00] text-black font-black text-[10px] border border-black shadow-[1px_1px_0px_0px_#000]">
                        JUARA 1
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-[#FFFB00]">{team1.mascot.name}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-white">{team1.score}</div>
                <div className="text-[10px] text-white/80 font-black uppercase tracking-wider">Total Poin</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-black border-2 border-black text-center text-xs text-white shadow-[2px_2px_0px_0px_#000]">
              <div>
                <div className="text-slate-400 text-[10px] font-bold uppercase">Benar</div>
                <div className="font-black text-[#FFFB00] text-base">{team1.correctCount}</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px] font-bold uppercase">Akurasi</div>
                <div className="font-black text-[#00F0FF] text-base">{team1Accuracy}%</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px] font-bold uppercase">Streak</div>
                <div className="font-black text-[#FF2E63] text-base">{team1.maxStreak}x 🔥</div>
              </div>
            </div>
          </div>

          {/* Team 2 Card */}
          <div
            className={`p-5 rounded-[2rem] border-4 border-black transition-all shadow-[6px_6px_0px_0px_#000] bg-[#08D9D6] text-black`}
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center text-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  {team2.mascot.emoji}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-lg text-black leading-tight">{team2.name}</h3>
                    {winner.id === team2.id && !isDraw && (
                      <span className="px-2.5 py-0.5 rounded-full bg-black text-[#FFFB00] font-black text-[10px] border border-black shadow-[1px_1px_0px_0px_#000]">
                        JUARA 1
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-black/70">{team2.mascot.name}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-black">{team2.score}</div>
                <div className="text-[10px] text-black/80 font-black uppercase tracking-wider">Total Poin</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-black border-2 border-black text-center text-xs text-white shadow-[2px_2px_0px_0px_#000]">
              <div>
                <div className="text-slate-400 text-[10px] font-bold uppercase">Benar</div>
                <div className="font-black text-[#FFFB00] text-base">{team2.correctCount}</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px] font-bold uppercase">Akurasi</div>
                <div className="font-black text-[#08D9D6] text-base">{team2Accuracy}%</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px] font-bold uppercase">Streak</div>
                <div className="font-black text-[#FF2E63] text-base">{team2.maxStreak}x 🔥</div>
              </div>
            </div>
          </div>
        </div>

        {/* Question Review Section */}
        <div className="flex-1 overflow-y-auto border-4 border-black rounded-[2rem] p-4 bg-black/40 mb-5 shadow-[4px_4px_0px_0px_#000]">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs sm:text-sm font-black text-[#FFFB00] uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-[#FFFB00]" />
              EVALUASI & PEMBAHASAN SOAL MATEMATIKA
            </h4>
            <button
              onClick={onOpenGuide}
              className="text-xs text-[#00F0FF] hover:underline flex items-center gap-1 font-black uppercase tracking-wider cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Buka Trik & Rumus
            </button>
          </div>

          <div className="space-y-2.5">
            {history.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4 font-bold">Belum ada riwayat soal.</p>
            ) : (
              history.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-black border-2 border-black text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-[2px_2px_0px_0px_#000]"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2 font-black text-white text-sm">
                      <span className="w-6 h-6 rounded-full bg-[#FFFB00] text-black flex items-center justify-center text-xs font-black">
                        {idx + 1}
                      </span>
                      <span>{item.question.questionText}</span>
                      <span className="text-[#08D9D6] font-mono font-black">
                        (Kunci: {item.question.correctAnswer})
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs font-medium pl-8">
                      💡 {item.question.explanation}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs self-end sm:self-center font-black">
                    {item.team1Answer !== undefined && (
                      <span
                        className={`px-3 py-1 rounded-xl flex items-center gap-1 border-2 border-black ${
                          item.team1Correct
                            ? 'bg-[#FFFB00] text-black'
                            : 'bg-[#FF2E63] text-white'
                        }`}
                      >
                        {team1.mascot.emoji} {item.team1Answer}
                        {item.team1Correct ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-white" />
                        )}
                      </span>
                    )}

                    {item.team2Answer !== undefined && (
                      <span
                        className={`px-3 py-1 rounded-xl flex items-center gap-1 border-2 border-black ${
                          item.team2Correct
                            ? 'bg-[#FFFB00] text-black'
                            : 'bg-[#08D9D6] text-black'
                        }`}
                      >
                        {team2.mascot.emoji} {item.team2Answer}
                        {item.team2Correct ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-black" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={() => {
              soundManager.playClick();
              onBackToLobby();
            }}
            className="pop-btn w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-black text-white font-black text-xs sm:text-sm border-2 border-white/20 transition flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_0px_0px_#000] uppercase tracking-wider"
          >
            <RotateCcw className="w-4 h-4" />
            Kembali ke Lobi
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onPlayAgain();
            }}
            className="pop-btn w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#FFFB00] text-black font-black text-sm sm:text-base border-4 border-black shadow-[6px_6px_0px_0px_#000] transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <Zap className="w-5 h-5 fill-black" />
            TANDING ULANG SEKARANG!
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
