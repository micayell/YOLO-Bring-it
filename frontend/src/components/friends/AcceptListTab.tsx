// // import { useFriendStore } from "../../app/stores/friendStore";
// // import { useState } from "react";
// // import { motion, AnimatePresence } from "framer-motion";
// // import { Mail } from "lucide-react";
// // import AcceptCard from "./AcceptCard";

// // export default function AcceptListTab() {
// //   const requests = useFriendStore((state) => state.friendRequests);
// //   const [processingId, setProcessingId] = useState<number | null>(null);

// //   const handleAccept = (id: number) => {
// //     setProcessingId(id);
// //     // TODO: API 호출 후 상태 업데이트
// //     setTimeout(() => {
// //       console.log("✅ 수락", id);
// //       setProcessingId(null);
// //     }, 1000);
// //   };

// //   const handleReject = (id: number) => {
// //     setProcessingId(id);
// //     // TODO: API 호출 후 상태 업데이트
// //     setTimeout(() => {
// //       console.log("❌ 거절", id);
// //       setProcessingId(null);
// //     }, 1000);
// //   };

// //   return (
// //     <motion.div
// //       initial={{ opacity: 0, y: 20 }}
// //       animate={{ opacity: 1, y: 0 }}
// //       transition={{ duration: 0.6 }}
// //       className="font-optimized"
// //     >
// //       {requests.length === 0 ? (
// //         <motion.div
// //           className="text-center py-20"
// //           initial={{ opacity: 0, scale: 0.8 }}
// //           animate={{ opacity: 1, scale: 1 }}
// //           transition={{ duration: 0.6 }}
// //         >
// //           <Mail className="mx-auto text-muted-foreground w-16 h-16 mb-4" />
// //           <h3 className="game-text text-foreground text-xl font-medium mb-2">
// //             받은 친구 요청이 없습니다
// //           </h3>
// //           <p className="text-muted-foreground text-sm">
// //             새로운 친구 요청이 오면 여기에 표시됩니다
// //           </p>
// //         </motion.div>
// //       ) : (
// //         <div className="flex flex-col gap-6">
// //           <AnimatePresence>
// //             {requests.map((req, index) => (
// //               <AcceptCard
// //                 key={req.id}
// //                 id={req.id}
// //                 nickname={req.nickname}
// //                 avatarUrl={req.avatarUrl}
// //                 level={req.level}
// //                 sentAt={req.sentAt}
// //                 processing={processingId === req.id}
// //                 onAccept={() => handleAccept(req.id)}
// //                 onReject={() => handleReject(req.id)}
// //               />
// //             ))}
// //           </AnimatePresence>
// //         </div>
// //       )}
// //     </motion.div>
// //   );
// // }




// import { useFriendStore } from "../../app/stores/friendStore";
// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Mail } from "lucide-react";
// import AcceptCard from "./AcceptCard";
// import axios from "axios";
// import { toast } from "sonner";

// export default function AcceptListTab() {
//   const {
//     friendRequests,
//     removeRequest,
//     addFriend,
//     setRequests,
//   } = useFriendStore();

//   const [processingId, setProcessingId] = useState<number | null>(null);

//   // 진입 시 받은 친구 요청 리스트 불러오기
//   // useEffect(() => {
//   //   const fetchFriendRequests = async () => {
//   //     try {
//   //       const token = localStorage.getItem("accessToken");

//   //       const res = await axios.get("http://localhost:8080/v1/friends/received", {
//   //         headers: {
//   //           Authorization: `Bearer ${token}`,
//   //         },
//   //       });
//   //       console.log("받은 친구 요청:", res.data.data);
//   //       // ✅ 응답 구조가 { data: [...] } 형식이면 아래처럼 변경
//   //       // console.log(res.data); 로 구조를 꼭 확인하세요
//   //       setRequests(res.data.data); // 실제 배열만 저장
//   //     } catch (err) {
//   //       console.error("친구 요청 불러오기 실패:", err);
//   //       toast.error("친구 요청 목록을 불러오지 못했어요.");
//   //     }
//   //   };

//   //   fetchFriendRequests();
//   // }, []);

//   useEffect(() => {
//     const fetchFriendRequests = async () => {
//       try {
//         const token = localStorage.getItem("accessToken");

//         const res = await axios.get("https://i13C207.p.ssafy.io/api/v1/users/friends/received", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         console.log("받은 친구 요청:", res.data.data);

//         // 상태 저장 전 가공
//         setRequests(
//           res.data.data.map((req: any) => ({
//             id: req.memberId,
//             nickname: req.nickname || "알 수 없음",
//             avatarUrl: req.avatarUrl || "/default-avatar.png",
//             level: req.level || 1,
//             sentAt: req.sentAt || new Date().toISOString(),
//           }))
//         );
//       } catch (err) {
//         console.error("친구 요청 불러오기 실패:", err);
//         toast.error("친구 요청 목록을 불러오지 못했어요.");
//       }
//     };

//     fetchFriendRequests();
//   }, []);

//   const handleAccept = async (id: number) => {
//     setProcessingId(id);
//     try {
//       const token=localStorage.getItem("accessToken")
//       console.log(token)
//       console.log(id)
//       const res = await axios.patch(
//         // `http://i13c207.p.ssafy.io:8080/v1/friends/${id}/accepted`,
//         `https://i13C207.p.ssafy.io/api/v1/friends/${id}/accepted`,
//         {},{
//           headers:{
//             Authorization: `Bearer ${token}`
//           }
//         }
//       );
      
