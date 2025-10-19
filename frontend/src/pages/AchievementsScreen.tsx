// import { useState, useCallback, useRef, useMemo } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Trophy,
//   ArrowLeft,
//   RefreshCw,
//   Search,
//   X,
//   CheckCircle,
// } from "lucide-react";
// import type { Achievement, SortOption } from "@/shared/types/achievements";
// import {
//   ACHIEVEMENT_CATEGORIES,
//   INITIAL_ACHIEVEMENTS,
// } from "@/shared/constants/achievements";
// import {
//   calculateStats,
//   filterAndSortAchievements,
// } from "@/shared/utils/achievements";
// import { AchievementCard } from "@/entities/achievement/ui/AchievementCard";
// import { AchievementModal } from "@/entities/achievement/ui/AchievementModal";

// interface AchievementsScreenProps {
//   onBack: () => void;
// }

// export function AchievementsScreen({ onBack }: AchievementsScreenProps) {
//   const [selectedCategory, setSelectedCategory] = useState<string>("all");
//   const [selectedAchievement, setSelectedAchievement] =
//     useState<Achievement | null>(null);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [sortBy, setSortBy] = useState<SortOption>("progress");
//   const [showCompleted, setShowCompleted] = useState(true);
//   const [achievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);

//   const scrollRef = useRef<HTMLDivElement>(null);
//   const categoryRef = useRef<HTMLDivElement>(null);
//   const pullThreshold = 80;
//   const [pullDistance, setPullDistance] = useState(0);
//   const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
//   const [isPulling, setIsPulling] = useState(false);
//   const [isSwipingCategory, setIsSwipingCategory] = useState(false);

//   // 필터링 및 정렬된 업적
//   const filteredAchievements = useMemo(
//     () =>
//       filterAndSortAchievements(
//         achievements,
//         selectedCategory,
//         searchQuery,
//         sortBy,
//         showCompleted
//       ),
//     [achievements, selectedCategory, searchQuery, sortBy, showCompleted]
//   );

//   // 통계 계산
//   const stats = useMemo(() => calculateStats(achievements), [achievements]);

//   // 풀투리프레시 처리
//   const handleRefresh = useCallback(async () => {
//     setIsRefreshing(true);
//     await new Promise((resolve) => setTimeout(resolve, 1500));
//     setIsRefreshing(false);
//   }, []);

//   // 터치 이벤트 핸들러들
//   const handleTouchStart = useCallback((e: React.TouchEvent) => {
//     const touch = e.touches[0];
//     setTouchStart({ x: touch.clientX, y: touch.clientY });

//     const scrollContainer = scrollRef.current;
//     if (scrollContainer && scrollContainer.scrollTop === 0) {
//       setIsPulling(true);
//     }
//   }, []);

//   const handleTouchMove = useCallback(
//     (e: React.TouchEvent) => {
//       const touch = e.touches[0];
//       const deltaX = touch.clientX - touchStart.x;
//       const deltaY = touch.clientY - touchStart.y;

//       // 세로 스와이프 (풀투리프레시)
//       if (isPulling && Math.abs(deltaY) > Math.abs(deltaX)) {
//         if (deltaY > 0 && deltaY <= pullThreshold * 2) {
//           setPullDistance(deltaY);
//           e.preventDefault();
//         }
//       }

//       // 가로 스와이프 (카테고리 전환)
//       if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
//         if (!isSwipingCategory) {
//           setIsSwipingCategory(true);
//           handleCategorySwipe(deltaX > 0 ? "right" : "left");
//         }
//       }
//     },
//     [isPulling, touchStart, pullThreshold, isSwipingCategory]
//   );

//   const handleTouchEnd = useCallback(() => {
//     if (isPulling && pullDistance >= pullThreshold) {
//       handleRefresh();
//     }

