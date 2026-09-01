import { useState } from 'react';
import { X, Sparkles, BookOpen, Calculator, HelpCircle, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const MaterialGuideModal = ({ isOpen, onClose }: Props) => {
  const [activeTab, setActiveTab] = useState<'concepts' | 'tricks' | 'table'>('tricks');
  const [tableHighlightX, setTableHighlightX] = useState<number | null>(7);
  const [tableHighlightY, setTableHighlightY] = useState<number | null>(8);

  if (!isOpen) return null;

  return (
    <div
      id="material-guide-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl bg-[#120D31] border-4 sm:border-[6px] border-black rounded-[2.5rem] p-6 sm:p-8 shadow-[12px_12px_0px_0px_#000] text-white my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFFB00] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_0px_#000]">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                Pusat Belajar & Trik Cepat Perkalian-Pembagian
                <Sparkles className="w-5 h-5 text-[#FFFB00]" />
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-bold">
                Panduan materi matematika interaktif untuk siswa dan guru
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="pop-btn p-2.5 rounded-2xl bg-black border-2 border-black text-white hover:bg-black/80 transition cursor-pointer shadow-[2px_2px_0px_0px_#000]"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 mt-4 p-1.5 bg-black rounded-2xl border-2 border-black">
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('tricks');
            }}
            className={`pop-btn flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition cursor-pointer border-2 ${
              activeTab === 'tricks'
                ? 'bg-[#FFFB00] text-black border-black shadow-[3px_3px_0px_0px_#000]'
                : 'text-white border-transparent hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Trik Cepat
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('concepts');
            }}
            className={`pop-btn flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition cursor-pointer border-2 ${
              activeTab === 'concepts'
                ? 'bg-[#08D9D6] text-black border-black shadow-[3px_3px_0px_0px_#000]'
                : 'text-white border-transparent hover:bg-white/10'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Konsep Dasar
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('table');
            }}
            className={`pop-btn flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition cursor-pointer border-2 ${
              activeTab === 'table'
                ? 'bg-[#00F0FF] text-black border-black shadow-[3px_3px_0px_0px_#000]'
                : 'text-white border-transparent hover:bg-white/10'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Tabel 1-10
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-4">
          {activeTab === 'tricks' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Trik 9 */}
              <div className="p-5 rounded-[2rem] bg-white border-4 border-black text-black shadow-[6px_6px_0px_0px_#000]">
                <div className="flex items-center gap-2 text-black font-black text-base mb-2">
                  <span className="text-2xl">🖐️</span> TRIK 10 JARI PERKALIAN 9
                </div>
                <p className="text-xs text-black/80 font-bold leading-relaxed mb-3">
                  Bentangkan 10 jarimu. Misal ingin menghitung <strong>9 × 4</strong>:
                </p>
                <div className="bg-black p-3.5 rounded-2xl border-2 border-black text-xs space-y-1.5 font-bold text-[#FFFB00] shadow-[2px_2px_0px_0px_#000]">
                  <div>1. Lipat jari ke-4 dari kiri.</div>
                  <div>2. Jumlah jari di kiri lipatan = <span className="text-[#08D9D6] font-black">3</span> (Puluhan = 30).</div>
                  <div>3. Jumlah jari di kanan lipatan = <span className="text-[#08D9D6] font-black">6</span> (Satuan = 6).</div>
                  <div className="pt-1 text-white font-black">👉 Hasilnya: 9 × 4 = 36!</div>
                </div>
              </div>

              {/* Trik Hubungan Perkalian & Pembagian */}
              <div className="p-5 rounded-[2rem] bg-white border-4 border-black text-black shadow-[6px_6px_0px_0px_#000]">
                <div className="flex items-center gap-2 text-black font-black text-base mb-2">
                  <span className="text-2xl">🔄</span> SEGITIGA AJAIB INVERS
                </div>
                <p className="text-xs text-black/80 font-bold leading-relaxed mb-3">
                  Perkalian dan pembagian adalah operasi berkebalikan (invers):
                </p>
                <div className="bg-black p-3.5 rounded-2xl border-2 border-black text-xs space-y-1 text-white font-bold shadow-[2px_2px_0px_0px_#000]">
                  <div className="text-center font-black text-[#FFFB00] text-sm">7 × 8 = 56</div>
                  <div className="text-center text-slate-400 text-xs">maka otomatis:</div>
                  <div className="flex justify-around pt-1 text-[#08D9D6] font-black text-sm">
                    <span>56 : 8 = 7</span>
                    <span>56 : 7 = 8</span>
                  </div>
                </div>
              </div>

              {/* Trik Perkalian 5 */}
              <div className="p-5 rounded-[2rem] bg-white border-4 border-black text-black shadow-[6px_6px_0px_0px_#000]">
                <div className="flex items-center gap-2 text-black font-black text-base mb-2">
                  <span className="text-2xl">⚡</span> TRIK KILAT PERKALIAN 5
                </div>
                <p className="text-xs text-black/80 font-bold leading-relaxed mb-2">
                  Mengalikan dengan 5 sama dengan <strong>mengalikan 10 lalu dibagi 2</strong> (atau separuh angka ditempel 0).
                </p>
                <div className="bg-black p-3.5 rounded-2xl border-2 border-black text-xs space-y-1 text-[#FFFB00] font-bold shadow-[2px_2px_0px_0px_#000]">
                  <div>• Contoh: <strong>5 × 18</strong></div>
                  <div>• Separuh dari 18 adalah <strong>9</strong>, lalu tempel 0 ➔ <strong>90</strong>!</div>
                </div>
              </div>

              {/* Trik Pembagian Kelipatan */}
              <div className="p-5 rounded-[2rem] bg-white border-4 border-black text-black shadow-[6px_6px_0px_0px_#000]">
                <div className="flex items-center gap-2 text-black font-black text-base mb-2">
                  <span className="text-2xl">🎯</span> TRIK PECAH ANGKA
                </div>
                <p className="text-xs text-black/80 font-bold leading-relaxed mb-2">
                  Pecah angka besar menjadi angka yang mudah dibagi:
                </p>
                <div className="bg-black p-3.5 rounded-2xl border-2 border-black text-xs space-y-1 text-[#00F0FF] font-bold shadow-[2px_2px_0px_0px_#000]">
                  <div>• Hitung <strong>96 : 4</strong></div>
                  <div>• Pecah 96 menjadi <strong>80 + 16</strong></div>
                  <div>• 80 : 4 = <strong>20</strong>, dan 16 : 4 = <strong>4</strong></div>
                  <div>• Jumlahkan: 20 + 4 = <strong>24</strong>!</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'concepts' && (
            <div className="space-y-4">
              <div className="p-5 rounded-[2rem] bg-white border-4 border-black text-black shadow-[6px_6px_0px_0px_#000]">
                <h3 className="text-base font-black text-black mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-black" />
                  1. Perkalian sebagai Penjumlahan Berulang
                </h3>
                <p className="text-xs sm:text-sm text-black/80 font-bold leading-relaxed">
                  Arti dari <strong>a × b</strong> adalah menjumlahkan bilangan <strong>b</strong> sebanyak <strong>a</strong> kali.
                </p>
                <div className="mt-3 p-3.5 rounded-2xl bg-black border-2 border-black text-sm font-black text-[#FFFB00]">
                  4 × 5 = 5 + 5 + 5 + 5 = 20
                </div>
                <p className="text-xs text-black/70 font-semibold mt-2">
                  (Ada 4 keranjang, setiap keranjang berisi 5 buah apel = Total 20 apel)
                </p>
              </div>

              <div className="p-5 rounded-[2rem] bg-white border-4 border-black text-black shadow-[6px_6px_0px_0px_#000]">
                <h3 className="text-base font-black text-black mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-black" />
                  2. Pembagian sebagai Pengurangan Berulang & Pembagian Sama Rata
                </h3>
                <p className="text-xs sm:text-sm text-black/80 font-bold leading-relaxed">
                  Arti dari <strong>a : b</strong> adalah mengurangi <strong>a</strong> dengan <strong>b</strong> secara berulang sampai habis bernilai 0.
                </p>
                <div className="mt-3 p-3.5 rounded-2xl bg-black border-2 border-black text-sm font-black text-[#08D9D6]">
                  15 : 3 = 15 - 3 - 3 - 3 - 3 - 3 = 0 (Terjadi 5 kali pengurangan, maka 15 : 3 = 5)
                </div>
              </div>
            </div>
          )}

          {activeTab === 'table' && (
            <div className="flex flex-col items-center">
              <p className="text-xs text-slate-300 font-bold mb-3 text-center uppercase tracking-wider">
                Klik angka pada tabel untuk melihat hasil perkalian & pembagian secara instan!
              </p>

              <div className="overflow-x-auto w-full max-w-2xl bg-black p-4 rounded-[2rem] border-4 border-black shadow-[6px_6px_0px_0px_#000]">
                <div className="grid grid-cols-11 gap-1.5 text-center font-mono text-xs">
                  {/* Top-left corner */}
                  <div className="p-2 font-black text-black bg-[#FFFB00] rounded-xl border border-black">×</div>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className={`p-2 font-black rounded-xl border border-black ${
                        tableHighlightX === i + 1
                          ? 'bg-[#FFFB00] text-black shadow-[2px_2px_0px_0px_#000]'
                          : 'bg-slate-800 text-white'
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}

                  {/* Rows */}
                  {Array.from({ length: 10 }).map((_, r) => {
                    const rowNum = r + 1;
                    return (
                      <div key={r} className="contents">
                        <div
                          className={`p-2 font-black rounded-xl border border-black ${
                            tableHighlightY === rowNum
                              ? 'bg-[#08D9D6] text-black shadow-[2px_2px_0px_0px_#000]'
                              : 'bg-slate-800 text-white'
                          }`}
                        >
                          {rowNum}
                        </div>
                        {Array.from({ length: 10 }).map((_, c) => {
                          const colNum = c + 1;
                          const product = rowNum * colNum;
                          const isSelected =
                            tableHighlightX === colNum && tableHighlightY === rowNum;
                          const isHighlighted =
                            tableHighlightX === colNum || tableHighlightY === rowNum;

                          return (
                            <button
                              key={c}
                              onClick={() => {
                                soundManager.playClick();
                                setTableHighlightX(colNum);
                                setTableHighlightY(rowNum);
                              }}
                              className={`p-2 rounded-xl text-[11px] sm:text-xs transition font-black border border-black cursor-pointer ${
                                isSelected
                                  ? 'bg-[#FFFB00] text-black font-black scale-110 shadow-[3px_3px_0px_0px_#000] z-10'
                                  : isHighlighted
                                  ? 'bg-[#08D9D6] text-black'
                                  : 'bg-slate-900 text-slate-300 hover:bg-white/20 hover:text-white'
                              }`}
                            >
                              {product}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>

              {tableHighlightX && tableHighlightY && (
                <div className="mt-4 p-4 rounded-2xl bg-white border-4 border-black text-center text-xs sm:text-sm text-black max-w-md w-full shadow-[4px_4px_0px_0px_#000]">
                  <div className="font-black text-lg text-black">
                    {tableHighlightY} × {tableHighlightX} = {tableHighlightY * tableHighlightX}
                  </div>
                  <div className="text-black/80 font-bold text-xs mt-1">
                    {tableHighlightY * tableHighlightX} : {tableHighlightX} = {tableHighlightY} &nbsp;|&nbsp;{' '}
                    {tableHighlightY * tableHighlightX} : {tableHighlightY} = {tableHighlightX}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t-2 border-black flex justify-end">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="pop-btn px-6 py-3 rounded-2xl bg-[#FFFB00] text-black font-black text-sm border-4 border-black shadow-[4px_4px_0px_0px_#000] transition cursor-pointer uppercase tracking-wider"
          >
            Tutup & Lanjutkan Game
          </button>
        </div>
      </div>
    </div>
  );
};
