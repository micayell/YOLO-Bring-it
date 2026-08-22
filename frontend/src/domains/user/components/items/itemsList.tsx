// src/components/items/itemsList.tsx
import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import ItemsCard from "./itemsCard";

import { useInventoryStore } from "@/domains/user/stores/inventoryStore";

export type InventoryItem = {
  id: string;
  name: string;
  image: string;
  modelUrl?: string;
  description: string;
  category: "character" | "title" | "badge";
  equipped?: boolean;
};

export default function ItemsList({
  items,
  onSelectItem,
  onEquip,
}: {
  items: InventoryItem[];
  onSelectItem: (item: InventoryItem | null) => void;
  onEquip: (id: string) => Promise<void> | void;
}) {
  const selectedCategory = useInventoryStore((s) => s.selectedCategory);

  const filteredItems = useMemo(() => {
    // selectedCategory가 유효한 카테고리일 때만 필터링을 적용
    const validCategories: ("character" | "title" | "badge")[] = ["character", "title", "badge"];
    if (validCategories.includes(selectedCategory)) {
      return items.filter(item => item.category === selectedCategory);
    }
    // 유효한 카테고리가 아니면 빈 배열 반환
    return [];
  }, [items, selectedCategory]);

  return (
    <motion.div
      className="grid grid-cols-3 gap-4 font-optimized"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence>
        {filteredItems.length > 0 ? (
          filteredItems.map((item, index) => (
            <ItemsCard
              key={item.id}
              item={item}
              index={index}
              onClick={() => onSelectItem(item)}
              onEquip={() => onEquip(item.id)}
            />
          ))
        ) : (
          <div className="col-span-3 text-center py-8 text-gray-500">
            <p>보여줄 아이템이 없습니다. 다른 카테고리를 선택하세요.</p>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}