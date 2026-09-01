import { useState } from 'react';
import { Play, Sparkles, Swords, Flame, Bell, Map, Users, Settings2, HelpCircle, Trophy, Shield, Zap, Check } from 'lucide-react';
import { GameMode, MathTopic, DifficultyLevel, TeamConfig, GameSettings } from '../types';
import { soundManager } from '../utils/audio';

const MASCOTS = [
  { name: 'Garuda', emoji: '🦅', description: 'Cepat & Berani' },
  { name: 'Harimau', emoji: '🐯', description: 'Tangkas & Kuat' },
  { name: 'Robot', emoji: '🤖', description: 'Presisi & Cerdas' },
  { name: 'Singa', emoji: '🦁', description: 'Raja Perhitungan' },
  { name: 'Dino', emoji: '🦖', description: 'Kekuatan Penuh' },
  { name: 'Lumba-lumba', emoji: '🐬', description: 'Cerdik & Lincah' },
  { name: 'Roket', emoji: '🚀', description: 'Kecepatan Cahaya' },
  { name: 'Ninja', emoji: '🥷', description: 'Fokus & Akurat' },
];

interface Props {
  onStartGame: (settings: GameSettings, team1: TeamConfig, team2: TeamConfig) => void;
  onOpenGuide: () => void;
}

