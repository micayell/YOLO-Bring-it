import { motion } from "framer-motion";
import { X, CheckCircle, Medal, TrendingUp, Gift } from "lucide-react";
import type { Achievement } from "@/shared/types/achievements";
import { DIFFICULTY_COLORS } from "@/shared/constants/achievements";
import { getRewardIcon, getRewardText } from "@/shared/utils/achievements";

interface AchievementModalProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export function AchievementModal({ achievement, onClose }: AchievementModalProps) {
  if (!achievement) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 font-optimized"
      style={{
        padding: "var(--spacing-lg)"
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-card/95 backdrop-blur-lg rounded-2xl border border-border shadow-2xl w-full max-h-[90vh] overflow-y-auto font-optimized relative"
        style={{
          padding: "var(--spacing-4xl)",
          maxWidth: "32rem"
        }}
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <motion.button
          className="absolute top-4 right-4 w-8 h-8 bg-background/80 hover:bg-background rounded-full flex items-center justify-center transition-colors z-10"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
        >
          <X 
            style={{
              width: "var(--icon-sm)",
              height: "var(--icon-sm)"
            }}
          />
        </motion.button>

        <div 
          className="text-center font-optimized"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-2xl)"
          }}
        >
          {/* 업적 아이콘 */}
          <motion.div
            className="relative mx-auto"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div
              className="bg-gradient-to-br from-muted/50 to-muted/20 rounded-2xl shadow-lg relative overflow-hidden flex items-center justify-center"
              style={{
                width: "8rem",
                height: "8rem",
                fontSize: "4rem"
              }}
            >
              <span className="relative z-10">{achievement.icon}</span>
              
              {/* 완료 표시 */}
              {achievement.completed && (
                <motion.div
                  className="absolute top-2 right-2 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg"
                  style={{
                    width: "var(--spacing-3xl)",
                    height: "var(--spacing-3xl)"
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
            </div>
            
            {/* 난이도 표시 */}
            <div
              className="absolute -bottom-2 -right-2 text-white flex items-center rounded-xl font-optimized shadow-lg"
              style={{
                padding: "var(--spacing-sm) var(--spacing-md)",
                fontSize: "0.875rem",
                fontWeight: "var(--font-weight-medium)",
                lineHeight: "1.4",
                backgroundColor: DIFFICULTY_COLORS[achievement.difficulty],
                gap: "var(--spacing-xs)"
              }}
            >
              <Medal 
                style={{
                  width: "var(--icon-sm)",
                  height: "var(--icon-sm)"
                }}
              />
              {achievement.difficulty.toUpperCase()}
            </div>
          </motion.div>
          
          {/* 업적 정보 */}
          <motion.div
            className="font-optimized"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h2 
              className="game-text text-foreground font-optimized"
              style={{
                fontSize: "clamp(1.5rem, 5vw, 2rem)",
                fontWeight: "var(--font-weight-medium)",
                lineHeight: "1.3",
                marginBottom: "var(--spacing-md)"
              }}
            >
              {achievement.title}
            </h2>
            
            <p 
              className="text-muted-foreground font-optimized"
              style={{
                fontSize: "clamp(0.875rem, 3vw, 1rem)",
                fontWeight: "var(--font-weight-normal)",
                lineHeight: "1.6",
                marginBottom: "var(--spacing-lg)"
              }}
            >
              {achievement.description}
            </p>
            
            {/* 완료일 */}
            {achievement.completed && achievement.completedDate && (
              <p 
                className="text-green-600 dark:text-green-400 font-optimized"
                style={{
                  fontSize: "0.875rem",
                  fontWeight: "var(--font-weight-normal)",
                  lineHeight: "1.4",
                  marginBottom: "var(--spacing-lg)"
                }}
              >
                ✓ {new Date(achievement.completedDate).toLocaleDateString('ko-KR')} 달성
              </p>
            )}
          </motion.div>

          {/* 진행률 상세 */}
          <motion.div 
            className="bg-muted/50 rounded-2xl font-optimized"
            style={{
              padding: "var(--spacing-2xl)"
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h3 
              className="text-foreground flex items-center font-optimized"
              style={{
                fontSize: "clamp(1rem, 4vw, 1.25rem)",
                fontWeight: "var(--font-weight-medium)",
                lineHeight: "1.4",
                marginBottom: "var(--spacing-lg)",
                gap: "var(--spacing-sm)"
              }}
            >
              <TrendingUp 
                style={{
                  width: "var(--icon-md)",
                  height: "var(--icon-md)"
                }}
              />
              진행 상황
            </h3>
            
            <div 
              className="font-optimized"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--spacing-lg)"
              }}
            >
              <div 
                className="flex justify-between items-center font-optimized"
              >
                <span 
                  className="text-muted-foreground font-optimized"
                  style={{
                    fontSize: "clamp(0.875rem, 3vw, 1rem)",
                    fontWeight: "var(--font-weight-normal)",
                    lineHeight: "1.5"
                  }}
                >
                  현재 진행률
                </span>
                <span 
                  className="text-foreground number-optimized font-optimized"
                  style={{
                    fontSize: "clamp(1rem, 4vw, 1.25rem)",
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
                  height: "1rem"
                }}
              >
                <motion.div 
                  className={`h-full rounded-full ${
                    achievement.completed 
                      ? 'bg-green-500' 
                      : 'bg-gradient-to-r from-[#6dc4e8] to-[#5ab4d8]'
                  }`}
                  style={{ 
                    width: `${(achievement.progress / achievement.maxProgress) * 100}%`
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                  transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                />
              </div>
              
              {/* 진행률 퍼센티지 */}
              <div 
                className="text-center font-optimized"
              >
                <span 
                  className={`number-optimized font-optimized ${
                    achievement.completed 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-[#6dc4e8]'
                  }`}
                  style={{
                    fontSize: "clamp(1.25rem, 5vw, 2rem)",
                    fontWeight: "var(--font-weight-medium)",
                    lineHeight: "1.2"
                  }}
                >
                  {Math.round((achievement.progress / achievement.maxProgress) * 100)}%
                </span>
              </div>
            </div>
          </motion.div>

          {/* 보상 정보 */}
          <motion.div 
            className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl border border-yellow-500/20 font-optimized"
            style={{
              padding: "var(--spacing-2xl)"
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <h3 
              className="text-foreground flex items-center font-optimized"
              style={{
                fontSize: "clamp(1rem, 4vw, 1.25rem)",
                fontWeight: "var(--font-weight-medium)",
                lineHeight: "1.4",
                marginBottom: "var(--spacing-lg)",
                gap: "var(--spacing-sm)"
              }}
            >
              <Gift 
                style={{
                  width: "var(--icon-md)",
                  height: "var(--icon-md)"
                }}
              />
              보상
            </h3>
            
            <div 
              className="flex items-center justify-center bg-background/50 rounded-xl font-optimized"
              style={{
                padding: "var(--spacing-2xl)",
                gap: "var(--spacing-lg)"
              }}
            >
              <span 
                style={{
                  fontSize: "var(--spacing-4xl)"
                }}
              >
                {getRewardIcon(achievement.reward)}
              </span>
              <span 
                className="text-foreground font-optimized"
                style={{
                  fontSize: "clamp(1rem, 4vw, 1.25rem)",
                  fontWeight: "var(--font-weight-medium)",
                  lineHeight: "1.4"
                }}
              >
                {getRewardText(achievement.reward)}
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}