import { MathQuestion } from '../types';
import { Layers, PieChart } from 'lucide-react';

interface Props {
  question: MathQuestion;
}

export const VisualMathHelper = ({ question }: Props) => {
  const visual = question.visualData;
  if (!visual) return null;

  const emoji = visual.itemEmoji || '⭐️';

  return (
    <div
      id="visual-math-helper"
      className="my-3 p-3.5 bg-black border-2 border-black rounded-2xl max-w-lg mx-auto shadow-[4px_4px_0px_0px_#000] text-white"
    >
      <div className="flex items-center justify-between gap-2 mb-2 text-xs font-black uppercase tracking-wider">
        <span className="flex items-center gap-1.5 text-[#FFFB00]">
          <Layers className="w-4 h-4 text-[#FFFB00]" />
          BANTUAN VISUAL KONSEP
        </span>
        <span className="text-[10px] text-black bg-[#08D9D6] px-2 py-0.5 rounded-lg border border-black font-black">
          {visual.type === 'groups' && 'Penjumlahan Berulang'}
          {visual.type === 'grid' && 'Array Baris × Kolom'}
          {visual.type === 'division-baskets' && 'Pembagian Sama Rata'}
        </span>
      </div>

      {visual.type === 'groups' && visual.groupsCount && visual.itemsPerGroup && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 py-1">
          {Array.from({ length: Math.min(6, visual.groupsCount) }).map((_, groupIdx) => (
            <div
              key={groupIdx}
              className="flex flex-col items-center p-2 rounded-xl bg-slate-900 border-2 border-white/20 shadow-[2px_2px_0px_0px_#000]"
            >
              <div className="flex flex-wrap justify-center gap-1 max-w-[80px]">
                {Array.from({ length: Math.min(10, visual.itemsPerGroup!) }).map((_, itemIdx) => (
                  <span key={itemIdx} className="text-base select-none">
                    {emoji}
                  </span>
                ))}
              </div>
              <span className="mt-1 text-[10px] font-black text-[#FFFB00] uppercase">
                Kelompok {groupIdx + 1} ({visual.itemsPerGroup})
              </span>
            </div>
          ))}
        </div>
      )}

      {visual.type === 'grid' && visual.groupsCount && visual.itemsPerGroup && (
        <div className="flex flex-col items-center gap-1 py-1">
          {Array.from({ length: Math.min(6, visual.groupsCount) }).map((_, rowIdx) => (
            <div key={rowIdx} className="flex items-center gap-1.5">
              <span className="text-[10px] text-[#FFFB00] font-mono font-black w-4 text-right">
                {rowIdx + 1}
              </span>
              <div className="flex gap-1 p-1 bg-slate-900 rounded-lg border border-white/20">
                {Array.from({ length: Math.min(8, visual.itemsPerGroup!) }).map((_, colIdx) => (
                  <span key={colIdx} className="text-base select-none">
                    {emoji}
                  </span>
                ))}
              </div>
            </div>
          ))}
          <span className="text-[11px] text-slate-300 mt-1 font-black uppercase tracking-wider">
            {visual.groupsCount} baris × {visual.itemsPerGroup} kolom
          </span>
        </div>
      )}

      {visual.type === 'division-baskets' && visual.groupsCount && visual.itemsPerGroup && (
        <div className="flex flex-col items-center gap-2 py-1">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {Array.from({ length: Math.min(6, visual.groupsCount) }).map((_, basketIdx) => (
              <div
                key={basketIdx}
                className="flex flex-col items-center p-2 rounded-xl bg-slate-900 border-2 border-white/20 shadow-[2px_2px_0px_0px_#000]"
              >
                <div className="flex flex-wrap justify-center gap-1 max-w-[80px] min-h-[28px]">
                  {Array.from({ length: Math.min(10, visual.itemsPerGroup!) }).map((_, itemIdx) => (
                    <span key={itemIdx} className="text-base select-none">
                      {emoji}
                    </span>
                  ))}
                </div>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-[#08D9D6] font-black uppercase">
                  <PieChart className="w-3 h-3" />
                  Wadah {basketIdx + 1}: {visual.itemsPerGroup} buah
                </div>
              </div>
            ))}
          </div>
          {visual.totalItems && (
            <span className="text-[11px] text-[#FFFB00] font-black uppercase tracking-wider">
              Total {visual.totalItems} dibagi ke {visual.groupsCount} wadah = {visual.itemsPerGroup} per wadah
            </span>
          )}
        </div>
      )}
    </div>
  );
};
