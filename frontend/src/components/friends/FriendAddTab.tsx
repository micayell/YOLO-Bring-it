import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import AddFriendCard from "@/components/friends/FriendAddCard";
import { useFriendStore } from "@/app/stores/friendStore";
import { toast } from "sonner";
import { authService } from "@/shared/services/authService";
import { inputBase, touchTarget } from "./friendsTheme";

interface MemberResult {
  memberUid: number;
  nickname: string;
  avatarUrl: string;
  level: number;
}

export default function AddFriendTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<MemberResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { addRequest, friendRequests } = useFriendStore();

  const requestedIds = new Set(friendRequests.map((r: any) => r.memberId));

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      setLoading(true);
      setError("");

      authService.searchUsers(searchQuery)
        .then((resData) => {
          setResults(Array.isArray(resData) ? resData : resData.data);
        })
        .catch((err) => {
          console.error("검색 실패:", err);
          setError(err.response?.data?.message || err.message);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSendRequest = async (receiverId: number) => {
    try {
      setLoading(true);
      await authService.sendFriendRequest(receiverId);

      const sentUser = results.find((u) => u.memberUid === receiverId);
      if (sentUser) {
        addRequest({
          id: Date.now(),
          memberId: sentUser.memberUid,
          nickname: sentUser.nickname,
          avatarUrl: sentUser.avatarUrl,
          level: sentUser.level,
          mutualFriends: 0,
          sentAt: new Date().toISOString(),
        });
      }
      setResults((prev) => prev.filter((u) => u.memberUid !== receiverId));
      toast.success(`${sentUser?.nickname}님께 친구 요청을 보냈어요!`);
    } catch (err: any) {
      toast.error(err?.message ?? "요청 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      {/* 검색 바 */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <input
          type="text"
          placeholder="유저 닉네임 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`${inputBase} px-12 py-4 text-base ${touchTarget}`}
        />
      </div>

      {/* 결과 리스트 */}
      <div className="flex flex-col gap-6">
        {loading ? (
          <p className="text-muted-foreground text-sm text-center">검색 중...</p>
        ) : error ? (
          <p className="text-destructive text-sm text-center">{error}</p>
        ) : results.length === 0 && searchQuery ? (
          <p className="text-muted-foreground text-sm text-center">일치하는 유저가 없습니다.</p>
        ) : (
          results.map((user) => (
            <AddFriendCard
              key={user.memberUid}
              memberId={user.memberUid}
              nickname={user.nickname}
              avatarUrl={user.avatarUrl}
              level={user.level}
              mutualFriends={0}
              requested={requestedIds.has(user.memberUid)}
              onSendRequest={() => handleSendRequest(user.memberUid)}
            />
          ))
        )}
      </div>
    </motion.div>
  );
}
