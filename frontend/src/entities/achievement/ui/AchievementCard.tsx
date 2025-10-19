import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import type { Achievement } from "@/shared/types/achievements";
import { DIFFICULTY_COLORS } from "@/shared/constants/achievements";
import { getRewardIcon, getRewardText } from "@/shared/utils/achievements";

interface AchievementCardProps {
  achievement: Achievement;
  index: number;
  onClick: (achievement: Achievement) => void;
}

export function AchievementCard({ achievement, index, onClick }: AchievementCardProps) {
  const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -50 }}
      transition={{ delay: index * 0.05, duration: 0.6 }}
      className={`relative bg-card/90 backdrop-blur-sm rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer font-optimized group ${
        achievement.completed 
          ? 'border-green-500 bg-[rgba(16,185,129,0.1)] shadow-green-500/20' 
          : 'border-border/50 hover:border-[#6dc4e8]'
      }`}
      style={{
        padding: "var(--spacing-xl)",
        boxShadow: achievement.completed 
          ? "0 8px 30px rgba(16, 185, 129, 0.3)" 
          : "0 4px 20px rgba(0,0,0,0.08)"
      }}
      whileHover={{ y: -5, scale: 1.01 }}
      onClick={() => onClick(achievement)}
    >
      {/* 완료 표시 */}
      {achievement.completed && (
        <motion.div
          className="absolute top-4 right-4 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg z-10"
          style={{
            width: "var(--spacing-4xl)",
            height: "var(--spacing-4xl)"
          }}
          animate={{
            boxShadow: [
              "0 0 10px rgba(16,185,129,0.5)", 
              "0 0 20px rgba(16,185,129,0.8)", 
              "0 0 10px rgba(16,185,129,0.5)"
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <CheckCircle 
            style={{
              width: "var(--icon-md)",
              height: "var(--icon-md)"
            }}
          />
        </motion.div>
      )}

      <div 
        className="flex items-start font-optimized"
        style={{
          gap: "var(--spacing-lg)"
        }}
      >
        {/* 업적 아이콘 */}
        <div 
          className="flex-shrink-0 bg-gradient-to-br from-muted/50 to-muted/20 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden"
          style={{
            width: "var(--spacing-5xl)",
            height: "var(--spacing-5xl)",
            fontSize: "var(--spacing-3xl)"
          }}
        >
          <span className="relative z-10">{achievement.icon}</span>
          
          {/* 난이도 표시 */}
          <div
            className="absolute bottom-0 left-0 right-0 text-white text-xs font-medium text-center"
            style={{
              padding: "var(--spacing-xs)",
              fontSize: "0.625rem",
              backgroundColor: DIFFICULTY_COLORS[achievement.difficulty],
              lineHeight: "1.2"
            }}
          >
            {achievement.difficulty.toUpperCase()}
          </div>
        </div>

        {/* 업적 정보 */}
        <div className="flex-1 font-optimized">
          <div 
            className="flex items-start justify-between font-optimized"
            style={{
              marginBottom: "var(--spacing-sm)"
            }}
          >
            <div className="flex-1 font-optimized">
              <h3 
                className="game-text text-foreground font-optimized"
                style={{
                  fontSize: "clamp(1rem, 4vw, 1.25rem)",
                  fontWeight: "var(--font-weight-medium)",
                  lineHeight: "1.3",
                  marginBottom: "var(--spacing-xs)"
                }}
              >
                {achievement.title}
              </h3>
              
              <p 
                className="text-muted-foreground font-optimized"
                style={{
                  fontSize: "clamp(0.875rem, 3vw, 1rem)",
                  fontWeight: "var(--font-weight-normal)",
                  lineHeight: "1.5"
                }}
              >
                {achievement.description}
              </p>
            </div>

            {/* 보상 표시 */}
            <motion.div
              className="flex-shrink-0 bg-muted/50 rounded-xl flex items-center font-optimized shadow-sm"
              style={{
                padding: "var(--spacing-sm) var(--spacing-md)",
                gap: "var(--spacing-xs)",
                marginLeft: "var(--spacing-md)"
              }}
              whileHover={{ scale: 1.05 }}
            >
              <span 
                style={{
                  fontSize: "var(--spacing-lg)"
                }}
              >
                {getRewardIcon(achievement.reward)}
              </span>
              <span 
                className="text-foreground font-optimized"
                style={{
                  fontSize: "clamp(0.75rem, 2.5vw, 0.875rem)",
                  fontWeight: "var(--font-weight-medium)",
                  lineHeight: "1.4"
                }}
              >
                {getRewardText(achievement.reward)}
              </span>
            </motion.div>
          </div>

          {/* 진행률 */}
          <div 
            className="font-optimized"
            style={{
              marginTop: "var(--spacing-lg)"
            }}
          >
            <div 
              className="flex justify-between items-center font-optimized"
              style={{
                marginBottom: "var(--spacing-sm)"
              }}
            >
              <span 
                className="text-muted-foreground font-optimized"
                style={{
                  fontSize: "clamp(0.75rem, 2.5vw, 0.875rem)",
                  fontWeight: "var(--font-weight-normal)",
                  lineHeight: "1.4"
                }}
              >
                진행률
              </span>
              <span 
                className="text-foreground number-optimized font-optimized"
                style={{
                  fontSize: "clamp(0.875rem, 3vw, 1rem)",
                  fontWeight: "var(--font-weight-medium)",
                  lineHeight: "1.4"
                }}
              >
                {achievement.progress} / {achievement.maxProgress}
              </span>
            </div>
            
            {/* 진행률 바 */}
            <div 
              className="bg-border rounded-full overflow-hidden"
              style={{
                height: "0.75rem"
              }}
            >
              <motion.div 
                className={`h-full rounded-full ${
                  achievement.completed 
                    ? 'bg-green-500' 
                    : progressPercentage > 80 
                    ? 'bg-yellow-500' 
                    : progressPercentage > 50 
                    ? 'bg-blue-500' 
                    : 'bg-muted-foreground'
                }`}
                style={{ 
                  width: `${progressPercentage}%`
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ delay: 0.5 + index * 0.1, duration: 1, ease: "easeOut" }}
              />
            </div>
            
            {/* 진행률 퍼센티지 */}
            <div 
              className="text-right font-optimized"
              style={{
                marginTop: "var(--spacing-xs)"
              }}
            >
              <span 
                className={`number-optimized font-optimized ${
                  achievement.completed 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-muted-foreground'
                }`}
                style={{
                  fontSize: "clamp(0.75rem, 2.5vw, 0.875rem)",
                  fontWeight: "var(--font-weight-medium)",
                  lineHeight: "1.4"
                }}
              >
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>

          {/* 완료일 표시 */}
          {achievement.completed && achievement.completedDate && (
            <p 
              className="text-green-600 dark:text-green-400 font-optimized"
              style={{
                fontSize: "clamp(0.75rem, 2.5vw, 0.875rem)",
                fontWeight: "var(--font-weight-normal)",
                lineHeight: "1.4",
                marginTop: "var(--spacing-sm)"
              }}
            >
              ✓ {new Date(achievement.completedDate).toLocaleDateString('ko-KR')} 달성
            </p>
          )}
        </div>
      </div>

      {/* 호버 오버레이 */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-[#6dc4e8]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.6 }}
      />
    </motion.div>
  );
}