//     setIsPulling(false);
//     setIsSwipingCategory(false);
//     setTouchStart({ x: 0, y: 0 });
//     setPullDistance(0);
//   }, [isPulling, pullDistance, pullThreshold, handleRefresh]);

//   const handleCategorySwipe = useCallback(
//     (direction: "left" | "right") => {
//       const currentIndex = ACHIEVEMENT_CATEGORIES.findIndex(
//         (cat) => cat.id === selectedCategory
//       );
//       let newIndex;

//       if (direction === "left") {
//         newIndex =
//           currentIndex < ACHIEVEMENT_CATEGORIES.length - 1
//             ? currentIndex + 1
//             : 0;
//       } else {
//         newIndex =
//           currentIndex > 0
//             ? currentIndex - 1
//             : ACHIEVEMENT_CATEGORIES.length - 1;
//       }

//       setSelectedCategory(ACHIEVEMENT_CATEGORIES[newIndex].id);
//     },
//     [selectedCategory]
//   );

//   return (
//     <motion.div
//       className="min-h-screen bg-background text-foreground overflow-hidden font-optimized"
//       style={{
//         maxWidth: "100vw",
//         fontSize: "var(--text-base)",
//         fontWeight: "var(--font-weight-normal)",
//         lineHeight: "1.5",
//       }}
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       transition={{ duration: 0.6 }}
//     >
//       {/* 배경 그라데이션 효과 */}
//       <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/30 via-transparent to-orange-50/20 dark:from-yellow-950/20 dark:via-transparent dark:to-orange-950/10" />

//       {/* 배경 장식 효과 */}
//       <motion.div
//         className="absolute w-40 h-40 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 rounded-full blur-3xl"
//         style={{
//           top: "var(--spacing-5xl)",
//           right: "var(--spacing-5xl)",
//         }}
//         animate={{
//           scale: [1, 1.2, 1],
//           opacity: [0.3, 0.6, 0.3],
//         }}
//         transition={{
//           duration: 6,
//           repeat: Infinity,
//           ease: "easeInOut",
//         }}
//       />

//       <div className="relative z-10 h-full flex flex-col font-optimized">
//         {/* 개선된 헤더 */}
//         <motion.div
//           className="bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm font-optimized"
//           style={{
//             padding: "var(--spacing-lg) var(--spacing-xl)",
//             minHeight: "var(--header-xs)",
//           }}
//           initial={{ y: -30, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ delay: 0.2, duration: 0.6 }}
//         >
//           <div className="flex items-center justify-between font-optimized">
//             {/* 왼쪽: 뒤로가기 + 타이틀 */}
//             <div
//               className="flex items-center font-optimized"
//               style={{
//                 gap: "var(--spacing-lg)",
//               }}
//             >
//               <motion.button
//                 className="relative flex items-center bg-card/60 hover:bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden transition-all duration-300 touch-target font-optimized game-text shadow-sm"
//                 style={{
//                   padding: "var(--spacing-md) var(--spacing-lg)",
//                   gap: "var(--spacing-sm)",
//                   fontSize: "clamp(0.875rem, 3vw, 1rem)",
//                   fontWeight: "var(--font-weight-medium)",
//                   lineHeight: "1.5",
//                   minHeight: "var(--touch-target-min)",
//                 }}
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 onClick={onBack}
//               >
//                 <ArrowLeft
//                   style={{
//                     width: "var(--icon-md)",
//                     height: "var(--icon-md)",
//                   }}
//                 />
//                 <span className="relative z-10 hidden sm:inline">뒤로가기</span>
//               </motion.button>