export const LobbySetup = ({ onStartGame, onOpenGuide }: Props) => {
  const [mode, setMode] = useState<GameMode>('duel-split');
  const [topic, setTopic] = useState<MathTopic>('all');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [maxRounds, setMaxRounds] = useState<number>(10);
  const [timePerQuestionSec, setTimePerQuestionSec] = useState<number>(15);
  const [enablePowerUps, setEnablePowerUps] = useState<boolean>(true);
  const [enableVisualAids, setEnableVisualAids] = useState<boolean>(true);

  // Team 1 Config
  const [t1Name, setT1Name] = useState<string>('Tim Garuda');
  const [t1MascotIdx, setT1MascotIdx] = useState<number>(0); // Garuda

  // Team 2 Config
  const [t2Name, setT2Name] = useState<string>('Tim Rajawali');
  const [t2MascotIdx, setT2MascotIdx] = useState<number>(1); // Harimau

  const handleStart = () => {
    soundManager.playClick();
    soundManager.playFanfare();

    const team1: TeamConfig = {
      id: 'team1',
      name: t1Name.trim() || 'Tim Garuda',
      color: '#FF2E63',
      bgGradient: 'bg-[#FF2E63]',
      borderAccent: 'border-black',
      textColor: 'text-white',
      mascot: MASCOTS[t1MascotIdx],
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

    const team2: TeamConfig = {
      id: 'team2',
      name: t2Name.trim() || 'Tim Harimau',
      color: '#08D9D6',
      bgGradient: 'bg-[#08D9D6]',
      borderAccent: 'border-black',
      textColor: 'text-black',
      mascot: MASCOTS[t2MascotIdx],
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

    const settings: GameSettings = {
      mode,
      topic,
      difficulty,
      maxRounds,
      timePerQuestionSec,
      enablePowerUps,
      enableVisualAids,
      soundEnabled: true,
      buzzerKeyTeam1: 'A',
      buzzerKeyTeam2: 'L',
    };

    onStartGame(settings, team1, team2);
  };

  return (
    <div id="lobby-setup-view" className="w-full max-w-5xl mx-auto space-y-6">
      {/* Hero Banner Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[#120D31] border-4 border-black p-6 sm:p-10 shadow-[10px_10px_0px_0px_rgba(0,240,255,0.35)] text-center">
        <div className="flex flex-col items-center">
          <span className="bg-black text-[#00F0FF] px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-3 border border-[#00F0FF]/30">
            Educational Battle Arena • 2 Kelompok
          </span>

          <h1 className="text-4xl sm:text-6xl font-black italic tracking-tighter leading-none uppercase text-white mb-2">
            <span className="text-transparent text-stroke-white">ADU TANGKAS</span><br />
            <span className="text-[#FFFB00]">MATEMATIKA</span>
          </h1>

          <p className="text-[#08D9D6] text-xs sm:text-sm max-w-xl mx-auto font-bold mt-2">
            Arena Tanding Perkalian & Pembagian Interaktif. Pilih Mode, Kustomisasi Tim, dan Raih Juara Kelas!
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenGuide();
              }}
              className="pop-btn px-4 py-2.5 rounded-2xl bg-[#FFFB00] text-black font-black text-xs border-2 border-black shadow-[4px_4px_0px_0px_#000] flex items-center gap-2 cursor-pointer hover:bg-[#EBE700]"
            >
              <HelpCircle className="w-4 h-4 text-black" />
              PANDUAN & TRIK CEPAT
            </button>
          </div>
        </div>
      </div>

      {/* 1. Game Mode Selector */}
      <div className="bg-black/50 border-4 border-black rounded-[2.5rem] p-5 sm:p-7 shadow-[8px_8px_0px_0px_#000]">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 rounded-full bg-[#00F0FF] text-black text-xs font-black uppercase tracking-wider border-2 border-black">
            Langkah 1
          </span>
          <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Swords className="w-5 h-5 text-[#00F0FF]" />
            Pilih Mode Pertandingan
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Duel Split */}
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              setMode('duel-split');
            }}
            className={`pop-btn p-4 rounded-3xl border-4 border-black text-left transition-all relative cursor-pointer ${
              mode === 'duel-split'
                ? 'bg-[#FFFB00] text-black shadow-[6px_6px_0px_0px_#000] scale-[1.02]'
                : 'bg-white/10 text-white shadow-[4px_4px_0px_0px_#000] hover:bg-white/20'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl border-2 border-black flex items-center justify-center text-2xl mb-3 shadow-[2px_2px_0px_0px_#000] ${
              mode === 'duel-split' ? 'bg-black text-white' : 'bg-[#FF2E63] text-white'
            }`}>
              ⚔️
            </div>
            <h3 className="font-black text-base uppercase leading-tight">Duel Cepat (Split)</h3>
            <p className={`text-xs mt-1 font-medium leading-snug ${
              mode === 'duel-split' ? 'text-black/80' : 'text-slate-300'
            }`}>
              Layar terbagi dua, masing-masing kelompok memilih jawaban tercepat + kartu power-up.
            </p>
          </button>

          {/* Tug of War */}
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              setMode('tug-of-war');
            }}
            className={`pop-btn p-4 rounded-3xl border-4 border-black text-left transition-all relative cursor-pointer ${
              mode === 'tug-of-war'
                ? 'bg-[#FFFB00] text-black shadow-[6px_6px_0px_0px_#000] scale-[1.02]'
                : 'bg-white/10 text-white shadow-[4px_4px_0px_0px_#000] hover:bg-white/20'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl border-2 border-black flex items-center justify-center text-2xl mb-3 shadow-[2px_2px_0px_0px_#000] ${
              mode === 'tug-of-war' ? 'bg-black text-white' : 'bg-[#08D9D6] text-black'
            }`}>
              🪢
            </div>
            <h3 className="font-black text-base uppercase leading-tight">Tarik Tambang</h3>
            <p className={`text-xs mt-1 font-medium leading-snug ${
              mode === 'tug-of-war' ? 'text-black/80' : 'text-slate-300'
            }`}>
              Tarik tali tambang ke zona kelompokmu dengan menjawab benar & kombo beruntun!
            </p>
          </button>

          {/* Buzzer Clash */}
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              setMode('buzzer-clash');
            }}
            className={`pop-btn p-4 rounded-3xl border-4 border-black text-left transition-all relative cursor-pointer ${
              mode === 'buzzer-clash'
                ? 'bg-[#FFFB00] text-black shadow-[6px_6px_0px_0px_#000] scale-[1.02]'
                : 'bg-white/10 text-white shadow-[4px_4px_0px_0px_#000] hover:bg-white/20'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl border-2 border-black flex items-center justify-center text-2xl mb-3 shadow-[2px_2px_0px_0px_#000] ${
              mode === 'buzzer-clash' ? 'bg-black text-white' : 'bg-[#FF2E63] text-white'
            }`}>
              🔔
            </div>
            <h3 className="font-black text-base uppercase leading-tight">Rebutan Bel</h3>
            <p className={`text-xs mt-1 font-medium leading-snug ${
              mode === 'buzzer-clash' ? 'text-black/80' : 'text-slate-300'
            }`}>
              Soal utama proyektor, rebut bel dengan tombol keyboard [A] & [L] untuk menjawab!
            </p>
          </button>

          {/* Board Quest */}
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              setMode('board-quest');
            }}
            className={`pop-btn p-4 rounded-3xl border-4 border-black text-left transition-all relative cursor-pointer ${
              mode === 'board-quest'
                ? 'bg-[#FFFB00] text-black shadow-[6px_6px_0px_0px_#000] scale-[1.02]'
                : 'bg-white/10 text-white shadow-[4px_4px_0px_0px_#000] hover:bg-white/20'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl border-2 border-black flex items-center justify-center text-2xl mb-3 shadow-[2px_2px_0px_0px_#000] ${
              mode === 'board-quest' ? 'bg-black text-white' : 'bg-[#08D9D6] text-black'
            }`}>
              🗺️
            </div>
            <h3 className="font-black text-base uppercase leading-tight">Petualangan Papan</h3>
            <p className={`text-xs mt-1 font-medium leading-snug ${
              mode === 'board-quest' ? 'text-black/80' : 'text-slate-300'
            }`}>
              Balap bidak pulau matematika, lempar dadu langkah, petak roket & hadiah bintang.
            </p>
          </button>
        </div>
      </div>

      {/* 2. Team Customization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team 1 Setup (Hot Neon Pink) */}
        <div className="bg-[#FF2E63] border-4 border-black p-6 rounded-[2.5rem] shadow-[8px_8px_0px_0px_#000] relative text-white">
          <div className="absolute -top-4 -left-2 bg-black text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider border-2 border-white/20">
            Kelompok 1 (Kiri • Tombol A)
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-black text-white uppercase tracking-wider block mb-1">
                Nama Kelompok:
              </label>
              <input
                type="text"
                value={t1Name}
                onChange={(e) => setT1Name(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-black border-2 border-black text-white font-black text-base focus:outline-none shadow-inner"
                placeholder="Contoh: Tim Garuda"
              />
            </div>

            <div>
              <label className="text-xs font-black text-white uppercase tracking-wider block mb-1">
                Pilih Maskot:
              </label>
              <div className="flex flex-wrap gap-2">
                {MASCOTS.map((m, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setT1MascotIdx(idx);
                    }}
                    className={`pop-btn p-2.5 rounded-2xl border-2 border-black text-lg transition ${
                      t1MascotIdx === idx
                        ? 'bg-[#FFFB00] text-black scale-110 shadow-[3px_3px_0px_0px_#000]'
                        : 'bg-black/30 hover:bg-black/50 text-white'
                    }`}
                    title={m.name}
                  >
                    {m.emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Team 2 Setup (Vibrant Cyan) */}
        <div className="bg-[#08D9D6] border-4 border-black p-6 rounded-[2.5rem] shadow-[8px_8px_0px_0px_#000] relative text-black">
          <div className="absolute -top-4 -right-2 bg-black text-[#08D9D6] px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider border-2 border-black">
            Kelompok 2 (Kanan • Tombol L)
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-black text-black uppercase tracking-wider block mb-1">
                Nama Kelompok:
              </label>
              <input
                type="text"
                value={t2Name}
                onChange={(e) => setT2Name(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white border-2 border-black text-black font-black text-base focus:outline-none shadow-inner"
                placeholder="Contoh: Tim Harimau"
              />
            </div>

            <div>
              <label className="text-xs font-black text-black uppercase tracking-wider block mb-1">
                Pilih Maskot:
              </label>
              <div className="flex flex-wrap gap-2">
                {MASCOTS.map((m, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setT2MascotIdx(idx);
                    }}
                    className={`pop-btn p-2.5 rounded-2xl border-2 border-black text-lg transition ${
                      t2MascotIdx === idx
                        ? 'bg-[#FFFB00] text-black scale-110 shadow-[3px_3px_0px_0px_#000]'
                        : 'bg-black/15 hover:bg-black/30 text-black'
                    }`}
                    title={m.name}
                  >
                    {m.emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Game Content & Difficulty Settings */}
      <div className="bg-black/50 border-4 border-black rounded-[2.5rem] p-5 sm:p-7 shadow-[8px_8px_0px_0px_#000]">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 rounded-full bg-[#FFFB00] text-black text-xs font-black uppercase tracking-wider border-2 border-black">
            Langkah 3
          </span>
          <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-[#FFFB00]" />
            Pengaturan Materi & Tantangan
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Topic Select */}
          <div>
            <label className="text-xs font-black text-white uppercase tracking-wider block mb-2">
              Materi Matematika:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'all', label: 'Campuran Lengkap', icon: '🌟' },
                { id: 'multiplication', label: 'Khusus Perkalian (×)', icon: '✖️' },
                { id: 'division', label: 'Khusus Pembagian (:)', icon: '➗' },
                { id: 'mixed-word-problems', label: 'Soal Cerita Kontekstual', icon: '📖' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setTopic(t.id as MathTopic);
                  }}
                  className={`pop-btn p-3 rounded-2xl border-2 border-black text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                    topic === t.id
                      ? 'bg-[#00F0FF] text-black shadow-[4px_4px_0px_0px_#000]'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <span className="text-base">{t.icon}</span>
                  <span className="text-left leading-tight">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Select */}
          <div>
            <label className="text-xs font-black text-white uppercase tracking-wider block mb-2">
              Tingkat Kesulitan:
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'easy', label: 'Pemula', desc: 'Tabel 1-5, 10' },
                { id: 'medium', label: 'Menengah', desc: 'Tabel 1-10' },
                { id: 'hard', label: 'Mahir', desc: 'Puluhan & Besar' },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setDifficulty(d.id as DifficultyLevel);
                  }}
                  className={`pop-btn p-3 rounded-2xl border-2 border-black text-center transition cursor-pointer ${
                    difficulty === d.id
                      ? 'bg-[#FFFB00] text-black shadow-[4px_4px_0px_0px_#000]'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <div className="font-black text-xs uppercase">{d.label}</div>
                  <div className={`text-[10px] mt-0.5 font-bold ${
                    difficulty === d.id ? 'text-black/80' : 'text-slate-400'
                  }`}>{d.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rounds & Timer */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t-2 border-white/10">
          <div>
            <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider block mb-1">
              Jumlah Ronde:
            </label>
            <select
              value={maxRounds}
              onChange={(e) => setMaxRounds(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-2xl bg-black border-2 border-white/30 text-white font-black text-xs cursor-pointer focus:border-[#FFFB00] focus:outline-none"
            >
              <option value={5}>5 Ronde (Singkat)</option>
              <option value={10}>10 Ronde (Standar)</option>
              <option value={15}>15 Ronde (Seru)</option>
              <option value={20}>20 Ronde (Turnamen)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider block mb-1">
              Waktu per Soal:
            </label>
            <select
              value={timePerQuestionSec}
              onChange={(e) => setTimePerQuestionSec(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-2xl bg-black border-2 border-white/30 text-white font-black text-xs cursor-pointer focus:border-[#FFFB00] focus:outline-none"
            >
              <option value={10}>10 Detik (Kilat)</option>
              <option value={15}>15 Detik (Ideal)</option>
              <option value={25}>25 Detik (Santai)</option>
              <option value={0}>Tanpa Batas Waktu</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="cb-visual"
              checked={enableVisualAids}
              onChange={(e) => setEnableVisualAids(e.target.checked)}
              className="w-5 h-5 rounded-lg text-[#FFFB00] border-2 border-black focus:ring-0 cursor-pointer"
            />
            <label htmlFor="cb-visual" className="text-xs text-white font-bold cursor-pointer">
              Bantuan Visual Konsep
            </label>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="cb-powerups"
              checked={enablePowerUps}
              onChange={(e) => setEnablePowerUps(e.target.checked)}
              className="w-5 h-5 rounded-lg text-[#FF2E63] border-2 border-black focus:ring-0 cursor-pointer"
            />
            <label htmlFor="cb-powerups" className="text-xs text-white font-bold cursor-pointer">
              Kartu Power-Up (2x, Es, Bom)
            </label>
          </div>
        </div>
      </div>

      {/* Big Neon Start Button */}
      <div className="pt-2">
        <button
          id="btn-start-game"
          onClick={handleStart}
          className="pop-btn w-full py-5 px-8 rounded-3xl bg-[#FFFB00] hover:bg-[#EBE700] border-4 border-black text-black font-black text-xl sm:text-2xl shadow-[8px_8px_0px_0px_#000] uppercase tracking-tight flex items-center justify-center gap-3 cursor-pointer"
        >
          <Play className="w-7 h-7 fill-black text-black" />
          Mulai Pertandingan Sekarang!
        </button>
      </div>
    </div>
  );
};
