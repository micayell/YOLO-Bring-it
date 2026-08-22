import { useState } from "react";
import { motion } from "framer-motion";
import { Coins, User, Tag, Award } from "lucide-react";
import { toast } from "sonner";

import { OptimizedImage } from "@/shared/ui/OptimizedImage";
import { ShopItem, useItemStore } from "@/domains/user/stores/itemStore";
import { useUserLoginStore } from "@/domains/user/stores/userStore";
import apiClient from "@/shared/services/api";

export function ShopItemsCard({ item }: { item: ShopItem }) {
  const isOwned = useItemStore((s) => s.isOwned);
  const addOwned = useItemStore((s) => s.addOwned);
  const removeOwned = useItemStore((s) => s.removeOwned);

  const { userData, setUser } = useUserLoginStore();
  const [loading, setLoading] = useState(false);

  const owned = isOwned(item.id);
  const coins = userData?.coin ?? 0;
  const itemCost = item.cost ?? 0;
  const canBuy = !!userData && !owned && coins >= itemCost && !loading;

  const handleClick = async () => {
    if (!canBuy) return;
    setLoading(true);

    // 낙관적 반영
    addOwned(item.id);
    const prevCoin = coins;
    console.log("아이템 구매", prevCoin - itemCost);
    setUser?.({ ...userData!, coin: prevCoin - itemCost });

    try {
      await apiClient.post(
        "/users/item-members",
        { itemId: Number(item.id) }
      );
      toast.success("구매 완료!");
    } catch (err: any) {
      // 롤백
      removeOwned(item.id);
      console.log("rollback", prevCoin);
      setUser?.({ ...userData!, coin: prevCoin });
      const msg = err?.response?.data?.message || "서버 오류";
      toast.error(`구매 실패: ${msg}`);
      console.error("[BUY] error", err);
    } finally {
      setLoading(false);
    }
  };

  const CategoryIcon = (() => {
    switch (item.category) {
      case "character": return <User className="text-[#ff6b6b]" style={{ width: "var(--icon-sm)", height: "var(--icon-sm)" }} />;
      case "title":     return <Tag  className="text-[#ffd93d]" style={{ width: "var(--icon-sm)", height: "var(--icon-sm)" }} />;
      case "badge":     return <Award className="text-[#6bcf7f]" style={{ width: "var(--icon-sm)", height: "var(--icon-sm)" }} />;
      default:          return null;
    }
  })();

  return (
    <motion.div
      className="relative bg-card/90 backdrop-blur-sm rounded-2xl border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden p-3 sm:p-4 lg:p-5 group"
      style={{ minHeight: "clamp(8rem, 20vh, 12rem)", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      {/* 카테고리 아이콘 뱃지 */}
      <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm rounded-xl shadow-lg p-1.5">
        {CategoryIcon}
      </div>

      {/* 이미지 (비율 유지 + 잘림 방지) */}
      <motion.div
        className="relative w-full aspect-[4/5] rounded-xl bg-muted/40 border overflow-hidden flex items-center justify-center"
        style={{ marginTop: "var(--spacing-2xl)", marginBottom: "var(--spacing-md)" }}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.25 }}
      >
        <OptimizedImage
          src={item.image}
          alt={item.name}
          className="max-w-full max-h-full object-contain"  // ✅ 핵심
        />
        {/* 필요시 빈 이미지 대비 패턴/플레이스홀더 추가 가능 */}
      </motion.div>

      {/* 텍스트/가격/버튼 */}
      <div className="flex flex-col gap-2">
        <h3
          className="game-text text-foreground"
          style={{
            fontSize: "clamp(0.875rem, 3vw, 1rem)",
            lineHeight: "1.3",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
          title={item.name}
        >
          {item.name}
        </h3>

        <p
          className="text-muted-foreground hidden sm:block"
          style={{
            fontSize: "clamp(0.75rem, 2.5vw, 0.875rem)",
            lineHeight: "1.4",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
          title={item.description}
        >
          {item.description}
        </p>

        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center text-yellow-600 dark:text-yellow-400 gap-1">
            <Coins style={{ width: "var(--icon-sm)", height: "var(--icon-sm)" }} />
            <span className="game-text number-optimized" style={{ fontSize: "clamp(0.875rem, 3vw, 1rem)" }}>
              {itemCost.toLocaleString()}
            </span>
          </div>

          <motion.button
            type="button"
            className={`relative rounded-xl overflow-hidden transition-all duration-300 touch-target game-text shadow-lg ${
              owned
                ? "bg-green-500 text-white"
                : canBuy
                ? "bg-[#6dc4e8] text-white hover:bg-[#5ab4d8]"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
            style={{
              padding: "var(--spacing-sm) var(--spacing-md)",
              fontSize: "clamp(0.75rem, 2.5vw, 0.875rem)",
              minHeight: "var(--spacing-5xl)",
              minWidth: "4rem",
            }}
            whileHover={canBuy ? { scale: 1.05 } : {}}
            whileTap={canBuy ? { scale: 0.95 } : {}}
            onClick={handleClick}
            disabled={!canBuy}
            title={
              owned
                ? "이미 보유한 아이템입니다."
                : !userData
                ? "유저 정보를 불러오는 중입니다."
                : coins < itemCost
                ? "코인이 부족합니다."
                : loading
                ? "처리 중…"
                : ""
            }
          >
            <span className="relative z-10">
              {owned ? "✓ 보유중" : loading ? "처리중..." : "구매"}
            </span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
