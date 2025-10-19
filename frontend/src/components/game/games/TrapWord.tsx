

interface TrapWordProps {
  forbiddenWord: string;
  usageCount: number;
  timeLeft: number;
}

export function TrapWord({ forbiddenWord, usageCount }: TrapWordProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border-2 border-[#ef4444]/30">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">🚫</span>
        <span className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-base">금지 단어</span>
      </div>
      <div className="text-center">
        <div className="bg-red-100 rounded-lg p-2 mb-1">
          <p className="font-bold text-red-600 text-base">"{forbiddenWord}"</p>
        </div>
        <p className="text-xs text-gray-600">이 단어를 사용하지 마세요!</p>
        <div className="mt-1 text-xs text-red-500 font-bold">
          사용 횟수: {usageCount}회
        </div>
      </div>
    </div>
  );
}
