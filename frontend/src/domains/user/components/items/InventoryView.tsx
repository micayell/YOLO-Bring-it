// src/pages/InventoryScreen.tsx

import { useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Package, ArrowLeft } from "lucide-react";
import ItemsList, { type InventoryItem } from "@/domains/user/components/items/itemsList";
import { useInventoryStore, type CategoryId } from "@/domains/user/stores/inventoryStore";
import apiClient from "@/shared/services/api";
import { useUserLoginStore } from "@/domains/user/stores/userStore";

// ✅ 업적에서 얻은 BAD 아이템 병합용
import { useItemStore } from "@/domains/user/stores/itemStore";

const CATEGORY_META: { id: CategoryId; name: string; color: string }[] = [
  { id: "character", name: "캐릭터", color: "#ff6b6b" },
  { id: "title", name: "배지", color: "#ffd93d" },
  { id: "badge", name: "칭호", color: "#6bcf7f" },
];

const categoryCodeMap: Record<CategoryId, string> = {
  character: "CHA",
  title: "TIT",
  badge: "BAD",
};

export default function InventoryScreen({ onBack }: { onBack: () => void }) {
  const items = useInventoryStore((s) => s.items);
  const selectedCategory = useInventoryStore((s) => s.selectedCategory);
  const setCategory = useInventoryStore((s) => s.setCategory);
  const setItems = useInventoryStore((s) => s.setItems);
  const setLoading = useInventoryStore((s) => s.setLoading);
  const setError = useInventoryStore((s) => s.setError);

  const scrollRef = useRef<HTMLDivElement>(null);

  const setCharPaths = useUserLoginStore((s) => s.setCharPaths);
  const setEquippedTitle = useUserLoginStore((s) => s.setEquippedTitle);
  const setEquippedBadge = useUserLoginStore((s) => s.setEquippedBadge);

  const currentChar2d = useUserLoginStore((s) => s.userData?.char2dpath);
  const currentChar3d = useUserLoginStore((s) => s.userData?.char3dpath);
  const currentTitlePath = useUserLoginStore((s) => s.userData?.titlepath);
  const currentBadgeName = useUserLoginStore((s) => s.userData?.badgename);

  // ✅ 업적에서 병합된 보유 아이템 ID
  const ownedItemIds = useItemStore((s) => s.ownedItemIds);

  // 목록 조회
  const fetchInventory = useCallback(
    async (category: CategoryId) => {
      const code = categoryCodeMap[category] ?? "CHA";

      setLoading(true);
      setError(null);

      try {
        const res = await apiClient.get(`/users/item-members/${encodeURIComponent(code)}`);

        const d = res.data;
        const payload =
          (Array.isArray(d) && d) ||
          (Array.isArray(d?.data) && d.data) ||
          (Array.isArray(d?.data?.items) && d.data.items) ||
          (Array.isArray(d?.items) && d.items) ||
          (Array.isArray(d?.content) && d.content) ||
          [];

        let list = (payload as any[]).map((it) => ({
          id: String(it.itemMemberUid ?? it.id ?? it.uid),
          name: String(it.name ?? it.itemName ?? ""),
          image: String(it.img1 ?? it.image1 ?? it.imageUrl ?? it.thumbnail ?? ""),
          modelUrl: String(it.img3 ?? it.img2 ?? ""),
          description: String(it.description ?? it.desc ?? ""),
          category,
          equipped: Boolean(it.equipped ?? it.isEquipped ?? it.is_equipped ?? false),
        })) as InventoryItem[];

        setItems(list);
      } catch (e: any) {
        setError(e.message ?? "인벤토리 조회 실패");
      } finally {
        setLoading(false);
      }
    },
    [setItems, setError, setLoading, ownedItemIds]
  );

  // 장착/해제 토글
  const toggleEquip = useCallback(
    async (item: InventoryItem) => {
      const willEquip = !item.equipped;
      const cat = item.category;

      const snapshot = items;
      setItems((prev) =>
        prev.map((i) =>
          i.category !== cat
            ? i
            : willEquip
            ? { ...i, equipped: i.id === item.id }
            : { ...i, equipped: false }
        )
      );

      // 로컬 상태 업데이트
      if (willEquip) {
        switch (cat) {
          case "character":
            setCharPaths({ char2dpath: item.image, char3dpath: item.modelUrl });
            break;
          case "title": // 칭호 아이템 장착 시
            setEquippedTitle(item.image); // titlepath 업데이트
            break;
          case "badge": // 배지 아이템 장착 시
            setEquippedBadge(item.name); // badgename 업데이트
            break;
        }
      } else { // 해제 시
        switch (cat) {
          case "character":
            // 기본 캐릭터 경로로 되돌리기 (필요에 따라)
            setCharPaths({ char2dpath: "기본경로", char3dpath: "기본경로" });
            break;
          case "title":
            setEquippedTitle(""); // 빈 문자열로 초기화
            break;
          case "badge":
            setEquippedBadge(""); // 빈 문자열로 초기화
            break;
        }
      }

      try {
        const res = await apiClient.patch(
          `/users/item-members/${encodeURIComponent(item.id)}/equipment`,
          { equipped: willEquip }
        );

        const data = res?.data?.data ?? res?.data;
        if (willEquip) {
          switch(cat) {
            case "character":
              setCharPaths({
                char2dpath: data?.char2dpath ?? item.image,
                char3dpath: data?.char3dpath ?? item.modelUrl,
              });
              break;
            case "title":
              setEquippedTitle(data?.titlepath ?? item.image);
              break;
            case "badge":
              setEquippedBadge(data?.badgename ?? item.name);
              break;
          }
        } else {
          switch(cat) {
            case "character":
              break;
            case "title":
              setEquippedTitle("");
              break;
            case "badge":
              setEquippedBadge("");
              break;
          }
        }
      } catch (e) {
        setItems(snapshot);
        console.error(e);
        alert("장착/해제에 실패했습니다.");

        // 에러 발생 시 로컬 상태 되돌리기
        if (willEquip) {
          switch (cat) {
            case "character":
              setCharPaths({ char2dpath: currentChar2d, char3dpath: currentChar3d });
              break;
            case "title":
              setEquippedTitle(currentTitlePath ?? "");
              break;
            case "badge":
              setEquippedBadge(currentBadgeName ?? "");
              break;
          }
        }
      }
    },
    [items, setItems, setCharPaths, setEquippedTitle, setEquippedBadge, currentChar2d, currentChar3d, currentTitlePath, currentBadgeName]
  );

  useEffect(() => {
    fetchInventory(selectedCategory);
  }, [selectedCategory, fetchInventory]);

  const handleScroll = useCallback(() => {
    // if (scrollRef.current && scrollRef.current.scrollTop > 50) setShowScrollHint(false);
  }, []);

  return (
    <motion.div className="min-h-screen bg-background text-foreground overflow-hidden font-optimized">
      {/* 헤더 */}
      <motion.div
        className="bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm"
        style={{ padding: "var(--spacing-lg) var(--spacing-xl)" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center" style={{ gap: "var(--spacing-lg)" }}>
            <motion.button
              className="relative flex items-center bg-card/60 hover:bg-card/80 rounded-xl"
              style={{ padding: "var(--spacing-md) var(--spacing-lg)" }}
              onClick={onBack}
            >
              <ArrowLeft style={{ width: "var(--icon-md)", height: "var(--icon-md)" }} />
              <span className="hidden sm:inline">뒤로가기</span>
            </motion.button>
            <div className="flex items-center" style={{ gap: "var(--spacing-md)" }}>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Package className="text-white" />
              </div>
              <h1 className="game-text text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                보관함
              </h1>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 카테고리 */}
      <motion.div className="bg-background/90 backdrop-blur-sm border-b border-border/30" style={{ padding: "var(--spacing-lg) 0" }}>
        <div className="flex justify-center overflow-x-auto px-4" style={{ gap: "var(--spacing-md)" }}>
          {CATEGORY_META.map((c) => {
            const isActive = selectedCategory === c.id;
            return (
              <motion.button
                key={c.id}
                className={`relative flex-shrink-0 flex items-center rounded-2xl ${
                  isActive ? "text-white shadow-lg" : "text-foreground bg-card/60"
                }`}
                style={{
                  gap: "var(--spacing-sm)",
                  padding: "var(--spacing-md) var(--spacing-xl)",
                  backgroundColor: isActive ? c.color : undefined,
                }}
                onClick={() => setCategory(c.id)}
              >
                <span>{c.name}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* 리스트 */}
      <div className="relative flex-1 overflow-hidden">
        <div
          ref={scrollRef}
          className="h-full overflow-y-auto"
          style={{ padding: "var(--spacing-lg)", paddingBottom: "var(--spacing-5xl)" }}
          onScroll={handleScroll}
        >
          <ItemsList
            items={items}
            onSelectItem={() => {}} // setSelectedItem 대신 빈 함수 사용
            onEquip={(id) => {
              const item = useInventoryStore.getState().items.find((i) => i.id === id);
              if (item) toggleEquip(item);
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
