// // components/Shop/ShopItemsCard.tsx
// import { useState } from "react";
// import { Coins } from "lucide-react";
// import { motion } from "framer-motion";
// import axios from "axios";
// import { toast } from "sonner";

// import { OptimizedImage } from "@/shared/ui/OptimizedImage";
// import { ShopItem, useItemStore } from "@/app/stores/itemStore";
// import { useUserLoginStore } from "@/app/stores/userStore";

// interface Props {
//   item: ShopItem;
//   owned?: boolean; // 부모가 넘기면 사용, 없으면 스토어 기준 사용
// }

// export function ShopItemsCard({ item, owned }: Props) {
//   // ✅ itemStore는 훅으로 selector를 통해 사용
//   const isOwned = useItemStore((s) => s.isOwned);
//   const purchaseItem = useItemStore((s) => s.purchaseItem);
//   const rollbackPurchase = useItemStore((s) => s.rollbackPurchase);

//   // ✅ userStore에서 코인/업데이터
//   const { userData, setUser } = useUserLoginStore();

//   const [loading, setLoading] = useState(false);

//   // ✅ 표시할 보유 여부: prop 없으면 스토어로 계산
//   const storeOwned = isOwned(item.id);
//   const displayOwned = owned ?? storeOwned;

//   const coins = userData?.coin ?? 0;
//   const canBuy = !!userData && !displayOwned && coins >= item.cost && !loading;

//   const handleClick = async () => {
//     console.log("[BUY] clicked");
//     if (!canBuy) return;

//     setLoading(true);

//     // 1) 낙관적 소유 추가 (코인 체크는 컴포넌트에서 이미 했음)
//     const ok = purchaseItem(item);
//     console.log("[BUY] purchaseItem result:", ok);
//     if (!ok) {
//       setLoading(false);
//       return;
//     }

//     // 2) 낙관적 코인 차감
//     const prevCoin = coins;
//     setUser({ ...userData!, coin: prevCoin - item.cost });

//     try {
//       console.log("나야들기름",item.id);
//       const token = localStorage.getItem("accessToken");
//       await axios.post(
//         "http://localhost:8080/v1/item-members",
//         { itemId: Number(item.id) }, // 서버가 number면 Number(...) 권장
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       toast.success("구매 완료!");
//     } catch (err) {
//       // 3) 실패 시 롤백
//       rollbackPurchase?.(item.id);
//       setUser({ ...userData!, coin: prevCoin });
//       toast.error("구매 실패: 서버 오류");
//       console.error("[BUY] axios error", err);
//     } finally {
//       setLoading(false);
//       console.log("[BUY] done");
//     }
//   };

//   console.log("[ShopItemsCard]", {
//     itemId: item.id,
//     coins,
//     itemCost: item.cost,
//     ownedProp: owned,
//     storeOwned,
//     displayOwned,
//     loading,
//     canBuy
//   });

//   return (
//     <div className="bg-card/90 p-4 rounded-xl shadow-md hover:shadow-xl transition">
//       <div className="aspect-square rounded-lg overflow-hidden mb-2">
//         <OptimizedImage
//           src={item.image}
//           alt={item.name}
//           className="w-full h-full object-cover"
//         />
//       </div>

//       <h3 className="text-base font-bold truncate">{item.name}</h3>
//       <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
//         {item.description}
//       </p>

//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-1 text-yellow-600">
//           <Coins className="w-4 h-4" />
//           <span className="text-sm font-semibold">{item.cost}</span>
//         </div>

//         <motion.button
//           type="button"  // ✅ 폼 submit 방지
//           className={`rounded-md px-3 py-1 text-sm font-medium transition ${
//             displayOwned
//               ? "bg-green-500 text-white"
//               : canBuy
//               ? "bg-[#6dc4e8] text-white hover:bg-[#5ab4d8]"
//               : "bg-muted text-muted-foreground cursor-not-allowed"
//           }`}
//           whileHover={canBuy ? { scale: 1.05 } : {}}
//           whileTap={canBuy ? { scale: 0.95 } : {}}
//           onClick={handleClick}
//           disabled={!canBuy}
//           title={
//             displayOwned
//               ? "이미 보유한 아이템입니다."
//               : !userData
//               ? "유저 정보를 불러오는 중입니다."
//               : coins < item.cost
//               ? "코인이 부족합니다."
//               : loading
//               ? "처리 중…"
//               : ""
//           }
//         >
//           {displayOwned ? "✓ 보유중" : loading ? "처리중..." : "구매"}
//         </motion.button>
//       </div>
//     </div>
//   );
// }




// import { useState } from "react";
// import axios from "axios";
// import { motion } from "framer-motion";
// import { Coins } from "lucide-react";
// import { toast } from "sonner";

// import { OptimizedImage } from "@/shared/ui/OptimizedImage";
// import { ShopItem, useItemStore } from "@/app/stores/itemStore";
// import { useUserLoginStore } from "@/app/stores/userStore";

