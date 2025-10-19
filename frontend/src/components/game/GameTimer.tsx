import { motion } from "framer-motion";

interface GameTimerProps {
  remainingTime: number;
  timeLimit: number;
}

export function GameTimer({ remainingTime, timeLimit }: GameTimerProps) {
  const formatGameTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      className="mt-6 text-center"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-6 border-2 border-[#6dc4e8]/30 shadow-lg">
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="text-2xl">⏰</span>
          <h2 className="text-2xl font-['BM_HANNA_TTF:Regular',_sans-serif] text-black tracking-wider">
            남은 시간
          </h2>
        </div>
        <div className="text-4xl font-bold text-red-500 mb-2">
          {formatGameTime(remainingTime)}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div 
            className="bg-red-500 h-3 rounded-full"
            initial={{ width: "100%" }}
            animate={{ width: `${(remainingTime / timeLimit) * 100}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>
    </motion.div>
  );
}
