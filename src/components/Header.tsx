import { useState } from 'react';
import { Volume2, VolumeX, Maximize, Minimize, BookOpen, RotateCcw, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface Props {
  title?: string;
  gameStarted: boolean;
  onReset: () => void;
  onOpenGuide: () => void;
  soundEnabled: boolean;
  onToggleSound: (val: boolean) => void;
  currentRound?: number;
  maxRounds?: number;
  modeName?: string;
}

export const Header = ({
  gameStarted,
  onReset,
  onOpenGuide,
  soundEnabled,
  onToggleSound,
  currentRound,
  maxRounds,
  modeName,
}: Props) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    soundManager.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const handleSoundToggle = () => {
    const next = !soundEnabled;
    onToggleSound(next);
    soundManager.setSoundEnabled(next);
    if (next) soundManager.playClick();
  };

  return (
    <header
      id="game-header"
      className="sticky top-0 z-30 w-full bg-[#120D31]/90 backdrop-blur-md border-b-2 border-white/10 px-4 py-3 text-white transition-all"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#FF2E63] border-2 border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-center">
            <span className="text-2xl font-black select-none">⚔️</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[#00F0FF] font-black tracking-widest text-[10px] sm:text-xs uppercase">
                Educational Battle Arena
              </span>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black italic tracking-tighter uppercase leading-none">
                <span className="text-white">MATH</span>
                <span className="text-[#00F0FF]">DUEL</span>
              </h1>
              <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full bg-black text-[#FFFB00] border border-[#FFFB00]/40 text-[10px] font-black uppercase tracking-wider">
                Perkalian & Pembagian 2 Kelompok
              </span>
            </div>
            {gameStarted && modeName && (
              <p className="text-xs text-[#08D9D6] font-bold mt-0.5">
                {modeName} • <span className="text-[#FFFB00]">Ronde {currentRound}/{maxRounds}</span>
              </p>
            )}
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="btn-open-math-guide"
            onClick={() => {
              soundManager.playClick();
              onOpenGuide();
            }}
            className="pop-btn flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#FFFB00] hover:bg-[#EBE700] text-black font-black text-xs border-2 border-black shadow-[3px_3px_0px_0px_#000] cursor-pointer"
            title="Buka Panduan & Trik Cepat Matematika"
          >
            <BookOpen className="w-4 h-4 text-black" />
            <span className="hidden sm:inline">TRIK CEPAT</span>
          </button>

          <button
            id="btn-toggle-sound"
            onClick={handleSoundToggle}
            className={`pop-btn p-2 rounded-2xl border-2 border-black font-bold text-xs shadow-[3px_3px_0px_0px_#000] cursor-pointer transition ${
              soundEnabled
                ? 'bg-[#08D9D6] text-black hover:bg-[#00F0FF]'
                : 'bg-white/10 text-white/50 border-white/20'
            }`}
            title={soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            id="btn-toggle-fullscreen"
            onClick={toggleFullscreen}
            className="pop-btn p-2 rounded-2xl bg-white/10 hover:bg-white/20 border-2 border-white/20 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)] cursor-pointer transition"
            title="Layar Penuh (Proyektor/Smartboard)"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {gameStarted && (
            <button
              id="btn-header-reset"
              onClick={() => {
                soundManager.playClick();
                onReset();
              }}
              className="pop-btn flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#FF2E63] hover:bg-[#E02656] text-white text-xs font-black border-2 border-black shadow-[3px_3px_0px_0px_#000] cursor-pointer"
              title="Ganti Mode / Pengaturan Ulang"
            >
              <RotateCcw className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">LOBI UTAMA</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
