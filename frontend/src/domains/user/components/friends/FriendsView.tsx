import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Users, ArrowLeft, UserPlus, Mail, UserX } from "lucide-react";

// 탭별 리스트 컴포넌트
import FriendListTab from "@/domains/user/components/friends/FriendListTab";
import AcceptListTab from "@/domains/user/components/friends/AcceptListTab";
import BlockedListTab from "@/domains/user/components/friends/BlockedListTab";
import AddFriendTab from "@/domains/user/components/friends/FriendAddTab";

// 전역 스토어에서 카운트/상태 읽기
import { useFriendStore } from "@/domains/user/stores/friendStore";

type TabId = "friends" | "requests" | "blocked" | "add";

interface FriendsScreenProps {
  onBack?: () => void;
}

export default function FriendsScreen({ onBack }: FriendsScreenProps) {
  const [selectedTab, setSelectedTab] = useState<TabId>("friends");

  const friends = useFriendStore((s) => s.friends);
  const friendRequests = useFriendStore((s) => s.friendRequests);
  const blockedUsers = useFriendStore((s) => s.blockedUsers);

  const onlineCount = useMemo(
    () =>
      (friends ?? []).filter(
        (f) => f.status === "online" || f.status === "playing"
      ).length,
    [friends]
  );

  const tabs: Array<{
    id: TabId;
    name: string;
    icon: any;
    count?: number;
  }> = useMemo(
    () => [
      { id: "friends", name: "친구", icon: Users, count: friends?.length ?? 0 },
      { id: "requests", name: "요청", icon: Mail, count: friendRequests?.length ?? 0 },
      { id: "blocked", name: "차단", icon: UserX, count: blockedUsers?.length ?? 0 },
      { id: "add", name: "추가", icon: UserPlus },
    ],
    [friends?.length, friendRequests?.length, blockedUsers?.length]
  );

  return (
    <motion.div
      className="min-h-screen bg-background text-foreground overflow-hidden font-optimized"
      style={{
        maxWidth: "100vw",
        fontSize: "var(--text-base)",
        fontWeight: "var(--font-weight-normal)",
        lineHeight: "1.5",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* 배경 */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-transparent to-blue-50/20 dark:from-green-950/20 dark:via-transparent dark:to-blue-950/10" />
      <motion.div
        className="absolute w-40 h-40 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full blur-3xl"
        style={{ top: "var(--spacing-5xl)", right: "var(--spacing-5xl)" }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3], x: [-20, 20, -20] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <div
        className="relative z-10 h-full overflow-y-auto font-optimized"
        style={{ padding: "var(--spacing-lg)", paddingTop: "var(--spacing-2xl)" }}
      >
        {/* 헤더 */}
        <motion.div
          className="bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm
                       flex flex-col gap-3 sm:gap-4"
          style={{ padding: "var(--spacing-lg) var(--spacing-xl)", minHeight: "var(--header-xs)" }}
        >
          <div className="flex items-center justify-between bg-origin-padding">
            <div className="flex items-center" style={{ gap: "var(--spacing-lg)" }}>
              <button
                className="relative flex items-center bg-card/60 hover:bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden transition-all duration-300 touch-target game-text shadow-sm"
                style={{ padding: "var(--spacing-md) var(--spacing-lg)", gap: "var(--spacing-sm)" }}
                onClick={onBack}
              >
                <ArrowLeft style={{ width: "var(--icon-md)", height: "var(--icon-md)" }} />
                <span className="relative z-10 hidden sm:inline">뒤로가기</span>
              </button>

              <div className="flex items-center" style={{ gap: "var(--spacing-md)" }}>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="text-white" style={{ width: "var(--icon-md)", height: "var(--icon-md)" }} />
                </div>
                <h1 className="game-text text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-yellow-400 dark:to-orange-400"
                  style={{ fontSize: "clamp(1.25rem, 4vw, 2rem)", fontWeight: "var(--font-weight-medium)" }}>
                  친구
                </h1>
              </div>
            </div>
          </div>
          {/* 온라인 친구 수 뱃지 */}
          <motion.div
            className="bg-card/50 backdrop-blur-sm rounded-xl shadow-lg border border-border flex items-center font-optimized"
            style={{ padding: "var(--spacing-sm) var(--spacing-xl)" }}
            animate={{
              boxShadow: [
                "0 0 15px rgba(107,207,127,0.3)",
                "0 0 25px rgba(107,207,127,0.5)",
                "0 0 15px rgba(107,207,127,0.3)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="bg-[#6bcf7f] rounded-full animate-pulse" style={{ width: "0.75rem", height: "0.75rem" }} />
            <span
              className="game-text text-foreground font-optimized"
              style={{ fontSize: "clamp(1rem, 4vw, 1.25rem)", fontWeight: "var(--font-weight-medium)", lineHeight: "1.4" }}
            >
              온라인 {onlineCount}명
            </span>
          </motion.div>
        </motion.div>

        {/* 탭 네비게이션 */}
        <div className="overflow-x-auto mt-[var(--spacing-xl)] mb-[var(--spacing-4xl)] border-b border-border">
          <motion.div
            className="w-fit mx-auto flex pb-3 font-optimized"
            style={{ gap: "var(--spacing-md)" }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = selectedTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                className={`relative flex-shrink-0 flex items-center rounded-lg overflow-hidden transition-all duration-300 touch-target font-optimized game-text ${
                  isActive ? "bg-[#6dc4e8] text-white shadow-lg" : "text-foreground bg-card/50 hover:bg-card/70 border border-border"
                }`}
                style={{
                  gap: "var(--spacing-sm)",
                  padding: "var(--spacing-md) var(--spacing-xl)",
                  fontSize: "clamp(0.875rem, 3vw, 1rem)",
                  fontWeight: "var(--font-weight-medium)",
                  lineHeight: "1.5",
                  minHeight: "var(--touch-target-min)",
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedTab(tab.id)}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
              >
                <Icon style={{ width: "var(--icon-sm)", height: "var(--icon-sm)" }} />
                <span className="relative z-10">{tab.name}</span>
                {(tab.count ?? 0) > 0 && (
                  <motion.span
                    className="bg-white/30 text-xs rounded-full font-optimized"
                    style={{
                      padding: "var(--spacing-xs) var(--spacing-sm)",
                      fontSize: "0.75rem",
                      fontWeight: "var(--font-weight-medium)",
                      lineHeight: "1.2",
                    }}
                    animate={{ scale: tab.id === "requests" ? [1, 1.1, 1] : 1 }}
                    transition={{ duration: 1.5, repeat: tab.id === "requests" ? Infinity : 0, ease: "easeInOut" }}
                  >
                    {tab.count}
                  </motion.span>
                )}
                {isActive && (
                  <motion.div
                    className="absolute top-0 left-0 w-[120%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                    animate={{ x: ["-120%", "120%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
                  />
                )}
              </motion.button>
            );
          })}
          </motion.div>
        </div>
        {/* 탭 콘텐츠 */}
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-0"
        >
          {selectedTab === "friends" && <FriendListTab />}
          {selectedTab === "requests" && <AcceptListTab />}
          {selectedTab === "blocked" && <BlockedListTab />}
          {selectedTab === "add" && <AddFriendTab />}
        </motion.div>
      </div>
    </motion.div>
  );
}