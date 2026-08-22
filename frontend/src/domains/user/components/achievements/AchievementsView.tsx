
// src/pages/AchievementsScreen.tsx
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, ArrowLeft } from "lucide-react";
import { authService } from "@/domains/user/services/authService";
import apiClient from "@/shared/services/api";

import type { AchievementCore } from "@/domains/user/stores/achievementStore";
import { useAchievementStore } from "@/domains/user/stores/achievementStore";
import { AchievementList } from "@/domains/user/components/achievements/AchievementList";
import { useUserLoginStore } from "@/domains/user/stores/userStore";

export type SortOption = "progress" | "difficulty" | "completion";

/** ===== API 타입 ===== */
type ApiItemCategory = { categoryCode: string; name: string };
type ApiItem = { itemUid: number; name: string; cost: number | null; itemCategory: ApiItemCategory };
type ApiAchievement = { achievementUid: number; name: string; exp: string; item: ApiItem };
type ApiAchievementWrap = { achievement: ApiAchievement; hasAchievement: boolean };
type ApiResponse = {
  state: number;
  result: string;
  message: string | null;
  data: { achievements: ApiAchievementWrap[]; achievementRate: number };
  error: any[];
};

/** API → AchievementCore 어댑터 */
function adapt(resp: ApiResponse): { list: AchievementCore[]; rate: number } {
  const wraps = resp?.data?.achievements ?? [];
  const list: AchievementCore[] = wraps.map(({ achievement, hasAchievement }) => ({
    achievementUid: achievement.achievementUid,
    name: achievement.name,
    exp: achievement.exp,
    item: {
      itemUid: achievement.item.itemUid,
      name: achievement.item.name,
      cost: achievement.item.cost,
      itemCategory: {
        categoryCode: achievement.item.itemCategory.categoryCode,
        name: achievement.item.itemCategory.name,
      },
    },
    hasAchievement,
  }));
  const rate = Number(resp?.data?.achievementRate ?? 0);
  return { list, rate };
}

/** ===== 로컬: AchievementCore 전용 필터/정렬/통계 ===== */
function filterAndSortCore(
  list: AchievementCore[],
  search: string,
  sortBy: SortOption,
  showCompleted: boolean
): AchievementCore[] {
  const q = search.trim().toLowerCase();
  let out = list.filter((a) => (showCompleted ? true : !a.hasAchievement));

  if (q) {
    out = out.filter((a) => {
      const name = a.name?.toLowerCase() ?? "";
      const exp = a.exp?.toLowerCase() ?? "";
      const reward = a.item?.name?.toLowerCase() ?? "";
      const cat = a.item?.itemCategory?.name?.toLowerCase() ?? "";
      return name.includes(q) || exp.includes(q) || reward.includes(q) || cat.includes(q);
    });
  }

  switch (sortBy) {
    case "completion": // 완료 항목 먼저
      out.sort((a, b) => Number(b.hasAchievement) - Number(a.hasAchievement));
      break;
    case "difficulty":
      out.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
      break;
    case "progress":
    default:
      out.sort((a, b) => Number(a.hasAchievement) - Number(b.hasAchievement));
      break;
  }
  return out;
}

function calculateStatsCore(list: AchievementCore[]) {
  const total = list.length;
  const completed = list.filter((a) => a.hasAchievement).length;
  return { total, completed };
}

interface AchievementsScreenProps {
  onBack: () => void;
}

