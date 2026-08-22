// import { motion } from "framer-motion";
// import { Check, X } from "lucide-react";

// interface AcceptCardProps {
//   id: number;
//   nickname: string;
//   avatarUrl: string;
//   level: number;
//   sentAt: string;
//   processing: boolean;
//   onAccept: (id:number) => void;
//   onReject: (id:number) => void;
// }

// export default function AcceptCard({
//   id,
//   nickname,
//   avatarUrl,
//   level,
//   sentAt,
//   processing,
//   onAccept,
//   onReject,
// }: AcceptCardProps) {
//   return (
//     <motion.div
//       layout
//       initial={{ opacity: 0, x: -50 }}
//       animate={{ opacity: 1, x: 0 }}
//       exit={{ opacity: 0, x: 50 }}
//       transition={{ duration: 0.5 }}
//       className="bg-card/80 backdrop-blur-sm rounded-xl border border-border shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden font-optimized relative p-6"
//     >
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-6">
//           {/* 아바타 + 새 요청 표시 */}
//           <div className="relative">
//             <img
//               src={avatarUrl}
//               alt={nickname}
//               className="rounded-full object-cover border-2 border-card w-16 h-16"
//             />
//             <motion.div
//               className="absolute -top-1 -right-1 bg-[#ff6b6b] rounded-full border-2 border-card"
//               style={{ width: "var(--spacing-lg)", height: "var(--spacing-lg)" }}
//               animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
//               transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
//             />
//           </div>

//           {/* 유저 정보 */}
//           <div className="flex flex-col gap-1">
//             <h3 className="game-text text-foreground text-xl font-medium leading-snug">{nickname}</h3>
//             <div className="text-muted-foreground text-sm">레벨 {level}</div>
//             <div className="text-xs text-muted-foreground">
//               {new Date(sentAt).toLocaleDateString("ko-KR")} 요청
//             </div>
//           </div>
//         </div>

//         {/* 수락 / 거절 버튼 */}
//         <div className="flex items-center gap-2">
//           {processing ? (
//             <div className="flex items-center gap-2 px-4">
//               <motion.div
//                 className="border-2 border-[#6dc4e8] border-t-transparent rounded-full"
//                 style={{ width: "var(--icon-md)", height: "var(--icon-md)" }}
//                 animate={{ rotate: 360 }}
//                 transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//               />
//               <span className="text-muted-foreground game-text text-sm">처리중...</span>
//             </div>
//           ) : (
//             <>
//               <motion.button
//                 className="relative flex items-center bg-[#6bcf7f] text-white rounded-lg hover:bg-[#5bb86f] transition-all duration-300 overflow-hidden touch-target game-text px-4 py-2 text-sm font-medium"
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => onAccept(id)}
//               >
//                 <Check className="w-4 h-4 mr-1" /> 수락
//                 <motion.div
//                   className="absolute top-0 left-0 w-[120%] h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
//                   animate={{ x: ["-120%", "120%"] }}
//                   transition={{ duration: 2, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
//                 />
//               </motion.button>

//               <motion.button
//                 className="flex items-center bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-all duration-300 touch-target game-text px-4 py-2 text-sm font-medium"
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => onReject(id)}
//               >
//                 <X className="w-4 h-4 mr-1" /> 거절
//               </motion.button>
//             </>
//           )}
//         </div>
//       </div>

//       {/* 반짝이 효과 */}
//       <motion.div
//         className="absolute top-0 left-0 w-[120%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 pointer-events-none"
//         animate={{ x: ["-120%", "120%"] }}
//         transition={{ duration: 4, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
//       />
//     </motion.div>
//   );
// }


import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { subtleCard, btnSuccess, btnMuted } from "./friendsTheme";

interface AcceptCardProps {
  id: number;
  nickname: string;
  avatarUrl: string;
  level: number;
  sentAt: string;
  processing: boolean;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
}

export default function AcceptCard({ id, nickname, avatarUrl, level, sentAt, processing, onAccept, onReject }: AcceptCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.5 }}
      className={`${subtleCard} relative p-6`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="relative">
            <img src={avatarUrl} alt={nickname} className="rounded-full object-cover border-2 border-card w-16 h-16" />
            <motion.div
              className="absolute -top-1 -right-1 bg-[#ff6b6b] rounded-full border-2 border-card"
              style={{ width: "var(--spacing-lg)", height: "var(--spacing-lg)" }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="game-text text-foreground text-xl font-medium leading-snug">{nickname}</h3>
            <div className="text-muted-foreground text-sm">레벨 {level}</div>
            <div className="text-xs text-muted-foreground">{new Date(sentAt).toLocaleDateString("ko-KR")} 요청</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {processing ? (
            <div className="flex items-center gap-2 px-4">
              <motion.div className="border-2 border-[#6dc4e8] border-t-transparent rounded-full" style={{ width: "var(--icon-md)", height: "var(--icon-md)" }} animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
              <span className="text-muted-foreground game-text text-sm">처리중...</span>
            </div>
          ) : (
            <>
              <motion.button className={`${btnSuccess} px-4 py-2 text-sm font-medium relative overflow-hidden`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onAccept(id)}>
                <Check className="w-4 h-4 mr-1" /> 수락
                <motion.div className="absolute top-0 left-0 w-[120%] h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12" animate={{ x: ["-120%", "120%"] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }} />
              </motion.button>
              <motion.button className={`${btnMuted} px-4 py-2 text-sm font-medium`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onReject(id)}>
                <X className="w-4 h-4 mr-1" /> 거절
              </motion.button>
            </>
          )}
        </div>
      </div>

      <motion.div className="absolute top-0 left-0 w-[120%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 pointer-events-none" animate={{ x: ["-120%", "120%"] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }} />
    </motion.div>
  );
}
