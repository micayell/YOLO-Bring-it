// import { useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useItemStore } from "@/app/stores/itemStore";
// import { ShopItemsCard } from "./ShopItemsCard";
// import { useUserLoginStore } from "@/app/stores/userStore";

// interface ShopItemsListProps {
//   categoryId: string;
// }



// export const ShopItemsList = ({categoryId}: ShopItemsListProps) => {
//   const {
//     items,
//     selectedCategory,
//     ownedItemIds,
//     setItems,
//     setOwnedItems,
//     setCoins,
//   } = useItemStore();

//   const { userData } = useUserLoginStore();
  
// useEffect(() => {
//   const fetchShopData = async () => {
//     try {
//       const token = localStorage.getItem("accessToken");

//       const res = await fetch(
//         // `http://i13c207.p.ssafy.io:8080/v1/items?kind=${categoryId}`,
//         `https://i13C207.p.ssafy.io/api/v1/users/items?kind=${categoryId}`,
//         {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (!res.ok) throw new Error(`HTTP 오류 상태: ${res.status}`);

//       const data = await res.json();

//       // ✅ 여기가 새로운 매핑 코드 위치
//       const mappedItems = data.data.map((item: any) => ({
//         id: String(item.itemUid),
//         name: item.name,
//         cost: item.cost,
//         category: convertCategoryCodeToKey(item.categoryCode),
//         image: item.imageUrl || "",
//         description: item.description || "",
//       }));

//       setItems(mappedItems); // 🔁 여기로 변경
//       setOwnedItems(data.ownedItemIds || []);
//       setCoins(data.coins || 0);
//     } catch (err) {
//       console.error("❌ 아이템 불러오기 실패:", err);
//       setItems([]);
//     }
//   };

//   fetchShopData();
// }, [categoryId, setItems, setOwnedItems, setCoins]);

// // 🧠 맨 아래 helper 함수 정의
// function convertCategoryCodeToKey(code: string): "character" | "title" | "badge" {
//   switch (code) {
//     case "CHA":
//       return "character";
//     case "TIT":
//       return "title";
//     case "BAD":
//       return "badge";
//     default:
//       return "character"; // fallback
//   }
// }

//   console.log("?????",items)
  
//   const filteredItems =
//   Array.isArray(items)
//     ? items.filter((item) => item.category === categoryId)
//     : [];
//   console.log("🔥 filteredItems", categoryId);
//   console.log("🔥 filteredItems", filteredItems);
//   return (
//     <motion.div className="grid grid-cols-3 gap-4">
//       <AnimatePresence>
//         {Array.isArray(filteredItems) &&
//           filteredItems.map((item, index) => (
//           <motion.div
//             key={item.id}
//             layout
//             initial={{ opacity: 0, scale: 0.8, y: 30 }}
//             animate={{ opacity: 1, scale: 1, y: 0 }}
//             exit={{ opacity: 0, scale: 0.8, y: -30 }}
//             transition={{ delay: index * 0.05, duration: 0.4 }}
//           >
//           <ShopItemsCard item={item} owned={ownedItemIds.includes(item.id)} />
//         </motion.div>
//       ))}
//       </AnimatePresence>
//     </motion.div>
//   );
// };



// components/shops/ShopItemsList.tsx
// import { AnimatePresence, motion } from "framer-motion";
// import { useItemStore } from "@/app/stores/itemStore";
// import { ShopItemsCard } from "./ShopItemsCard";

// export const ShopItemsList = () => {
//   const items = useItemStore((s) => s.items);
//   const selectedCategory = useItemStore((s) => s.selectedCategory);
//   const ownedItemIds = useItemStore((s) => s.ownedItemIds); // ✅ 추가

//   const filteredItems =
//     Array.isArray(items)
//       ? items
//           .filter((item) => item.category === selectedCategory) // ✅ 카테고리 일치
//           .filter((item) => !ownedItemIds.includes(item.id))    // ✅ 보유한 건 제외
//       : [];

//   return (
//     <motion.div className="grid grid-cols-3 gap-4">
//       <AnimatePresence>
//         {filteredItems.map((item, index) => (
//           <motion.div
//             key={item.id}
//             layout
//             initial={{ opacity: 0, scale: 0.8, y: 30 }}
//             animate={{ opacity: 1, scale: 1, y: 0 }}
//             exit={{ opacity: 0, scale: 0.8, y: -30 }}
//             transition={{ delay: index * 0.05, duration: 0.4 }}
//           >
//             {/* 보유 아이템은 리스트에서 제거했으므로 owned prop 불필요 */}
//             <ShopItemsCard item={item} />
//           </motion.div>
//         ))}
//       </AnimatePresence>
//     </motion.div>
//   );
// };


import { AnimatePresence, motion } from "framer-motion";
import { useItemStore } from "@/app/stores/itemStore";
import { ShopItemsCard } from "./ShopItemsCard";

export const ShopItemsList = () => {
  const items = useItemStore((s) => s.items);
  const selectedCategory = useItemStore((s) => s.selectedCategory);
  const ownedItemIds = useItemStore((s) => s.ownedItemIds);

  const filteredItems =
    Array.isArray(items)
      ? items
          .filter((item) => item.category === selectedCategory) // 카테고리 일치
          .filter((item) => !ownedItemIds.includes(item.id))    // 보유 제외
      : [];

  return (
    <motion.div className="grid grid-cols-3 gap-4">
      <AnimatePresence>
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -30 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
          >
            <ShopItemsCard item={item} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};