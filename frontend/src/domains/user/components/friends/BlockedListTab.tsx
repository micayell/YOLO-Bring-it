import { motion, AnimatePresence } from "framer-motion";
import { UserX } from "lucide-react";
import BlockedCard from "@/domains/user/components/friends/BlockedCard";
import { useFriendStore } from "@/domains/user/stores/friendStore";
import apiClient from "@/shared/services/api";
import { toast } from "sonner";
import { useEffect } from "react";

export default function BlockedListTab() {
  const blockedUsers = useFriendStore((state) => state.blockedUsers);
  const unblockUser = useFriendStore((state) => state.unblockUser);
  const setBlockedUsers = useFriendStore((state) => state.setBlockedUsers);


  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        const res = await apiClient.get(
          "/users/blocked-members/list"
        );
        setBlockedUsers(res.data?.data ?? []);
      } catch (err) {
        console.error("차단 목록 불러오기 실패:", err);
        toast.error("차단 목록을 불러오지 못했어요.");
      }
    };
    fetchBlockedUsers();
  }, [setBlockedUsers]);

 
  const handleUnblock = async (memberUid: number) => {
    try {
      await apiClient.put(
        `/users/blocked-members/${memberUid}/toggle`,
        {}
      );
      unblockUser(memberUid);
      toast.success("차단을 해제했어요.");
    } catch (err) {
      console.error("차단 해제 실패:", err);
      toast.error("차단 해제에 실패했어요.");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      {Array.isArray(blockedUsers) && blockedUsers.length === 0 ? (
        <motion.div className="text-center py-20" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
          <UserX className="mx-auto text-muted-foreground w-20 h-20 mb-6" />
          <h3 className="game-text text-foreground text-[clamp(1.125rem,4vw,1.5rem)] font-medium leading-snug mb-2">차단한 사용자가 없습니다</h3>
          <p className="text-muted-foreground text-[clamp(0.875rem,3vw,1rem)]">사용자를 차단하면 여기에 표시됩니다.</p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-6">
          <AnimatePresence>
            {Array.isArray(blockedUsers) &&
              blockedUsers.map((user) => (
                <BlockedCard key={user.memberUid} id={user.memberUid} nickname={user.nickname} avatarUrl={user.avatarUrl} blockedAt={user.blockedAt} onUnblock={() => handleUnblock(user.memberUid)} />
              ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}