//       const newFriend = res.data as {
//         friendUid: number;
//         memberId: number;
//         nickname: string;
//         avatarUrl: string;
//         level: number;
//         status: "online" | "offline" | "playing";
//         lastSeen?: string;
//         mutualFriends: number;
//       };

//       addFriend(newFriend);
//       removeRequest(id);
//       toast.success("친구 요청을 수락했어요!");
//     } catch (err) {
//       console.error("❌ 수락 실패:", err);
//       toast.error("친구 수락에 실패했어요.");
//     } finally {
//       setProcessingId(null);
//     }
//   };

//   const handleReject = async (id: number) => {
//     setProcessingId(id);
//     const token = localStorage.getItem("accessToken")
//     try {
//       await axios.post(
//         // `http://i13c207.p.ssafy.io:8080/v1/friends/${id}/accepted`,{
//         `https://i13C207.p.ssafy.io/api/v1/friends/${id}/accepted`,{
//           headers:{
//             Authorization: `Bearer ${token}`
//           }
//         }
//       );
//       removeRequest(id);
//       toast("친구 요청을 거절했어요.");
//     } catch (err) {
//       console.error("❌ 거절 실패:", err);
//       toast.error("요청 거절에 실패했어요.");
//     } finally {
//       setProcessingId(null);
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
//       {Array.isArray(friendRequests) && friendRequests.length === 0 ? (
//         <motion.div
//           className="text-center py-20"
//           initial={{ opacity: 0, scale: 0.8 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.6 }}
//         >
//           <Mail className="mx-auto text-muted-foreground w-16 h-16 mb-4" />
//           <h3 className="game-text text-foreground text-xl font-medium mb-2">
//             받은 친구 요청이 없습니다
//           </h3>
//           <p className="text-muted-foreground text-sm">
//             새로운 친구 요청이 오면 여기에 표시됩니다
//           </p>
//         </motion.div>
//       ) : (
//         <div className="flex flex-col gap-6">
//           <AnimatePresence>
//             {Array.isArray(friendRequests) &&
//               friendRequests.map((req) => (
//                 <AcceptCard
//                   key={req.id}
//                   id={req.id}
//                   nickname={req.nickname}
//                   avatarUrl={req.avatarUrl}
//                   level={req.level}
//                   sentAt={req.sentAt}
//                   processing={processingId === req.id}
//                   onAccept={() => handleAccept(req.id)}
//                   onReject={() => handleReject(req.id)}
//                 />
//               ))}
//           </AnimatePresence>
//         </div>
//       )}
//     </motion.div>
//   );
// }


import { useFriendStore } from "@/app/stores/friendStore";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail } from "lucide-react";
import AcceptCard from "@/components/friends/AcceptCard";
import apiClient from "@/shared/services/api";
import { toast } from "sonner";
import { getAuthHeaders } from "./auth";

export default function AcceptListTab() {
  const { friendRequests, removeRequest, addFriend, setRequests } = useFriendStore();
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const res = await apiClient.get(
          "/users/friends/received",
          { headers: getAuthHeaders() }
        );
        setRequests(
          (res.data?.data ?? []).map((req: any) => ({
            id: req.memberId,
            nickname: req.nickname || "알 수 없음",
            avatarUrl: req.avatarUrl || "/default-avatar.png",
            level: req.level || 1,
            sentAt: req.sentAt || new Date().toISOString(),
          }))
        );
      } catch (err) {
        console.error("친구 요청 불러오기 실패:", err);
        toast.error("친구 요청 목록을 불러오지 못했어요.");
      }
    };
    fetchFriendRequests();
  }, [setRequests]);

  const handleAccept = async (id: number) => {
    setProcessingId(id);
    try {
      const res = await apiClient.patch(
        `/users/friends/${id}/accepted`,
        {},
        { headers: getAuthHeaders() }
      );
      const newFriend = res.data as any; // store 타입에 맞게 이미 사용 중
      addFriend(newFriend);
      removeRequest(id);
      toast.success("친구 요청을 수락했어요!");
    } catch (err) {
      console.error("❌ 수락 실패:", err);
      toast.error("친구 수락에 실패했어요.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    setProcessingId(id);
    try {
      // NOTE: 실제 거절 엔드포인트가 다르면 교체하세요 (예: /rejected)
      await apiClient.patch(
        `/users/friends/${id}/rejected`,
        {},
        { headers: getAuthHeaders() }
      );
      removeRequest(id);
      toast("친구 요청을 거절했어요.");
    } catch (err) {
      console.error("❌ 거절 실패:", err);
      toast.error("요청 거절에 실패했어요.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      {Array.isArray(friendRequests) && friendRequests.length === 0 ? (
        <motion.div className="text-center py-20" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
          <Mail className="mx-auto text-muted-foreground w-16 h-16 mb-4" />
          <h3 className="game-text text-foreground text-xl font-medium mb-2">받은 친구 요청이 없습니다</h3>
          <p className="text-muted-foreground text-sm">새로운 친구 요청이 오면 여기에 표시됩니다</p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-6">
          <AnimatePresence>
            {Array.isArray(friendRequests) &&
              friendRequests.map((req: any) => (
                <AcceptCard
                  key={req.id}
                  id={req.id}
                  nickname={req.nickname}
                  avatarUrl={req.avatarUrl}
                  level={req.level}
                  sentAt={req.sentAt}
                  processing={processingId === req.id}
                  onAccept={handleAccept}
                  onReject={handleReject}
                />
              ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