//               <div
//                 className="flex items-center font-optimized"
//                 style={{
//                   gap: "var(--spacing-md)",
//                 }}
//               >
//                 <div
//                   className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg"
//                   style={{
//                     boxShadow: "0 4px 20px rgba(245, 158, 11, 0.3)",
//                   }}
//                 >
//                   <Trophy
//                     className="text-white"
//                     style={{
//                       width: "var(--icon-md)",
//                       height: "var(--icon-md)",
//                     }}
//                   />
//                 </div>
//                 <h1
//                   className="game-text text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-yellow-400 dark:to-orange-400 font-optimized"
//                   style={{
//                     fontSize: "clamp(1.25rem, 4vw, 2rem)",
//                     fontWeight: "var(--font-weight-medium)",
//                     lineHeight: "1.2",
//                     letterSpacing: "0.05em",
//                   }}
//                 >
//                   업적
//                 </h1>
//               </div>
//             </div>

//             {/* 오른쪽: 진행률 및 통계 */}
//             <motion.div
//               className="bg-card/50 backdrop-blur-sm rounded-2xl shadow-lg border border-border/50 font-optimized relative overflow-hidden"
//               style={{
//                 padding: "var(--spacing-md) var(--spacing-xl)",
//               }}
//               animate={{
//                 boxShadow: [
//                   "0 4px 20px rgba(245,158,11,0.2)",
//                   "0 6px 30px rgba(245,158,11,0.3)",
//                   "0 4px 20px rgba(245,158,11,0.2)",
//                 ],
//               }}
//               transition={{
//                 duration: 4,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//               }}
//             >
//               {/* 배경 반짝임 효과 */}
//               <motion.div
//                 className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/10 to-transparent"
//                 animate={{ x: ["-100%", "100%"] }}
//                 transition={{
//                   duration: 3,
//                   repeat: Infinity,
//                   repeatDelay: 2,
//                   ease: "easeInOut",
//                 }}
//               />

//               <div
//                 className="flex items-center relative z-10 font-optimized"
//                 style={{
//                   gap: "var(--spacing-sm)",
//                 }}
//               >
//                 <div className="text-center">
//                   <div
//                     className="text-yellow-600 dark:text-yellow-400 number-optimized font-optimized"
//                     style={{
//                       fontSize: "clamp(1.125rem, 4vw, 1.5rem)",
//                       fontWeight: "var(--font-weight-medium)",
//                       lineHeight: "1.2",
//                     }}
//                   >
//                     {stats.completed}
//                   </div>
//                   <div
//                     className="text-muted-foreground font-optimized"
//                     style={{
//                       fontSize: "clamp(0.75rem, 2.5vw, 0.875rem)",
//                       fontWeight: "var(--font-weight-normal)",
//                       lineHeight: "1.4",
//                     }}
//                   >
//                     달성
//                   </div>
//                 </div>

//                 <div
//                   className="w-px bg-border/50"
//                   style={{
//                     height: "var(--spacing-4xl)",
//                   }}
//                 />

//                 <div className="text-center">
//                   <div
//                     className="text-foreground number-optimized font-optimized"
//                     style={{
//                       fontSize: "clamp(1.125rem, 4vw, 1.5rem)",
//                       fontWeight: "var(--font-weight-medium)",
//                       lineHeight: "1.2",
//                     }}
//                   >
//                     {stats.overallProgress}%
//                   </div>
//                   <div
//                     className="text-muted-foreground font-optimized"
//                     style={{
//                       fontSize: "clamp(0.75rem, 2.5vw, 0.875rem)",
//                       fontWeight: "var(--font-weight-normal)",
//                       lineHeight: "1.4",
//                     }}
//                   >
//                     전체 진행률
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         </motion.div>