export function AchievementsScreen({ onBack }: AchievementsScreenProps) {
  // ✅ 스토어 분리 구독 (shallow 없이)
  const achievements = useAchievementStore((s) => s.achievements);
  const achievementRate = useAchievementStore((s) => s.achievementRate);
  const loading = useAchievementStore((s) => s.loading);
  const error = useAchievementStore((s) => s.error);
  const setAchievements = useAchievementStore((s) => s.setAchievements);
  const setLoading = useAchievementStore((s) => s.setLoading);
  const setError = useAchievementStore((s) => s.setError);

  // ✅ 현재 장착 배지명은 zustand 구독으로 직접 읽어와야 즉시 리렌더
  const currentBadge = useUserLoginStore((s) => s.userData?.badgename);
  const setBadgeName = useUserLoginStore((s) => s.setEquippedBadge);

  const [isRefreshing, setIsRefreshing] = useState(false);
  // searchQuery, sortBy, showCompleted 상태는 현재 UI에 입력 필드가 없어 사용되지 않지만,
  // 추후 필터 기능 추가를 위해 남겨두거나 삭제할 수 있습니다.
  // 여기서는 TS 에러 해결을 위해 사용되지 않는 상태를 주석 처리/삭제합니다.
  // const [searchQuery, setSearchQuery] = useState("");
  // const [sortBy, setSortBy] = useState<SortOption>("progress");
  // const [showCompleted, setShowCompleted] = useState(true);

  // StrictMode 중복 fetch 방지
  const hasFetchedRef = useRef(false);

  const fetchAchievements = useCallback(async () => {
    try {
      setLoading(true);
      const resData = await authService.getAchievements();
      const { list, rate } = adapt(resData);
      setAchievements(list, rate);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? "업적 불러오기 실패");
    } finally {
      setLoading(false);
    }
  }, [setAchievements, setError, setLoading]);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchAchievements();
  }, [fetchAchievements]);

  // ⬇️ AchievementCore 기준으로 필터/정렬
  const filteredAchievements: AchievementCore[] = useMemo(
    () => filterAndSortCore(achievements, "", "progress", true),
    [achievements]
  );

  const stats = useMemo(() => {
    const base = calculateStatsCore(achievements);
    return { ...base, overallProgress: achievementRate };
  }, [achievements, achievementRate]);

  /** ✅ 업적 장착 핸들러: PATCH 후 zustand(userData) 갱신 */
  const handleEquip = async (a: AchievementCore) => {
    try {
      const code = a.item.itemCategory?.categoryCode;
      if (!code) throw new Error("카테고리 코드가 없습니다.");

      // 1) 인벤토리에서 itemMemberUid 조회
      const invRes = await apiClient.get(`/users/item-members/${encodeURIComponent(code)}`);
      const payload = invRes.data?.data ?? invRes.data;
      const invItems = Array.isArray(payload) ? payload : [];
      
      const itemMember = invItems.find((i: any) => i.itemId === a.item.itemUid);
      if (!itemMember || !itemMember.itemMemberUid) {
        throw new Error("인벤토리에서 해당 아이템을 찾을 수 없습니다.");
      }

      // 2) 서버에 장착 반영
      await apiClient.patch(`/users/item-members/${itemMember.itemMemberUid}/equipment`, {
        equipped: true,
      });

      // 3) 카테고리별 로컬 업데이트
      if (code === "BAD") {
        setBadgeName(a.item.name);
      }
      // 필요 시 TIT/CHA도 아래처럼 확장
      // if (code === "TIT") { /* title 관련 로컬 상태 업데이트 */ }
      // if (code === "CHA") { /* char2dpath/char3dpath 갱신 등 */ }
    } catch (e) {
      console.error(e);
      alert("장착에 실패했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-background text-foreground overflow-hidden font-optimized"
      style={{ maxWidth: "100vw", fontSize: "var(--text-base)", fontWeight: "var(--font-weight-normal)", lineHeight: "1.5" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}
    >
      {/* 배경 */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/30 via-transparent to-orange-50/20 dark:from-yellow-950/20 dark:via-transparent dark:to-orange-950/10" />

      <div className="relative z-10 h-full flex flex-col font-optimized">
        {/* 헤더 (디자인 그대로 유지) */}
        <motion.div
          className="bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm"
          style={{ padding: "var(--spacing-lg) var(--spacing-xl)", minHeight: "var(--header-xs)" }}
          initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center" style={{ gap: "var(--spacing-lg)" }}>
              <button
                className="relative flex items-center bg-card/60 hover:bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden transition-all duration-300 touch-target game-text shadow-sm"
                style={{ padding: "var(--spacing-md) var(--spacing-lg)", gap: "var(--spacing-sm)" }}
                onClick={onBack}
              >
                <ArrowLeft style={{ width: "var(--icon-md)", height: "var(--icon-md)" }} />
                <span className="relative z-10 hidden sm:inline">뒤로가기</span>
              </button>

              <div className="flex items-center" style={{ gap: "var(--spacing-md)" }}>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Trophy className="text-white" style={{ width: "var(--icon-md)", height: "var(--icon-md)" }} />
                </div>
                <h1 className="game-text text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-yellow-400 dark:to-orange-400"
                  style={{ fontSize: "clamp(1.25rem, 4vw, 2rem)", fontWeight: "var(--font-weight-medium)" }}>
                  업적
                </h1>

                {loading && (
                  <span className="ml-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-600">
                    불러오는 중…
                  </span>
                )}
                {error && !loading && (
                  <span className="ml-2 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs text-red-600">
                    {error}
                  </span>
                )}
              </div>
            </div>

            {/* 진행률(서버 제공) — 디자인 유지 */}
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl shadow-lg border border-border/50 relative overflow-hidden"
              style={{ padding: "var(--spacing-md) var(--spacing-xl)" }}
            >
              <div className="flex items-center relative z-10" style={{ gap: "var(--spacing-sm)" }}>
                <div className="text-center">
                  <div className="text-yellow-600 dark:text-yellow-400 number-optimized" style={{ fontSize: "clamp(1.125rem, 4vw, 1.5rem)" }}>
                    {stats.completed}
                  </div>
                  <div className="text-muted-foreground" style={{ fontSize: "clamp(0.75rem, 2.5vw, 0.875rem)" }}>
                    달성
                  </div>
                </div>
                <div className="w-px bg-border/50" style={{ height: "var(--spacing-4xl)" }} />
                <div className="text-center">
                  <div className="text-foreground number-optimized" style={{ fontSize: "clamp(1.125rem, 4vw, 1.5rem)" }}>
                    {Math.ceil(stats.overallProgress)}%
                  </div>
                  <div className="text-muted-foreground" style={{ fontSize: "clamp(0.75rem, 2.5vw, 0.875rem)" }}>
                    전체 진행률
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 리스트 */}
        <AchievementList
          achievements={filteredAchievements}
          isRefreshing={isRefreshing}
          onRefresh={async () => {
            setIsRefreshing(true);
            try { await fetchAchievements(); } finally {
              await new Promise((r) => setTimeout(r, 400));
              setIsRefreshing(false);
            }
          }}
          loading={loading}
          error={error}
          onSelect={() => {}}
          onEquip={handleEquip}
          currentBadge={currentBadge}
        />

        {/* (선택) 상세 모달 */}
        <AnimatePresence>{/* reserved */}</AnimatePresence>
      </div>
    </motion.div>
  );
}
