import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { toast } from "sonner";

import { useFriendStore } from "@/domains/user/stores/friendStore";
import { useUserLoginStore } from "@/domains/user/stores/userStore";
import { useChatStore } from "@/domains/chat/stores/chatStore";

import { FriendCard } from "@/domains/user/components/friends/FriendCard";
import { ProfileModal } from "@/domains/user/components/friends/FriendProfile";
import { inputBase, touchTarget } from "./friendsTheme";
import { authService } from "@/domains/user/services/authService";

type FriendEdge = {
  friendUid: number;  // 친구의 ID
  memberId: number;   // 나의 ID (혹은 반대일 수 있음)
  isAccepted: boolean;
  online: boolean;
};

type MemberProfile = {
  memberUid: number;
  nickname: string;
  char2dpath?: string;
  level?: number;
};

export default function FriendListTab() {
  const { removeFriend } = useFriendStore();
  const friends = useFriendStore((s) => s.friends);
  const setFriends = useFriendStore((s) => s.setFriends);

  const openChat = useChatStore((s) => s.openChat);
  const user = useUserLoginStore((s) => s.userData);

  const [searchQuery, setSearchQuery] = useState("");

  // ⭐ 친구 프로필 모달 상태
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<any>(null);

  // ⭐ 간단 캐시: 같은 친구 프로필을 여러 번 부르지 않게
  const profileCache = useRef(new Map<number, MemberProfile>());

  // 1) 친구 엣지 목록 불러오기
  useEffect(() => {
    authService.getFriends()
      .then(async (res) => {
        const raw: FriendEdge[] = res?.data ?? [];
        if (!Array.isArray(raw)) {
          console.error("⚠️ friends 응답이 배열이 아닙니다:", raw);
          setFriends([]);
          return;
        }

        // 2) 하이드레이션: 각 friendUid로 프로필 조회
        const ids = raw.map((e) => e.memberId).filter(Boolean);
        const uniqueIds = Array.from(new Set(ids));

        // 캐시에 없는 ID만 조회
        const needFetch = uniqueIds.filter((id) => !profileCache.current.has(id));

        await Promise.all(
          needFetch.map(async (id) => {
            try {
              const r = await authService.getProfile(id);
              const data: MemberProfile = (r.data?.data ?? r.data) as MemberProfile;
              if (data?.memberUid) profileCache.current.set(id, data);
            } catch (err) {
              console.warn("프로필 조회 실패:", id, err);
              // 실패해도 진행 (닉네임만 "알 수 없음"으로 표시)
              profileCache.current.set(id, {
                memberUid: id,
                nickname: "알 수 없음",
                char2dpath: "",
                level: 0,
              });
            }
          })
        );

        // 3) 엣지 + 프로필 머지 → 카드용 뷰모델
        const merged = raw.map((edge) => {
          const p = profileCache.current.get(edge.memberId);
          return {
            memberId: edge.memberId,
            friendUid: edge.friendUid,
            nickname: p?.nickname ?? "알 수 없음",
            avatarUrl: p?.char2dpath ?? "",
            level: p?.level ?? 0,
            status: (edge.online ? "online" : "offline") as "online" | "offline" | "playing",
            mutualFriends: 0,
          };
        });

        setFriends(merged);
      })
      .catch((err) => {
        console.error("친구 목록 불러오기 실패", err);
        toast.error("친구 목록 불러오기에 실패했어요.");
      });
  }, [setFriends]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter((f: any) =>
      (f?.nickname ?? "").toLowerCase().includes(q)
    );
  }, [friends, searchQuery]);

  const handleRemove = async (uid: number) => {
    try {
      await authService.removeFriend(uid);
      removeFriend(uid);
      toast.success("친구가 삭제되었어요.");
    } catch (err) {
      console.error("친구 삭제 실패", err);
      toast.error("친구 삭제에 실패했어요.");
    }
  };

  const handleBlock = async (uid: number) => {
    try {
      await authService.toggleBlockUser(uid);
      try {
        await authService.removeFriend(uid);
        removeFriend(uid);
        toast.success("차단하고 친구 목록에서도 제거했어요.");
      } catch (delErr) {
        console.error("친구 삭제 실패(차단은 완료됨)", delErr);
        toast.warning("차단은 완료했지만 친구 삭제는 실패했어요.");
      }
    } catch (err) {
      console.error("차단 실패", err);
      toast.error("차단에 실패했어요.");
    }
  };

  const handleChatStart = (memberId: number) => {
    const friend = friends.find(
      (f: any) => f.memberId === memberId || f.friendUid === memberId
    );
    if (!friend) return console.error("❌ 해당 친구를 찾을 수 없습니다.");
    if (!user) return console.error("❌ 로그인 정보가 없습니다.");
    const peerMemberId = friend.memberId ?? friend.friendUid;
    const peerNickname = friend.nickname ?? "알 수 없음";
    openChat(peerMemberId, peerNickname);
  };

  const handleViewProfile = (memberId: number) => {
    const f = friends.find((x: any) => x.memberId === memberId || x.friendUid === memberId);
    if (!f) return;
    setSelectedFriend({
      ...f,
      // 모달에서 레벨 표시 위해 xp로 환산(100당 1레벨 규칙 유지)
      xp: (f.level ?? 0) * 100,
      score: 0,
      yoloScore: 0,
      firstWinCnt: 0,
      secondWinCnt: 0,
      thirdWinCnt: 0,
    });
    setProfileOpen(true);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        {/* 검색 바 */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="친구 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${inputBase} px-12 py-4 text-base ${touchTarget}`}
          />
        </div>

        {/* 친구 목록 */}
        <div className="flex flex-col gap-6">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <motion.p className="text-muted-foreground text-center text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                친구가 없습니다.
              </motion.p>
            ) : (

              filtered.map((friend: any, index: number) => (
                <FriendCard
                  key={`${friend.memberId ?? friend.friendUid}-${index}`}
                  memberId={friend.memberId}
                  nickname={friend.nickname}
                  avatarUrl={friend.avatarUrl}
                  level={friend.level}
                  status={friend.status}
                  mutualFriends={friend.mutualFriends ?? 0}
                  onChat={handleChatStart}
                  onRemove={handleRemove}
                  onBlock={handleBlock}
                  onViewProfile={handleViewProfile}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* 친구 프로필 모달 */}
      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        isOwnProfile={false}
        memberOverride={selectedFriend || undefined}
      />
    </>
  );
}