//         {/* 검색 및 필터 섹션 */}
//         <motion.div
//           className="bg-background/80 backdrop-blur-sm border-b border-border/30 font-optimized"
//           style={{
//             padding: "var(--spacing-lg) var(--spacing-xl)",
//           }}
//           initial={{ y: 20, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ delay: 0.3, duration: 0.6 }}
//         >
//           <div
//             className="flex items-center font-optimized"
//             style={{
//               gap: "var(--spacing-md)",
//             }}
//           >
//             {/* 검색창 */}
//             <div className="flex-1 relative">
//               <Search
//                 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
//                 style={{
//                   width: "var(--icon-sm)",
//                   height: "var(--icon-sm)",
//                 }}
//               />
//               <input
//                 type="text"
//                 placeholder="업적 검색..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="w-full bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl text-foreground placeholder-muted-foreground transition-all duration-300 focus:bg-card focus:border-[#6dc4e8] focus:ring-2 focus:ring-[#6dc4e8]/20 font-optimized"
//                 style={{
//                   padding:
//                     "var(--spacing-md) var(--spacing-md) var(--spacing-md) var(--spacing-5xl)",
//                   fontSize: "clamp(0.875rem, 3vw, 1rem)",
//                   fontWeight: "var(--font-weight-normal)",
//                   lineHeight: "1.5",
//                   minHeight: "var(--touch-target-min)",
//                 }}
//               />
//               {searchQuery && (
//                 <motion.button
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
//                   whileHover={{ scale: 1.1 }}
//                   whileTap={{ scale: 0.9 }}
//                   onClick={() => setSearchQuery("")}
//                 >
//                   <X
//                     style={{
//                       width: "var(--icon-sm)",
//                       height: "var(--icon-sm)",
//                     }}
//                   />
//                 </motion.button>
//               )}
//             </div>

//             {/* 정렬 및 필터 */}
//             <div
//               className="flex items-center font-optimized"
//               style={{
//                 gap: "var(--spacing-sm)",
//               }}
//             >
//               <select
//                 value={sortBy}
//                 onChange={(e) => setSortBy(e.target.value as SortOption)}
//                 className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl text-foreground transition-all duration-300 focus:bg-card focus:border-[#6dc4e8] font-optimized"
//                 style={{
//                   padding: "var(--spacing-md)",
//                   fontSize: "clamp(0.875rem, 3vw, 1rem)",
//                   fontWeight: "var(--font-weight-normal)",
//                   lineHeight: "1.5",
//                   minHeight: "var(--touch-target-min)",
//                 }}
//               >
//                 <option value="progress">진행률순</option>
//                 <option value="difficulty">난이도순</option>
//                 <option value="completion">완료상태순</option>
//               </select>

//               <motion.button
//                 className={`relative flex items-center backdrop-blur-sm border rounded-xl overflow-hidden transition-all duration-300 touch-target font-optimized ${
//                   !showCompleted
//                     ? "bg-[#6dc4e8] hover:bg-[#5ab4d8] text-white border-[#6dc4e8]"
//                     : "bg-card/60 hover:bg-[#6dc4e8]/60 text-foreground border-border/50"
//                 }`}
//                 style={{
//                   padding: "var(--spacing-md)",
//                   minHeight: "var(--touch-target-min)",
//                 }}
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 onClick={() => setShowCompleted(!showCompleted)}
//               >
//                 <CheckCircle
//                   style={{
//                     width: "var(--icon-sm)",
//                     height: "var(--icon-sm)",
//                   }}
//                 />
//               </motion.button>
//             </div>
//           </div>
//         </motion.div>

//         {/* 카테고리 탭 */}
//         <motion.div
//           className="bg-background/90 backdrop-blur-sm border-b border-border/30 font-optimized relative"
//           style={{
//             padding: "var(--spacing-lg) 0",
//           }}
//           initial={{ y: 20, opacity: 0 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.4, duration: 0.6 }}
//         >
//           <div className="relative">
//             {/* 카테고리 탭들 */}
//             <div
//               ref={categoryRef}
//               className="flex justify-center overflow-x-auto scrollbar-hide px-4 font-optimized scroll-smooth"
//               style={{
//                 gap: "var(--spacing-md)",
//                 scrollbarWidth: "none",
//                 msOverflowStyle: "none",
//               }}
//             >
//               {ACHIEVEMENT_CATEGORIES.map((category, index) => {
//                 const Icon = category.icon;
//                 const isActive = selectedCategory === category.id;

