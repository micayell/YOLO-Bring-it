import { motion } from "framer-motion";

interface ScreenDisappearProps {
  timeLeft: number;
  isAnalyzing?: boolean;
  detectionResult?: { isPersonVisible: boolean; confidence: number };
  onDisappear: () => void;
}

export function ScreenDisappear({
  // timeLeft,
  isAnalyzing,
  detectionResult,
  onDisappear
}: ScreenDisappearProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border-2 border-[#8b5cf6]/30">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">👻</span>
        <span className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-base">화면에서 사라지기</span>
      </div>
      <div className="text-center">
        <div className="bg-purple-100 rounded-lg p-2 mb-1">
          <p className="font-bold text-purple-600 text-base">화면에서 사라지세요!</p>
        </div>
        <p className="text-xs text-gray-600">카메라 화면에서 벗어나세요!</p>
        <div className="mt-1 text-xs text-purple-500 font-bold">
          AI가 사람을 감지하고 있습니다
        </div>
        {isAnalyzing && (
          <div className="text-blue-600 text-xs mt-1">분석 중...</div>
        )}
        {detectionResult && (
          <div className="text-xs text-gray-500 mt-1">
            {detectionResult.isPersonVisible ? '사람 감지됨' : '사람 사라짐'}
            ({(detectionResult.confidence * 100).toFixed(1)}%)
          </div>
        )}
        <motion.button
          onClick={onDisappear}
          className="mt-2 bg-purple-500 text-white px-3 py-1 rounded text-xs"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          사라지기 시작!
        </motion.button>
      </div>
    </div>
  );
}
