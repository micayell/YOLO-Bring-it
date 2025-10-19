// import { motion } from "framer-motion";

// interface BlockedCardProps {
//   id: number;
//   nickname: string;
//   avatarUrl: string;
//   blockedAt: string;
//   onUnblock: () => void;
// }

// export default function BlockedCard({
//   nickname,
//   avatarUrl,
//   blockedAt,
//   onUnblock,
// }: BlockedCardProps) {
//   return (
//     <motion.div
//       layout
//       initial={{ opacity: 0, x: -50 }}
//       animate={{ opacity: 1, x: 0 }}
//       exit={{ opacity: 0, x: 50 }}
//       transition={{ duration: 0.6 }}
//       className="bg-card/80 backdrop-blur-sm rounded-xl border border-border shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden font-optimized p-6"
//     >
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-6">
//           <img
//             src={avatarUrl}
//             alt={nickname}
//             className="rounded-full object-cover border-2 border-card w-20 h-20"
//           />
//           <div className="flex flex-col gap-1">
//             <h3 className="game-text text-foreground text-xl font-medium leading-snug">
//               {nickname}
//             </h3>
//             <div className="text-muted-foreground text-sm">
//               {new Date(blockedAt).toLocaleDateString("ko-KR")} 차단됨
//             </div>
//           </div>
//         </div>
//         <motion.button
//           className="relative flex items-center bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-all duration-300 touch-target font-optimized game-text px-4 py-2 text-sm font-medium"
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           onClick={onUnblock}
//         >
//           차단 해제
//         </motion.button>
//       </div>
//     </motion.div>
//   );
// }

import { motion } from "framer-motion";
import { subtleCard, btnMuted } from "./friendsTheme";

interface BlockedCardProps {
  id: number;
  nickname: string;
  avatarUrl: string;
  blockedAt: string;
  onUnblock: () => void;
}

export default function BlockedCard({ nickname, avatarUrl, blockedAt, onUnblock }: BlockedCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.6 }}
      className={`${subtleCard} p-6`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <img src={avatarUrl} alt={nickname} className="rounded-full object-cover border-2 border-card w-20 h-20" />
          <div className="flex flex-col gap-1">
            <h3 className="game-text text-foreground text-xl font-medium leading-snug">{nickname}</h3>
            <div className="text-muted-foreground text-sm">{new Date(blockedAt).toLocaleDateString("ko-KR")} 차단됨</div>
          </div>
        </div>
        <motion.button className={`${btnMuted} px-4 py-2 text-sm font-medium`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onUnblock}>
          차단 해제
        </motion.button>
      </div>
    </motion.div>
  );
}