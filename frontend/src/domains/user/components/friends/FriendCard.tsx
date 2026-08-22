// src/components/friends/FriendCard.tsx
import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, User as UserIcon, MoreVertical, UserMinus, UserX } from "lucide-react";

export interface FriendCardProps {
  // 표시
  memberId: number;
  nickname: string;
  avatarUrl?: string;
  level?: number;
  status?: "online" | "offline" | "playing";
  mutualFriends?: number;

  // 액션
  onChat: (memberId: number) => void;
  onRemove: (memberId: number) => void;
  onBlock: (memberId: number) => void;

  // ⭐ NEW: 프로필 보기
  onViewProfile: (memberId: number) => void;
}


export const FriendCard = memo(function FriendCard({
  memberId,
  nickname,
  avatarUrl,
  level = 0,
  status = "offline",
  onChat,
  onRemove,
  onBlock,
  onViewProfile,
}: FriendCardProps) {
  
  const [menuOpen, setMenuOpen] = useState(false);
  
  return (
    <motion.div
      className="flex items-center justify-between rounded-2xl border px-4 py-3 bg-white"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
    >
      {/* 좌측 정보 */}
      <div className="flex items-center gap-4">
        <div className="relative h-12 w-12 overflow-hidden rounded-full bg-gray-200">
          {avatarUrl ? (
            <img src={avatarUrl} alt={nickname} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-gray-500">🙂</div>
          )}
        </div>
        <div>
          <div className="font-medium">{nickname || "알 수 없음"}</div>
          <div className="text-xs text-muted-foreground">
            레벨 {level ?? 0} · {status === "online" ? "온라인" : status === "playing" ? "플레이 중" : "오프라인"}
          </div>
        </div>
      </div>

      {/* 우측 액션 */}
      <div className="flex items-center gap-2">
        {/* ⭐ NEW: 프로필 버튼 (채팅 왼쪽) */}
        <motion.button
          onClick={() => onViewProfile(memberId)}
          className="grid h-9 w-9 place-items-center rounded-lg bg-gray-100 hover:bg-gray-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="프로필 보기"
        >
          <UserIcon className="h-5 w-5" />
        </motion.button>

        {/* 기존: 채팅 버튼 */}
        <motion.button
          onClick={() => onChat(memberId)}
          className="grid h-9 w-9 place-items-center rounded-lg bg-sky-100 hover:bg-sky-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="채팅"
        >
          <MessageCircle className="h-5 w-5" />
        </motion.button>

        {/* 기타 메뉴 */}
        <div className="relative">
          <motion.button 
            className="grid h-9 w-9 place-items-center rounded-lg hover:bg-gray-100" 
            title="더보기"
            onClick={() => setMenuOpen(prev => !prev)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MoreVertical className="h-5 w-5" />
          </motion.button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-lg border border-border p-1 z-10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <button
                  onClick={() => {
                    onRemove(memberId);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left text-yellow-600 hover:bg-yellow-50 transition-colors duration-200 flex items-center px-4 py-2 gap-2 text-sm"
                >
                  <UserMinus className="w-4 h-4" />
                  친구 삭제
                </button>
                <button
                  onClick={() => {
                    onBlock(memberId);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center px-4 py-2 gap-2 text-sm"
                >
                  <UserX className="w-4 h-4" />
                  차단하기
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
});