//                 return (
//                   <motion.button
//                     key={category.id}
//                     className={`relative flex-shrink-0 flex items-center rounded-2xl overflow-hidden transition-all duration-300 touch-target font-optimized game-text ${
//                       isActive
//                         ? "text-white shadow-lg transform scale-105"
//                         : "text-foreground bg-card/60 hover:bg-card/80 border border-border/50 hover:border-border"
//                     }`}
//                     style={{
//                       gap: "var(--spacing-sm)",
//                       padding: "var(--spacing-md) var(--spacing-xl)",
//                       fontSize: "clamp(0.875rem, 3vw, 1rem)",
//                       fontWeight: "var(--font-weight-medium)",
//                       lineHeight: "1.5",
//                       minHeight: "var(--touch-target-min)",
//                       backgroundColor: isActive ? category.color : undefined,
//                       boxShadow: isActive
//                         ? `0 8px 25px ${category.color}40`
//                         : undefined,
//                     }}
//                     whileHover={{ scale: isActive ? 1.05 : 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                     onClick={() => setSelectedCategory(category.id)}
//                     initial={{ x: -50, opacity: 0 }}
//                     animate={{ x: 0, opacity: 1 }}
//                     transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
//                   >
//                     <Icon
//                       style={{
//                         width: "var(--icon-sm)",
//                         height: "var(--icon-sm)",
//                       }}
//                     />
//                     <span className="relative z-10 whitespace-nowrap">
//                       {category.name}
//                     </span>

//                     {isActive && (
//                       <motion.div
//                         className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
//                         animate={{ x: ["-100%", "100%"] }}
//                         transition={{
//                           duration: 2,
//                           repeat: Infinity,
//                           repeatDelay: 3,
//                           ease: "easeInOut",
//                         }}
//                       />
//                     )}
//                   </motion.button>
//                 );
//               })}
//             </div>
//           </div>
//         </motion.div>

//         {/* 스크롤 가능한 업적 목록 */}
//         <div
//           ref={scrollRef}
//           className="flex-1 overflow-y-auto font-optimized relative"
//           style={{
//             padding: "var(--spacing-lg)",
//             transform: isPulling
//               ? `translateY(${Math.min(pullDistance, pullThreshold)}px)`
//               : "none",
//             transition: isPulling ? "none" : "transform 0.3s ease-out",
//             scrollbarWidth: "thin",
//             scrollbarColor: "#f59e0b transparent",
//           }}
//           onTouchStart={handleTouchStart}
//           onTouchMove={handleTouchMove}
//           onTouchEnd={handleTouchEnd}
//         >
//           {/* 풀투리프레시 인디케이터 */}
//           <AnimatePresence>
//             {(isPulling || isRefreshing) && (
//               <motion.div
//                 className="flex items-center justify-center text-yellow-600 dark:text-yellow-400 font-optimized"
//                 style={{
//                   padding: "var(--spacing-lg)",
//                   marginTop: `-${pullThreshold}px`,
//                   height: `${pullThreshold}px`,
//                 }}
//                 initial={{ opacity: 0, scale: 0.8 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 exit={{ opacity: 0, scale: 0.8 }}
//               >
//                 <motion.div
//                   animate={isRefreshing ? { rotate: 360 } : {}}
//                   transition={
//                     isRefreshing
//                       ? { duration: 1, repeat: Infinity, ease: "linear" }
//                       : {}
//                   }
//                 >
//                   <RefreshCw
//                     style={{
//                       width: "var(--icon-lg)",
//                       height: "var(--icon-lg)",
//                     }}
//                   />
//                 </motion.div>
//                 <span
//                   className="ml-2 font-optimized"
//                   style={{
//                     fontSize: "clamp(0.875rem, 3vw, 1rem)",
//                     fontWeight: "var(--font-weight-medium)",
//                     lineHeight: "1.5",
//                   }}
//                 >
//                   {isRefreshing ? "새로고침 중..." : "새로고침하려면 놓으세요"}
//                 </span>
//               </motion.div>
//             )}
//           </AnimatePresence>

