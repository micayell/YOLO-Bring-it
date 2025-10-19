// src/components/items/itemsCard.tsx

import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { OptimizedImage } from "@/shared/ui/OptimizedImage";
import type { InventoryItem } from "@/components/items/itemsList";

export default function ItemsCard({
  item,
  index,
  onClick,
  onEquip,
}: {
  item: InventoryItem;
  index: number;
  onClick: () => void;
  onEquip: () => void; // 장착/해제 토글
}) {
  const isBadge = item.category === "badge";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -50 }}
      transition={{ delay: index * 0.05, duration: 0.6 }}
      className={`relative bg-card/90 backdrop-blur-sm rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer p-3 sm:p-4 lg:p-5 group ${
        item.equipped
          ? "border-[#6dc4e8] bg-[rgba(109,196,232,0.1)] shadow-[#6dc4e8]/20"
          : "border-border/50 hover:border-[#6dc4e8]"
      }`}
      style={{
        minHeight: "clamp(8rem, 20vh, 12rem)",
        boxShadow: item.equipped
          ? "0 8px 30px rgba(109, 196, 232, 0.3)"
          : "0 4px 20px rgba(0,0,0,0.08)",
      }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onClick}
    >
      {item.equipped && (
        <motion.div
          className="absolute top-3 left-3 bg-[#6dc4e8] text-white rounded-xl text-xs flex items-center z-10"
          style={{ padding: "0.25rem 0.5rem", gap: "0.25rem" }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Shield style={{ width: "0.75rem", height: "0.75rem" }} />
          장착중
        </motion.div>
      )}

      {isBadge ? (
        <div className="flex flex-col items-center justify-center h-full space-y-2">
          <h3 className="game-text text-foreground text-center font-bold" style={{ fontSize: "clamp(1.2rem, 4vw, 2.5rem)", lineHeight: 1.2 }}>
            {item.name}
          </h3>
          {item.description && (
            <p className="text-muted-foreground text-center text-sm" style={{ maxWidth: '80%' }}>
              {item.description}
            </p>
          )}
          
          <div className="absolute bottom-4 left-0 right-0 p-2 text-center">
             <button
                className={`px-6 py-2 rounded-md text-base transition shrink-0 font-bold ${
                item.equipped
                    ? "bg-border hover:bg-border/80"
                    : "bg-[#6dc4e8] text-white hover:bg-[#5ab4d8]"
                }`}
                onClick={(e) => {
                e.stopPropagation();
                onEquip();
                }}
             >
                {item.equipped ? "해제" : "장착"}
            </button>
          </div>
        </div>
      ) : (
        <>
          <motion.div
            className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-muted/50 flex items-center justify-center"
            style={{ marginTop: "var(--spacing-4xl)", marginBottom: "var(--spacing-lg)" }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.25 }}
          >
            <OptimizedImage
              src={item.image}
              alt={item.name}
              className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
            />
            <motion.div
              className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            >
              <div className="text-white text-sm font-medium">상세보기</div>
            </motion.div>
          </motion.div>

          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="game-text text-foreground" style={{ fontSize: "clamp(0.875rem, 3vw, 1rem)" }}>
                {item.name}
              </h3>
              {item.description && (
                <p
                  className="text-muted-foreground hidden sm:block"
                  style={{ fontSize: "0.875rem" }}
                >
                  {item.description}
                </p>
              )}
            </div>

            <button
              className={`px-6 py-2 rounded-md text-base transition shrink-0 font-bold ${
                item.equipped
                  ? "bg-border hover:bg-border/80"
                  : "bg-[#6dc4e8] text-white hover:bg-[#5ab4d8]"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onEquip();
              }}
            >
              {item.equipped ? "해제" : "장착"}
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}