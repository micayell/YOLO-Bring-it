
import { AnimatePresence, motion } from "framer-motion";
import { useItemStore } from "@/domains/user/stores/itemStore";
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