//           {/* 업적 목록 */}
//           <motion.div
//             className="font-optimized"
//             style={{
//               display: "flex",
//               flexDirection: "column",
//               gap: "var(--spacing-lg)",
//             }}
//             key={selectedCategory}
//             initial={{
//               opacity: 0,
//               x: isSwipingCategory
//                 ? selectedCategory === ACHIEVEMENT_CATEGORIES[0].id
//                   ? -20
//                   : 20
//                 : 0,
//             }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.3 }}
//           >
//             <AnimatePresence>
//               {filteredAchievements.map((achievement, index) => (
//                 <AchievementCard
//                   key={achievement.id}
//                   achievement={achievement}
//                   index={index}
//                   onClick={setSelectedAchievement}
//                 />
//               ))}
//             </AnimatePresence>
//           </motion.div>

//           {/* 검색 결과 없음 */}
//           {filteredAchievements.length === 0 && (
//             <motion.div
//               className="text-center text-muted-foreground font-optimized"
//               style={{
//                 padding: "var(--spacing-5xl)",
//                 fontSize: "clamp(1rem, 4vw, 1.25rem)",
//                 fontWeight: "var(--font-weight-normal)",
//                 lineHeight: "1.5",
//               }}
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//             >
//               <Trophy
//                 className="mx-auto mb-4 text-muted-foreground/50"
//                 style={{
//                   width: "var(--spacing-5xl)",
//                   height: "var(--spacing-5xl)",
//                 }}
//               />
//               <p>검색 조건에 맞는 업적이 없습니다</p>
//               <p
//                 className="text-sm"
//                 style={{
//                   marginTop: "var(--spacing-sm)",
//                 }}
//               >
//                 다른 검색어나 카테고리를 시도해보세요
//               </p>
//             </motion.div>
//           )}
//         </div>

//         {/* 업적 상세 모달 */}
//         <AnimatePresence>
//           {selectedAchievement && (
//             <AchievementModal
//               achievement={selectedAchievement}
//               onClose={() => setSelectedAchievement(null)}
//             />
//           )}
//         </AnimatePresence>
//       </div>

//       {/* 커스텀 스크롤바 스타일 */}
//       <style>{`
//         .scrollbar-hide {
//           -ms-overflow-style: none;
//           scrollbar-width: none;
//         }
//         .scrollbar-hide::-webkit-scrollbar {
//           display: none;
//         }
//       `}</style>
//     </motion.div>
//   );
// }





// src/pages/AchievementsScreen.tsx
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, ArrowLeft } from "lucide-react";
import { authService } from "@/shared/services/authService";
import apiClient from "@/shared/services/api";

import type { AchievementCore } from "@/app/stores/achievementStore";
import { useAchievementStore } from "@/app/stores/achievementStore";
import type { SortOption } from "@/shared/types/achievements";
import { AchievementList } from "@/components/achievements/AchievementList";
import { useUserLoginStore } from "@/app/stores/userStore";

/** ===== API 타입 ===== */
type ApiItemCategory = { categoryCode: string; name: string };
type ApiItem = { itemUid: number; name: string; cost: number | null; itemCategory: ApiItemCategory };
type ApiAchievement = { achievementUid: number; name: string; exp: string; item: ApiItem };
type ApiAchievementWrap = { achievement: ApiAchievement; hasAchievement: boolean };
type ApiResponse = {
  state: number;
  result: string;
  message: string | null;
  data: { achievements: ApiAchievementWrap[]; achievementRate: number };
  error: any[];
};

