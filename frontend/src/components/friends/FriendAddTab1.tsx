import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import AddFriendCard from "./FriendAddCard";
import { toast } from "sonner";

interface MemberResult {
  memberId: number;
  nickname: string;
  avatarUrl: string;
  level: number;
  mutualFriends: number; // 이 필드도 필요함 (AddFriendCard에 들어감)
}

export default function AddFriendTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<MemberResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      setLoading(true);
      setError("");

      fetch(`/api/members/search?nickname=${encodeURIComponent(searchQuery)}`)
        .then((res) => {
          if (!res.ok) throw new Error("검색 실패");
          return res.json();
        })
        .then((data) => setResults(data))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);


  const handleSendRequest = async (receiverId: number) => {
    try {
      setLoading(true);
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ receiverId })
      });

      if (!res.ok) throw new Error("친구 요청 실패");

      // 성공 시 상태 반영
      toast.success("친구 요청을 보냈습니다!");
      setResults((prev) =>
        prev.filter((user) => user.memberId !== receiverId)
      );
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "요청 중 오류 발생";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="font-optimized"
    >
      {/* 검색 바 */}
      <div className="relative font-optimized mb-8">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <input
          type="text"
          placeholder="유저 닉네임 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-card/50 backdrop-blur-sm rounded-xl border border-border focus:border-[#6dc4e8] outline-none transition-all duration-300 font-optimized game-text px-12 py-4 text-base"
          style={{ minHeight: "var(--touch-target-min)" }}
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
              key={user.memberId}
              memberId={user.memberId}
              nickname={user.nickname}
              avatarUrl={user.avatarUrl}
              level={user.level}
              mutualFriends={user.mutualFriends}
              onSendRequest={handleSendRequest}
            />
          ))
        )}
      </div>
    </motion.div>
  );
}
