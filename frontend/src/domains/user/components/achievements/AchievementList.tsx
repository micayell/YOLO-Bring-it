// src/components/achievements/AchievementList.tsx
import { memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Trophy } from "lucide-react";
import { AchievementCore } from "@/domains/user/stores/achievementStore";
import { AchievementCard } from "./AchievementCard";

type Props = {
  achievements: AchievementCore[];
  isRefreshing: boolean;
  onRefresh: () => void;
  loading?: boolean;
  error?: string;
  onSelect?: (a: AchievementCore) => void;
  onEquip?: (a: AchievementCore) => void;
  currentBadge?: string;
};

export const AchievementList = memo(function AchievementList({
  achievements,
  isRefreshing,
  onRefresh,
  loading,
  error,
  onSelect,
  onEquip,
  currentBadge,
}: Props) {
  // ✅ 획득한 업적을 위로 정렬하는 로직 추가
  const sortedAchievements = useMemo(() => {
    return [...achievements].sort((a, b) => {
      // a가 획득했고 b가 획득하지 않았다면, a를 앞으로
      if (a.hasAchievement && !b.hasAchievement) {
        return -1;
      }
      // b가 획득했고 a가 획득하지 않았다면, b를 앞으로
      if (!a.hasAchievement && b.hasAchievement) {
        return 1;
      }
      // 둘 다 획득했거나 둘 다 획득하지 않았다면, 기존 순서 유지
      return 0;
    });
  }, [achievements]);

  return (
    <div className="flex-1 font-optimized relative">
      {/* 상단 리프레시/상태 */}
      <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-2 flex items-center justify-between">
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 rounded-xl border border-border/50 bg-card/60 px-3 py-2 hover:bg-card"
        >
          <RefreshCw className={isRefreshing ? "animate-spin" : ""} style={{ width: 18, height: 18 }} />
          <span className="text-sm">새로고침</span>
        </button>

        <div className="flex items-center gap-2">
          {loading && (
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-600">
              불러오는 중…
            </span>
          )}
          {error && !loading && (
            <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs text-red-600">
              {error}
            </span>
          )}
        </div>
      </div>

      {/* 세로 나열 리스트 */}
      <div className="px-4 sm:px-6 lg:px-8 pb-6">
        <motion.div
          className="flex flex-col gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <AnimatePresence>
            {sortedAchievements.map((a, idx) => (
              <AchievementCard
                key={a.achievementUid}
                achievement={a}
                index={idx}
                onClick={() => onSelect?.(a)}
                onEquip={onEquip}
                currentBadge={currentBadge}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* 빈 상태 */}
        {!loading && achievements.length === 0 && (
          <motion.div
            className="text-center text-muted-foreground"
            style={{ padding: "var(--spacing-5xl)", fontSize: "clamp(1rem, 4vw, 1.25rem)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Trophy className="mx-auto mb-4 text-muted-foreground/50" style={{ width: "var(--spacing-5xl)", height: "var(--spacing-5xl)" }} />
            <p>표시할 업적이 없습니다</p>
          </motion.div>
        )}
      </div>
    </div>
  );
});