/** API → AchievementCore 어댑터 */
function adapt(resp: ApiResponse): { list: AchievementCore[]; rate: number } {
  const wraps = resp?.data?.achievements ?? [];
  const list: AchievementCore[] = wraps.map(({ achievement, hasAchievement }) => ({
    achievementUid: achievement.achievementUid,
    name: achievement.name,
    exp: achievement.exp,
    item: {
      itemUid: achievement.item.itemUid,
      name: achievement.item.name,
      cost: achievement.item.cost,
      itemCategory: {
        categoryCode: achievement.item.itemCategory.categoryCode,
        name: achievement.item.itemCategory.name,
      },
    },
    hasAchievement,
  }));
  const rate = Number(resp?.data?.achievementRate ?? 0);
  return { list, rate };
}

/** ===== 로컬: AchievementCore 전용 필터/정렬/통계 ===== */
function filterAndSortCore(
  list: AchievementCore[],
  search: string,
  sortBy: SortOption,
  showCompleted: boolean
): AchievementCore[] {
  const q = search.trim().toLowerCase();
  let out = list.filter((a) => (showCompleted ? true : !a.hasAchievement));

  if (q) {
    out = out.filter((a) => {
      const name = a.name?.toLowerCase() ?? "";
      const exp = a.exp?.toLowerCase() ?? "";
      const reward = a.item?.name?.toLowerCase() ?? "";
      const cat = a.item?.itemCategory?.name?.toLowerCase() ?? "";
      return name.includes(q) || exp.includes(q) || reward.includes(q) || cat.includes(q);
    });
  }

  switch (sortBy) {
    case "completion": // 완료 항목 먼저
      out.sort((a, b) => Number(b.hasAchievement) - Number(a.hasAchievement));
      break;
    case "difficulty":
      out.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
      break;
    case "progress":
    default:
      out.sort((a, b) => Number(a.hasAchievement) - Number(b.hasAchievement));
      break;
  }
  return out;
}

function calculateStatsCore(list: AchievementCore[]) {
  const total = list.length;
  const completed = list.filter((a) => a.hasAchievement).length;
  return { total, completed };
}

interface AchievementsScreenProps {
  onBack: () => void;
}

