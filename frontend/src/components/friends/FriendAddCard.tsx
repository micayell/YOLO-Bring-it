// import { motion } from "framer-motion";
// import { UserPlus } from "lucide-react";

// interface AddFriendCardProps {
//   memberId: number;
//   nickname: string;
//   avatarUrl: string;
//   level: number;
//   mutualFriends: number;
//   onSendRequest: (memberId: number) => void;
//   disabled?: boolean;
//   requested?: boolean;
// }

// export default function AddFriendCard({
//   memberId,
//   nickname,
//   avatarUrl,
//   level,
//   mutualFriends,
//   onSendRequest,
//   requested = false,
//   disabled = false,
// }: AddFriendCardProps) {
//   return (
//     <motion.div
//       layout
//       initial={{ opacity: 0, x: -50 }}
//       animate={{ opacity: 1, x: 0 }}
//       exit={{ opacity: 0, x: 50 }}
//       transition={{ duration: 0.5 }}
//       className="bg-white/80 backdrop-blur-sm rounded-xl border border-border shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden font-optimized p-6"
//       whileHover={{ y: -3 }}
//     >
//       <div className="flex items-center justify-between font-optimized">
//         <div className="flex items-center gap-6">
//           <img
//             src={avatarUrl}
//             alt={nickname}
//             className="w-16 h-16 rounded-full object-cover border-2 border-card"
//           />
//           <div className="flex flex-col gap-1">
//             <h3 className="game-text text-foreground text-xl font-medium leading-snug">
//               {nickname}
//             </h3>
//             <div className="text-muted-foreground text-sm">
//               레벨 {level} • 공통 친구 {mutualFriends}명
//             </div>
//           </div>
//         </div>

//         {requested ? (
//           <motion.div
//             className="bg-muted text-muted-foreground px-4 py-2 text-sm rounded-lg game-text"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//           >
//             요청됨
//           </motion.div>
//         ) : (
//           <motion.button
//             className="relative flex items-center bg-[#6dc4e8] text-white rounded-lg hover:bg-[#5ab4d8] transition-all duration-300 overflow-hidden touch-target font-optimized game-text px-4 py-2 text-sm font-medium"
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={() => onSendRequest(memberId)}
//             disabled={disabled}
//           >
//             <UserPlus className="w-4 h-4 mr-2" /> 친구 추가
//           </motion.button>
//         )}
//       </div>
//     </motion.div>
//   );
// }


import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { softCard, btnPrimary } from "./friendsTheme";

interface AddFriendCardProps {
  memberId: number;
  nickname: string;
  avatarUrl: string;
  level: number;
  mutualFriends: number;
  onSendRequest: (memberId: number) => void;
  disabled?: boolean;
  requested?: boolean;
}

export default function AddFriendCard({ memberId, nickname, avatarUrl, level, mutualFriends, onSendRequest, requested = false, disabled = false, }: AddFriendCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.5 }}
      className={`${softCard} p-6`}
      whileHover={{ y: -3 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <img src={avatarUrl} alt={nickname} className="w-16 h-16 rounded-full object-cover border-2 border-card" />
          <div className="flex flex-col gap-1">
            <h3 className="game-text text-foreground text-xl font-medium leading-snug">{nickname}</h3>
            <div className="text-muted-foreground text-sm">레벨 {level} • 공통 친구 {mutualFriends}명</div>
          </div>
        </div>

        {requested ? (
          <motion.div className="bg-muted text-muted-foreground px-4 py-2 text-sm rounded-lg game-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            요청됨
          </motion.div>
        ) : (
          <motion.button className={`${btnPrimary} px-4 py-2 text-sm font-medium`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onSendRequest(memberId)} disabled={disabled}>
            <UserPlus className="w-4 h-4 mr-2" /> 친구 추가
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
