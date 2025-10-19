// screens/ShopScreen.tsx
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Coins, ArrowLeft, User, Tag, ChevronDown, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { useItemStore } from "@/app/stores/itemStore";
import { useUserLoginStore } from "@/app/stores/userStore";
import { ShopItemsList } from "@/components/shops/ShopItemsList";
import apiClient from "@/shared/services/api";

// ✅ UI → API 코드 변환 매핑
const API_KIND_MAP = {
  character: "CHA",
  title: "TIT",
  badge: "BAD",
} as const;

type UiKind = keyof typeof API_KIND_MAP;
const toApiKind = (kind: UiKind) => API_KIND_MAP[kind];

interface ShopScreenProps {
  onBack?: () => void;
}

export function ShopScreen({ onBack }: ShopScreenProps) {
  const { userData } = useUserLoginStore();
  const userId = useUserLoginStore((s) => s.userData?.memberUid);
  const [userProfile, setUserProfile] = useState(null);
  console.log("userData",userData)
  console.log("userProfile", userProfile)
  const setItems = useItemStore((s) => s.setItems);
  const setOwnedItemsMerge = useItemStore((s) => s.setOwnedItemsMerge);
  const setCategory = useItemStore((s) => s.setCategory);
  const selectedCategory = useItemStore((s) => s.selectedCategory);

  // ✨ 긴 버전 UI 상호작용 상태
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const pullThreshold = 80;
  const [isLoading, setIsLoading] = useState(false); // 무한스크롤 로딩 인디케이터
  const [hasMore, setHasMore] = useState(false);     // 서버 페이지 없음 → 기본 false

  const scrollRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef(0);

  // 카테고리(3종) + 각 색/아이콘
  const categories = [
    { id: "character", name: "캐릭터", icon: User,  color: "#ff6b6b" },
    { id: "title",     name: "명찰",   icon: Tag,   color: "#ffd93d" },
  ] as const;

  // 초기 카테고리 보정 (store 기본값이 없을 경우)
  useEffect(() => {
    if (!selectedCategory) setCategory("character");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 스크롤 힌트 자동 숨김
  useEffect(() => {
    const t = setTimeout(() => setShowScrollHint(false), 3000);
    return () => clearTimeout(t);
  }, []);

  // 데이터 하이드레이트 함수 (카테고리 변경, 풀투리프레시에서 재사용)
  const hydrate = useCallback(async () => {
    if (!userId || !selectedCategory) return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const kind = selectedCategory as UiKind;
      console.log(kind)
      // 1) 현재 탭 아이템 목록
      const itemsRes = await apiClient.get(
        "/users/items",
        { headers: { Authorization: `Bearer ${token}` }, params: { kind: kind } }
      );
      console.log("itemRes",itemsRes.data.data)
      // 2) 인벤토리 — 모든 카테고리 합쳐서 병합
      const invReqs = (Object.keys(API_KIND_MAP) as UiKind[]).map(k =>
        apiClient.get(
          `/users/item-members/${toApiKind(k)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );
      const invAll = await Promise.allSettled(invReqs);

      // 응답 매핑 (UI 일관성: price 사용)
      const itemsRaw = itemsRes.data?.data ?? itemsRes.data ?? [];
      console.log(itemsRaw)
      setItems(
        itemsRaw.map((it: any) => ({
          id: String(it.itemUid),
          name: it.name,
          cost: it.cost,                    // ✅ cost → price
          category: kind,
          image: it.img1 || "",
          description: it.description || "",
        }))
      );

      // 보유 아이디 병합(중복 제거)
      const ownedIdsMerged = new Set<string>();
      for (const r of invAll) {
        if (r.status === "fulfilled") {
          const rows = r.value.data?.data ?? r.value.data ?? [];
          for (const row of rows) ownedIdsMerged.add(String(row.itemId));
        }
      }
      setOwnedItemsMerge([...ownedIdsMerged]);

      // 2) 유저 프로필 정보 (포인트, 장착 아이템)
      const profileRes = await apiClient.get(
        "/users/profile",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserProfile(profileRes.data.result);

    } catch (err: any) {
      console.error("[Shop hydrate] failed", err?.response || err);
      toast.error("상점 데이터를 불러오지 못했어요.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, userId, setItems, setOwnedItemsMerge]);

  // 카테고리 변경/유저 변경 시 하이드레이트
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // 무한 스크롤 로드 (서버 페이지 없으면 비활성)
  const loadMoreItems = useCallback(async () => {
    if (!hasMore || isLoading) return;
    setIsLoading(true);
    try {
      // TODO: 서버 페이징 제공 시 구현
      // await axios.get(... nextPage ...)
    } finally {
      setIsLoading(false);
      setHasMore(false);
    }
  }, [hasMore, isLoading]);

  // 스크롤 이벤트
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;

    // 스크롤 힌트 숨김
    if (scrollTop > 50) setShowScrollHint(false);

    // 하단 근처 → 로드 시도
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      loadMoreItems();
    }
  }, [loadMoreItems]);

  // Pull-to-Refresh 제스처
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop === 0) {
      touchStartRef.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || !touchStartRef.current) return;
    const curY = e.touches[0].clientY;
    const dist = curY - touchStartRef.current;
    if (dist > 0 && dist <= pullThreshold * 2) {
      setPullDistance(dist);
      e.preventDefault();
    }
  }, [isPulling]);
  const onTouchEnd = useCallback(async () => {
    if (!isPulling) return;
    if (pullDistance >= pullThreshold) {
      setIsRefreshing(true);
      await hydrate();
      setIsRefreshing(false);
    }
    setIsPulling(false);
    touchStartRef.current = 0;
    setPullDistance(0);
  }, [isPulling, pullDistance, hydrate]);

  return (
    <motion.div
      className="h-full bg-background text-foreground overflow-hidden font-optimized"
      style={{ maxWidth: "100vw" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/20 dark:from-blue-950/20 dark:via-transparent dark:to-purple-950/10" />
      {/* 배경 장식 */}
      <motion.div
        className="absolute w-40 h-40 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"
        style={{ top: "var(--spacing-5xl)", right: "var(--spacing-5xl)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 h-full flex flex-col">
        {/* 헤더 */}
        <motion.div
          className="bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm flex-shrink-0"
          style={{ padding: "var(--spacing-lg) var(--spacing-xl)", minHeight: "var(--header-xs)" }}
          initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            {/* 왼쪽: 뒤로 + 타이틀 */}
            <div className="flex items-center" style={{ gap: "var(--spacing-lg)" }}>
              {onBack && (
                <motion.button
                  className="relative flex items-center bg-card/60 hover:bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden transition-all duration-300 touch-target game-text shadow-sm"
                  style={{ padding: "var(--spacing-md) var(--spacing-lg)", gap: "var(--spacing-sm)" }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={onBack}
                  aria-label="뒤로가기"
                >
                  <ArrowLeft style={{ width: "var(--icon-md)", height: "var(--icon-md)" }} />
                  <span className="relative z-10 hidden sm:inline">뒤로가기</span>
                </motion.button>
              )}

              <div className="flex items-center" style={{ gap: "var(--spacing-md)" }}>
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#6dc4e8] to-[#5ab4d8] rounded-xl flex items-center justify-center shadow-lg"
                  style={{ boxShadow: "0 4px 20px rgba(109, 196, 232, 0.3)" }}
                >
                  <ShoppingCart className="text-white" style={{ width: "var(--icon-md)", height: "var(--icon-md)" }} />
                </div>
                <h1
                  className="game-text text-[#6dc4e8]"
                  style={{ fontSize: "clamp(1.25rem, 4vw, 2rem)", letterSpacing: "0.05em" }}
                >
                  상점
                </h1>
              </div>
            </div>

            {/* 오른쪽: 코인 */}
            <motion.div
              className="flex items-center bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-yellow-900 rounded-2xl shadow-lg relative overflow-hidden"
              style={{ gap: "var(--spacing-sm)", padding: "var(--spacing-md) var(--spacing-xl)" }}
              animate={{
                boxShadow: [
                  "0 4px 20px rgba(255,215,0,0.3)",
                  "0 6px 30px rgba(255,215,0,0.5)",
                  "0 4px 20px rgba(255,215,0,0.3)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
              />
              <Coins style={{ width: "var(--icon-md)", height: "var(--icon-md)" }} />
              <span className="game-text number-optimized relative z-10">
                {(userData?.coin ?? 0).toLocaleString()}
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* 카테고리 탭 */}
        <motion.div
          className="bg-background/90 backdrop-blur-sm border-b border-border/30 relative flex-shrink-0"
          style={{ padding: "var(--spacing-lg) 0" }}
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="relative">
            <div
              ref={categoryScrollRef}
              className="flex justify-center overflow-x-auto scrollbar-hide px-4 scroll-smooth"
              style={{ gap: "var(--spacing-md)", scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {categories.map((c, idx) => {
                const Icon = c.icon;
                const isActive = selectedCategory === c.id;
                return (
                  <motion.button
                    key={c.id}
                    className={`relative flex-shrink-0 flex items-center rounded-2xl overflow-hidden transition-all duration-300 touch-target game-text ${
                      isActive
                        ? "text-white shadow-lg transform scale-105"
                        : "text-foreground bg-card/60 hover:bg-card/80 border border-border/50 hover:border-border"
                    }`}
                    style={{
                      gap: "var(--spacing-sm)",
                      padding: "var(--spacing-md) var(--spacing-xl)",
                      minHeight: "var(--touch-target-min)",
                      backgroundColor: isActive ? c.color : undefined,
                      boxShadow: isActive ? `0 8px 25px ${c.color}40` : undefined,
                    }}
                    whileHover={{ scale: isActive ? 1.05 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCategory(c.id)}
                    initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 + idx * 0.1, duration: 0.6 }}
                  >
                    <Icon style={{ width: "var(--icon-sm)", height: "var(--icon-sm)" }} />
                    <span className="relative z-10 whitespace-nowrap">{c.name}</span>
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* 스크롤 영역 */}
        <div className="flex-1 overflow-hidden relative">
          {/* 스크롤 힌트 */}
          <AnimatePresence>
            {showScrollHint && (
              <motion.div
                className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-[#6dc4e8]/90 text-white rounded-2xl shadow-lg"
                style={{ padding: "var(--spacing-sm) var(--spacing-lg)" }}
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-2">
                  <ChevronDown className="animate-bounce" style={{ width: "var(--icon-sm)", height: "var(--icon-sm)" }} />
                  <span>아래로 스크롤하여 더 많은 아이템 확인</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 진짜 스크롤 컨테이너 */}
          <div
            ref={scrollRef}
            className="h-full overflow-y-auto relative"
            style={{
              padding: "var(--spacing-lg)",
              paddingBottom: "var(--spacing-5xl)",
              transform: isPulling ? `translateY(${Math.min(pullDistance, pullThreshold)}px)` : "none",
              transition: isPulling ? "none" : "transform 0.3s ease-out",
              scrollbarWidth: "thin",
              scrollbarColor: "#6dc4e8 rgba(0,0,0,0.1)",
              scrollBehavior: "smooth",
            }}
            onScroll={handleScroll}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Pull-to-Refresh 인디케이터 */}
            <AnimatePresence>
              {(isPulling || isRefreshing) && (
                <motion.div
                  className="flex items-center justify-center text-[#6dc4e8]"
                  style={{ padding: "var(--spacing-lg)", height: `${pullThreshold}px` }}
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                >
                  <motion.div
                    animate={isRefreshing ? { rotate: 360 } : {}}
                    transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
                  >
                    <RefreshCw style={{ width: "var(--icon-lg)", height: "var(--icon-lg)" }} />
                  </motion.div>
                  <span className="ml-2">
                    {isRefreshing ? "새로고침 중..." : "새로고침하려면 놓으세요"}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 아이템 리스트 */}
            <ShopItemsList />

            {/* 무한 스크롤 인디케이터 */}
            {isLoading && (
              <motion.div
                className="flex items-center justify-center text-[#6dc4e8]"
                style={{ padding: "var(--spacing-2xl)" }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <RefreshCw style={{ width: "var(--icon-lg)", height: "var(--icon-lg)" }} />
                </motion.div>
                <span className="ml-2">더 많은 아이템 로딩 중...</span>
              </motion.div>
            )}

            {!hasMore && !isLoading && (
              <motion.div
                className="text-center text-muted-foreground"
                style={{ padding: "var(--spacing-4xl)" }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              >
                🎉 모든 아이템을 확인했습니다!
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* 커스텀 스크롤바 유틸 */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </motion.div>
  );
}