export function AchievementsScreen({ onBack }: AchievementsScreenProps) {
  // ✅ 스토어 분리 구독 (shallow 없이)
  const achievements = useAchievementStore((s) => s.achievements);
  const achievementRate = useAchievementStore((s) => s.achievementRate);
  const loading = useAchievementStore((s) => s.loading);
  const error = useAchievementStore((s) => s.error);
  const setAchievements = useAchievementStore((s) => s.setAchievements);
  const setLoading = useAchievementStore((s) => s.setLoading);
  const setError = useAchievementStore((s) => s.setError);

  // ✅ 현재 장착 배지명은 zustand 구독으로 직접 읽어와야 즉시 리렌더
  const currentBadge = useUserLoginStore((s) => s.userData?.badgename);
  const setBadgeName = useUserLoginStore((s) => s.setBadgeName);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("progress");
  const [showCompleted, setShowCompleted] = useState(true);

  // StrictMode 중복 fetch 방지
  const hasFetchedRef = useRef(false);

  const fetchAchievements = useCallback(async () => {
    try {
      setLoading(true);
      const resData = await authService.getAchievements();
      const { list, rate } = adapt(resData);
      setAchievements(list, rate);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? "업적 불러오기 실패");
    } finally {
      setLoading(false);
    }
  }, [setAchievements, setError, setLoading]);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchAchievements();
  }, [fetchAchievements]);

  // ⬇️ AchievementCore 기준으로 필터/정렬
  const filteredAchievements: AchievementCore[] = useMemo(
    () => filterAndSortCore(achievements, "", "progress", true),
    [achievements]
  );

  const stats = useMemo(() => {
    const base = calculateStatsCore(achievements);
    return { ...base, overallProgress: achievementRate };
  }, [achievements, achievementRate]);

  /** ✅ 업적 장착 핸들러: PATCH 후 zustand(userData) 갱신 */
  const handleEquip = async (a: AchievementCore) => {
    try {
      // 1) 서버에 장착 반영
      await apiClient.patch(`/users/item-members/${encodeURIComponent(a.item.itemUid)}/equipment`, {
        equipped: true,
      });

      // 2) 카테고리별 로컬 업데이트 (현재 요구: 배지명 업데이트)
      const code = a.item.itemCategory?.categoryCode;
      if (code === "BAD") {
        setBadgeName(a.item.name);
      }
      // 필요 시 TIT/CHA도 아래처럼 확장
      // if (code === "TIT") { /* title 관련 로컬 상태 업데이트 */ }
      // if (code === "CHA") { /* char2dpath/char3dpath 갱신 등 */ }
    } catch (e) {
      console.error(e);
      alert("장착에 실패했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-background text-foreground overflow-hidden font-optimized"
      style={{ maxWidth: "100vw", fontSize: "var(--text-base)", fontWeight: "var(--font-weight-normal)", lineHeight: "1.5" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}
    >
      {/* 배경 */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/30 via-transparent to-orange-50/20 dark:from-yellow-950/20 dark:via-transparent dark:to-orange-950/10" />

      <div className="relative z-10 h-full flex flex-col font-optimized">
        {/* 헤더 (디자인 그대로 유지) */}
        <motion.div
          className="bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm"
          style={{ padding: "var(--spacing-lg) var(--spacing-xl)", minHeight: "var(--header-xs)" }}
          initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
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
                  <Trophy className="text-white" style={{ width: "var(--icon-md)", height: "var(--icon-md)" }} />
                </div>
                <h1 className="game-text text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-yellow-400 dark:to-orange-400"
                  style={{ fontSize: "clamp(1.25rem, 4vw, 2rem)", fontWeight: "var(--font-weight-medium)" }}>
                  업적
                </h1>

                {loading && (
                  <span className="ml-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-600">
                    불러오는 중…
                  </span>
                )}
                {error && !loading && (
                  <span className="ml-2 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs text-red-600">
                    {error}
                  </span>
                )}
              </div>
            </div>

            {/* 진행률(서버 제공) — 디자인 유지 */}
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl shadow-lg border border-border/50 relative overflow-hidden"
              style={{ padding: "var(--spacing-md) var(--spacing-xl)" }}
            >
              <div className="flex items-center relative z-10" style={{ gap: "var(--spacing-sm)" }}>
                <div className="text-center">
                  <div className="text-yellow-600 dark:text-yellow-400 number-optimized" style={{ fontSize: "clamp(1.125rem, 4vw, 1.5rem)" }}>
                    {stats.completed}
                  </div>
                  <div className="text-muted-foreground" style={{ fontSize: "clamp(0.75rem, 2.5vw, 0.875rem)" }}>
                    달성
                  </div>
                </div>
                <div className="w-px bg-border/50" style={{ height: "var(--spacing-4xl)" }} />
                <div className="text-center">
                  <div className="text-foreground number-optimized" style={{ fontSize: "clamp(1.125rem, 4vw, 1.5rem)" }}>
                    {Math.ceil(stats.overallProgress)}%
                  </div>
                  <div className="text-muted-foreground" style={{ fontSize: "clamp(0.75rem, 2.5vw, 0.875rem)" }}>
                    전체 진행률
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 리스트 */}
        <AchievementList
          achievements={filteredAchievements}
          isRefreshing={isRefreshing}
          onRefresh={async () => {
            setIsRefreshing(true);
            try { await fetchAchievements(); } finally {
              await new Promise((r) => setTimeout(r, 400));
              setIsRefreshing(false);
            }
          }}
          loading={loading}
          error={error}
          onSelect={() => {}}
          onEquip={handleEquip}
          currentBadge={currentBadge}
        />

        {/* (선택) 상세 모달 */}
        <AnimatePresence>{/* reserved */}</AnimatePresence>
      </div>
    </motion.div>
  );
}