// export function ShopItemsCard({ item }: { item: ShopItem }) {
//   const isOwned = useItemStore((s) => s.isOwned);
//   const addOwned = useItemStore((s) => s.addOwned);
//   const removeOwned = useItemStore((s) => s.removeOwned);

//   const { userData, setUser } = useUserLoginStore(); // ⚠️ setter 이름이 다르면 여기 바꿔주세요
//   const [loading, setLoading] = useState(false);

//   const owned = isOwned(item.id);
//   const coins = userData?.coin ?? 0;
//   const canBuy = !!userData && !owned && coins >= item.cost && !loading;

//   const handleClick = async () => {
//     if (!canBuy) return;
//     setLoading(true);

//     // 낙관적 반영
//     addOwned(item.id);
//     const prevCoin = coins;
//     setUser?.({ ...userData!, coin: prevCoin - item.cost }); // ⚠️ 네 store의 setter 이름/시그니처에 맞게

//     try {
//       const token = localStorage.getItem("accessToken");
//       await axios.post(
//         // "http://i13c207.p.ssafy.io:8080/v1/item-members",
//         "https://i13C207.p.ssafy.io/api/v1/users/item-members",
//         { itemId: Number(item.id) }, // 서버가 number 기대
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       toast.success("구매 완료!");
//     } catch (err: any) {
//       // 실패 롤백
//       removeOwned(item.id);
//       setUser?.({ ...userData!, coin: prevCoin });
//       const msg = err?.response?.data?.message || "서버 오류";
//       toast.error(`구매 실패: ${msg}`);
//       console.error("[BUY] error", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bg-card/90 p-4 rounded-xl shadow-md hover:shadow-xl transition">
//       <div className="aspect-square rounded-lg overflow-hidden mb-2">
//         <OptimizedImage
//           src={item.image}
//           alt={item.name}
//           className="w-full h-full object-cover"
//         />
//       </div>

//       <h3 className="text-base font-bold truncate">{item.name}</h3>
//       <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
//         {item.description}
//       </p>

//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-1 text-yellow-600">
//           <Coins className="w-4 h-4" />
//           <span className="text-sm font-semibold">{item.cost}</span>
//         </div>

//         <motion.button
//           type="button"
//           className={`rounded-md px-3 py-1 text-sm font-medium transition ${
//             owned
//               ? "bg-green-500 text-white"
//               : canBuy
//               ? "bg-[#6dc4e8] text-white hover:bg-[#5ab4d8]"
//               : "bg-muted text-muted-foreground cursor-not-allowed"
//           }`}
//           whileHover={canBuy ? { scale: 1.05 } : {}}
//           whileTap={canBuy ? { scale: 0.95 } : {}}
//           onClick={handleClick}
//           disabled={!canBuy}
//           title={
//             owned
//               ? "이미 보유한 아이템입니다."
//               : !userData
//               ? "유저 정보를 불러오는 중입니다."
//               : coins < item.cost
//               ? "코인이 부족합니다."
//               : loading
//               ? "처리 중…"
//               : ""
//           }
//         >
//           {owned ? "✓ 보유중" : loading ? "처리중..." : "구매"}
//         </motion.button>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { motion } from "framer-motion";
import { Coins, User, Tag, Award } from "lucide-react";
import { toast } from "sonner";

import { OptimizedImage } from "@/shared/ui/OptimizedImage";
import { ShopItem, useItemStore } from "@/app/stores/itemStore";
import { useUserLoginStore } from "@/app/stores/userStore";
import apiClient from "@/shared/services/api";

export function ShopItemsCard({ item }: { item: ShopItem }) {
  const isOwned = useItemStore((s) => s.isOwned);
  const addOwned = useItemStore((s) => s.addOwned);
  const removeOwned = useItemStore((s) => s.removeOwned);

  const { userData, setUser } = useUserLoginStore();
  const [loading, setLoading] = useState(false);

  const owned = isOwned(item.id);
  const coins = userData?.coin ?? 0;
  const canBuy = !!userData && !owned && coins >= (item.cost ? item.cost : 0) && !loading;

  const handleClick = async () => {
    if (!canBuy) return;
    setLoading(true);

    // 낙관적 반영
    addOwned(item.id);
    const prevCoin = coins;
    console.log("아이템 구매", prevCoin - (item.cost ? item.cost : 0))
    setUser?.({ ...userData!, coin: prevCoin - (item.cost ? item.cost : 0) });

    try {
      const token = localStorage.getItem("accessToken");
      await apiClient.post(
        "/users/item-members",
        { itemId: Number(item.id) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("구매 완료!");
    } catch (err: any) {
      // 롤백
      removeOwned(item.id);
      console.log("rollback", prevCoin)
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
              {item.cost?.toLocaleString()}
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
                : coins < item.cost
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
