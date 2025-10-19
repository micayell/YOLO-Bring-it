// // import { motion, AnimatePresence } from "framer-motion";
// // import { UserX } from "lucide-react";
// // import BlockedCard from "./BlockedCard";
// // import { useFriendStore } from "../../app/stores/friendStore";

// // export default function BlockedListTab() {
// //   const blockedUsers = useFriendStore((state) => state.blockedUsers);
// //   const unblockUser = useFriendStore((state) => state.unblockUser);

// //   return (
// //     <motion.div
// //       initial={{ opacity: 0, y: 20 }}
// //       animate={{ opacity: 1, y: 0 }}
// //       transition={{ duration: 0.6 }}
// //       className="font-optimized"
// //     >
// //       {blockedUsers.length === 0 ? (
// //         <motion.div
// //           className="text-center font-optimized py-20"
// //           initial={{ opacity: 0, scale: 0.8 }}
// //           animate={{ opacity: 1, scale: 1 }}
// //           transition={{ duration: 0.6 }}
// //         >
// //           <UserX className="mx-auto text-muted-foreground w-20 h-20 mb-6" />
// //           <h3 className="game-text text-foreground font-optimized text-[clamp(1.125rem,4vw,1.5rem)] font-medium leading-snug mb-2">
// //             차단한 사용자가 없습니다
// //           </h3>
// //           <p className="text-muted-foreground font-optimized text-[clamp(0.875rem,3vw,1rem)] font-normal leading-relaxed">
// //             사용자를 차단하면 여기에 표시됩니다.
// //           </p>
// //         </motion.div>
// //       ) : (
// //         <div className="flex flex-col gap-6 font-optimized">
// //           <AnimatePresence>
// //             {blockedUsers.map((user, index) => (
// //               <BlockedCard
// //                 key={user.id}
// //                 id={user.id}
// //                 nickname={user.nickname}
// //                 avatarUrl={user.avatarUrl}
// //                 blockedAt={user.blockedAt}
// //                 onUnblock={() => unblockUser(user.id)}
// //               />
// //             ))}
// //           </AnimatePresence>
// //         </div>
// //       )}
// //     </motion.div>
// //   );
// // }




// import { motion, AnimatePresence } from "framer-motion";
// import { UserX } from "lucide-react";
// import BlockedCard from "./BlockedCard";
// import { useFriendStore } from "../../app/stores/friendStore";
// import axios from "axios";
// import { toast } from "sonner";
// import { useEffect } from "react";

// export default function BlockedListTab() {
//   const blockedUsers = useFriendStore((state) => state.blockedUsers);
//   const unblockUser = useFriendStore((state) => state.unblockUser);
//   const setBlockedUsers = useFriendStore((state) => state.setBlockedUsers);

//   // ✅ 진입 시 차단 목록 불러오기
//   useEffect(() => {
//     const fetchBlockedUsers = async () => {
//       try {
//         const token = localStorage.getItem("accessToken");

//         const res = await axios.get(
//           "https://i13C207.p.ssafy.io/api/v1/users/blocked-members/list",
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         // ✅ 응답 구조에 맞게 수정 필요
//         // 예시: { data: [...] } 라면 아래처럼 처리
//         console.log("차단한 사람 목록입니다")
//         setBlockedUsers(res.data.data); // <- 구조에 따라 조정 필요

//       } catch (err) {
//         console.error("차단 목록 불러오기 실패:", err);
//         toast.error("차단 목록을 불러오지 못했어요.");
//       }
//     };

//     fetchBlockedUsers();
//   }, []);

//   const handleUnblock = async (userId: number) => {
//     try {
//       const token = localStorage.getItem("accessToken");

//       await axios.put(
//         `https://i13C207.p.ssafy.io/api/v1/users/blocked-members/${userId}/toggle`,
//         {}, // ✅ PUT 요청에 body가 필요 없으면 빈 객체 전달
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       unblockUser(userId);
//       toast.success("차단을 해제했어요.");
//     } catch (err) {
//       console.error("차단 해제 실패:", err);
//       toast.error("차단 해제에 실패했어요.");
//     }
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.6 }}
//       className="font-optimized"
//     >
//       {/* ✅ 배열이 아닐 경우 방어 처리 */}
//       {Array.isArray(blockedUsers) && blockedUsers.length === 0 ? (
//         <motion.div
//           className="text-center font-optimized py-20"
//           initial={{ opacity: 0, scale: 0.8 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.6 }}
//         >
//           <UserX className="mx-auto text-muted-foreground w-20 h-20 mb-6" />
//           <h3 className="game-text text-foreground font-optimized text-[clamp(1.125rem,4vw,1.5rem)] font-medium leading-snug mb-2">
//             차단한 사용자가 없습니다
//           </h3>
//           <p className="text-muted-foreground font-optimized text-[clamp(0.875rem,3vw,1rem)] font-normal leading-relaxed">
//             사용자를 차단하면 여기에 표시됩니다.
//           </p>
//         </motion.div>
//       ) : (
//         <div className="flex flex-col gap-6 font-optimized">
//           <AnimatePresence>
//             {Array.isArray(blockedUsers) &&
//               blockedUsers.map((user) => (
//                 <BlockedCard
//                   key={user.id}
//                   id={user.id}
//                   nickname={user.nickname}
//                   avatarUrl={user.avatarUrl}
//                   blockedAt={user.blockedAt}
//                   onUnblock={() => handleUnblock(user.id)}
//                 />
//               ))}
//           </AnimatePresence>
//         </div>
//       )}
//     </motion.div>
//   );
// }




import { motion, AnimatePresence } from "framer-motion";
import { UserX } from "lucide-react";
import BlockedCard from "@/components/friends/BlockedCard";
import { useFriendStore } from "@/app/stores/friendStore";
import apiClient from "@/shared/services/api";
import { toast } from "sonner";
import { useEffect } from "react";
import { getAuthHeaders } from "./auth";

export default function BlockedListTab() {
  const blockedUsers = useFriendStore((state) => state.blockedUsers);
  const unblockUser = useFriendStore((state) => state.unblockUser);
  const setBlockedUsers = useFriendStore((state) => state.setBlockedUsers);

  console.log("이게 왜 불낙이야",blockedUsers)

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        const res = await apiClient.get(
          "/users/blocked-members/list",
          { headers: getAuthHeaders() }
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
      console.log("내가 불낙이야?", memberUid)
      await apiClient.put(
        `/users/blocked-members/${memberUid}/toggle`,
        {},
        { headers: getAuthHeaders() }
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