// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import FriendListTab from "../components/friends/FriendListTab";
// import AcceptListTab from "../components/friends/AcceptListTab";
// import BlockedListTab from "../components/friends/BlockedListTab";
// import AddFriendTab from "../components/friends/FriendAddTab";

// const tabItems = [
//   { key: "friends", label: "친구 목록" },
//   { key: "requests", label: "받은 요청" },
//   { key: "blocked", label: "차단 목록" },
//   { key: "add", label: "친구 추가" },
// ];

// export default function FriendTabsPage() {
//   const [selectedTab, setSelectedTab] = useState("friends");

//   return (
//     <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8">
//       {/* 탭 헤더 */}
//       <div className="flex justify-around border-b border-border pb-4">
//         {tabItems.map((tab) => (
//           <button
//             key={tab.key}
//             onClick={() => setSelectedTab(tab.key)}
//             className={`relative px-4 py-2 text-base font-medium transition-colors duration-300 font-optimized game-text text-muted-foreground hover:text-foreground ${
//               selectedTab === tab.key ? "text-foreground" : ""
//             }`}
//           >
//             {tab.label}
//             {selectedTab === tab.key && (
//               <motion.div
//                 layoutId="tab-underline"
//                 className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#6dc4e8]"
//               />
//             )}
//           </button>
//         ))}
//       </div>

//       {/* 탭 컨텐츠 */}
//       <AnimatePresence mode="wait">
//         <motion.div
//           key={selectedTab}
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           exit={{ opacity: 0, y: -20 }}
//           transition={{ duration: 0.3 }}
//         >
//           {selectedTab === "friends" && <FriendListTab />}
//           {selectedTab === "requests" && <AcceptListTab />}
//           {selectedTab === "blocked" && <BlockedListTab />}
//           {selectedTab === "add" && <AddFriendTab />}
//         </motion.div>
//       </AnimatePresence>
//     </div>
//   );
// }



// import { useState } from "react";
// import { motion } from "framer-motion";
// import FriendListTab from "../components/friends/FriendListTab";
// import AcceptListTab from "../components/friends/AcceptListTab";
// import BlockedListTab from "../components/friends/BlockedListTab";
// import AddFriendTab from "../components/friends/FriendAddTab";
// import { tabBtn, pageShell } from "../components/friends/friendsTheme";

// export default function FriendScreen() {
//   const [selectedTab, setSelectedTab] = useState<
//     "friends" | "requests" | "blocked" | "add"
//   >("friends");

//   return (
//     <div className={`w-full h-full flex flex-col ${pageShell}`}> 
//       {/* Tabs */}
//       <div className="flex justify-center gap-4 mb-6">
//         <button className={tabBtn(selectedTab === "friends")} onClick={() => setSelectedTab("friends")}>
//           친구 목록
//         </button>
//         <button className={tabBtn(selectedTab === "requests")} onClick={() => setSelectedTab("requests")}>
//           받은 요청
//         </button>
//         <button className={tabBtn(selectedTab === "blocked")} onClick={() => setSelectedTab("blocked")}>
//           차단 목록
//         </button>
//         <button className={tabBtn(selectedTab === "add")} onClick={() => setSelectedTab("add")}>
//           친구 추가
//         </button>
//       </div>

//       {/* Body */}
//       <motion.div
//         key={selectedTab}
//         initial={{ opacity: 0, y: 10 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.3 }}
//         className="flex-1 overflow-y-auto"
//       >
//         {selectedTab === "friends" && <FriendListTab />}
//         {selectedTab === "requests" && <AcceptListTab />}
//         {selectedTab === "blocked" && <BlockedListTab />}
//         {selectedTab === "add" && <AddFriendTab />}
//       </motion.div>
//     </div>
//   );
// }





// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Users, ArrowLeft, UserPlus, MessageCircle, Search, MoreVertical, UserMinus, Mail, Check, X, UserX } from "lucide-react";
// import { ChatWindow } from "@/widgets/ChatWindow";

// interface Friend {
//   id: string;
//   name: string;
//   avatar: string;
//   status: "online" | "offline" | "playing";
//   lastSeen?: Date;
//   level: number;
//   currentGame?: string;
//   mutualFriends: number;
// }

// interface FriendShip {
//   member_uid: string;
//   nickname: string;
//   lev: number; 
// }

// interface FriendRequest {
//   id: string;
//   name: string;
//   avatar: string;
//   level: number;
//   mutualFriends: number;
//   sentAt: Date;
// }

// interface BlockedUser {
//   id: string;
//   name: string;
//   // avatar: string;
//   blockedAt: Date;
// }

// interface FriendsScreenProps {
//   onBack: () => void;
// }

// export function FriendsScreen({ onBack }: FriendsScreenProps) {
//   const [selectedTab, setSelectedTab] = useState<"friends" | "requests" | "add" | "blocked">("friends");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [showMenu, setShowMenu] = useState<string | null>(null);
//   const [processingRequest, setProcessingRequest] = useState<string | null>(null);
//   const [chattingWith, setChattingWith] = useState<Friend | null>(null);

//   // 친구 불러오기
//   const [friends, setFriends] = useState<FriendShip[]>([])
//   useEffect(() => {
//     fetch("/friend_data.json")
//     .then((res) => res.json())
//     .then((data: FriendShip[]) => {
//       setFriends(data);
//     })
//     .catch((err) => {
//       console.error("친구 목록 로딩 실패: ", err)
//     })
//   }, [])

//   const [friends, setFriends] = useState<Friend[]>([
//     {
//       id: "friend1",
//       name: "플레이어123",
//       avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
//       status: "online",
//       level: 45,
//       mutualFriends: 3
//     },
//     {
//       id: "friend2", 
//       name: "게임러버",
//       avatar: "https://images.unsplash.com/photo-1494790108755-2616b78b8c57?w=100&h=100&fit=crop&crop=face",
//       status: "playing",
//       level: 38,
//       currentGame: "배틀로열",
//       mutualFriends: 7
//     },
//     {
//       id: "friend3",
//       name: "마스터김",
//       avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
//       status: "offline",
//       level: 67,
//       lastSeen: new Date('2024-01-22'),
//       mutualFriends: 12
//     },
//     {
//       id: "friend4",
//       name: "프로게이머",
//       avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
//       status: "online",
//       level: 89,
//       mutualFriends: 5
//     },
//     {
//       id: "friend5",
//       name: "초보탈출",
//       avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
//       status: "offline",
//       level: 23,
//       lastSeen: new Date('2024-01-20'),
//       mutualFriends: 2
//     }
//   ]);

//   const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([
//     {
//       id: "req1",
//       name: "새로운친구",
//       avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop&crop=face",
//       level: 34,
//       mutualFriends: 1,
//       sentAt: new Date('2024-01-23')
//     },
//     {
//       id: "req2",
//       name: "친구될래요",
//       avatar: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=100&h=100&fit=crop&crop=face",
//       level: 52,
//       mutualFriends: 4,
//       sentAt: new Date('2024-01-22')
//     },
//     {
//       id: "req3",
//       name: "게임마스터",
//       avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
//       level: 71,
//       mutualFriends: 8,
//       sentAt: new Date('2024-01-21')
//     }
//   ]);

//   const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([
//     {
//       id: "blocked1",
//       name: "차단된유저1",
//       avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face",
//       blockedAt: new Date('2024-01-20'),
//     },
//     {
//       id: "blocked2",
//       name: "차단된유저2",
//       avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&h=100&fit=crop&crop=face",
//       blockedAt: new Date('2024-01-19'),
//     }
//   ]);

//   const statusColors = {
//     online: "#6bcf7f",
//     offline: "#9ca3af", 
//     playing: "#ffd93d"
//   };

//   const statusText = {
//     online: "온라인",
//     offline: "오프라인",
//     playing: "게임 중"
//   };

//   // 친구 필터(기존에 수정)
//   const filteredFriends = friends.filter(friend =>
//     friend.nickname.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   // 친구 온라인 여부 확인
//   // const onlineFriends = friends.filter(f => f.status === "online" || f.status === "playing");

//   // 친구 삭제(기존에 수정)
//   const handleRemoveFriend = (friendId: string) => {
//     setFriends(prev => prev.filter(f => f.member_uid !== friendId));
//     setShowMenu(null);
//   };

//   const handleUnblockUser = (userId: string) => {
//     setBlockedUsers(prev => prev.filter(u => u.id !== userId));
//   };
  
//   const handleBlockFriend = (friendId: string) => {
//     const friendToBlock = friends.find(f => f.member_uid === friendId);
//     if (friendToBlock) {
//       setBlockedUsers(prev => [
//         ...prev,
//         {
//           id: friendToBlock.member_uid,
//           name: friendToBlock.nickname,
//           // avatar: friendToBlock.avatar,
//           blockedAt: new Date(),
//         },
//       ]);
//       setFriends(prev => prev.filter(f => f.member_uid !== friendId));
//     }
//     setShowMenu(null);
//   };
  
//   // 친구 요청 수락
//   const handleAcceptRequest = async (requestId: string) => {
//     setProcessingRequest(requestId);
    
//     const request = friendRequests.find(req => req.id === requestId);
//     if (!request) return;

//     try {
//       // 실제 서버 통신 시뮬레이션
//       await new Promise(resolve => setTimeout(resolve, 1000));

//       // 친구 목록에 추가
//       const newFriend: Friend = {
//         id: request.id,
//         name: request.name,
//         avatar: request.avatar,
//         status: "online", // 기본값으로 온라인 상태
//         level: request.level,
//         mutualFriends: request.mutualFriends
//       };

//       setFriends(prev => [newFriend, ...prev]);
      
//       // 요청 목록에서 제거
//       setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      
//       console.log(`${request.name}님의 친구 요청을 수락했습니다.`);
//     } catch (error) {
//       console.error("친구 요청 수락 중 오류:", error);
//     } finally {
//       setProcessingRequest(null);
//     }
//   };

//   // 친구 요청 거절
//   const handleRejectRequest = async (requestId: string) => {
//     setProcessingRequest(requestId);
    
//     const request = friendRequests.find(req => req.id === requestId);
//     if (!request) return;

//     try {
//       // 실제 서버 통신 시뮬레이션
//       await new Promise(resolve => setTimeout(resolve, 800));

//       // 요청 목록에서 제거
//       setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      
//       console.log(`${request.name}님의 친구 요청을 거절했습니다.`);
//     } catch (error) {
//       console.error("친구 요청 거절 중 오류:", error);
//     } finally {
//       setProcessingRequest(null);
//     }
//   };

//   const handleStartChat = (friend: Friend) => {
//     setChattingWith(friend);
//   };
  
//   const handleCloseChat = () => {
//     setChattingWith(null);
//   };

//   const tabs = [
//     { id: "friends", name: "친구", icon: Users, count: friends.length },
//     { id: "requests", name: "요청", icon: Mail, count: friendRequests.length },
//     { id: "blocked", name: "차단", icon: UserX, count: blockedUsers.length },
//     { id: "add", name: "추가", icon: UserPlus, count: 0 }
//   ];

//   return (
//     <motion.div
//       className="min-h-screen bg-background text-foreground overflow-hidden font-optimized"
//       style={{
//         maxWidth: "100vw",
//         fontSize: "var(--text-base)",
//         fontWeight: "var(--font-weight-normal)",
//         lineHeight: "1.5"
//       }}
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       transition={{ duration: 0.6 }}
//     >
//       {/* 배경 그라데이션 효과 */}
//       <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-transparent to-blue-50/20 dark:from-green-950/20 dark:via-transparent dark:to-blue-950/10" />
      
//       {/* 배경 장식 효과 */}
//       <motion.div
//         className="absolute w-40 h-40 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full blur-3xl"
//         style={{
//           top: "var(--spacing-5xl)",
//           right: "var(--spacing-5xl)"
//         }}
//         animate={{
//           scale: [1, 1.3, 1],
//           opacity: [0.3, 0.6, 0.3],
//           x: [-20, 20, -20]
//         }}
//         transition={{
//           duration: 7,
//           repeat: Infinity,
//           ease: "easeInOut"
//         }}
//       />

//       <div 
//         className="relative z-10 h-full overflow-y-auto font-optimized"
//         style={{
//           padding: "var(--spacing-lg)",
//           paddingTop: "var(--spacing-2xl)"
//         }}
//       >
//         {/* 헤더 */}
//         <motion.div
//           className="flex items-center justify-between mb-8 font-optimized"
//           style={{
//             marginBottom: "var(--spacing-4xl)"
//           }}
//           initial={{ y: -30, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ delay: 0.2, duration: 0.6 }}
//         >
//           <div 
//             className="flex items-center font-optimized"
//             style={{
//               gap: "var(--spacing-lg)"
//             }}
//           >
//             <motion.button
//               className="relative flex items-center bg-card/60 hover:bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden transition-all duration-300 touch-target font-optimized game-text shadow-sm"
//               style={{
//                 padding: "var(--spacing-md) var(--spacing-lg)",
//                 gap: "var(--spacing-sm)",
//                 fontSize: "clamp(0.875rem, 3vw, 1rem)",
//                 fontWeight: "var(--font-weight-medium)",
//                 lineHeight: "1.5",
//                 minHeight: "var(--touch-target-min)"
//               }}
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               onClick={onBack}
//             >
//               <ArrowLeft 
//                 style={{
//                   width: "var(--icon-md)",
//                   height: "var(--icon-md)"
//                 }}
//               />
//               <span className="relative z-10 hidden sm:inline">뒤로가기</span>
//             </motion.button>

//             <div 
//               className="flex items-center font-optimized"
//               style={{
//                 gap: "var(--spacing-md)"
//               }}
//             >
//               <Users 
//                 className="text-[#6dc4e8]"
//                 style={{
//                   width: "var(--icon-xl)",
//                   height: "var(--icon-xl)"
//                 }}
//               />
//               <h1 
//                 className="game-text text-[#6dc4e8] font-optimized"
//                 style={{
//                   fontSize: "clamp(1.5rem, 5vw, 2.5rem)",
//                   fontWeight: "var(--font-weight-medium)",
//                   lineHeight: "1.2",
//                   letterSpacing: "0.1em"
//                 }}
//               >
//                  친구
//               </h1>
//             </div>
//           </div>

//           {/* 온라인 친구 수 */}
//           <motion.div
//             className="bg-card/50 backdrop-blur-sm rounded-xl shadow-lg border border-border flex items-center font-optimized"
//             style={{
//               gap: "var(--spacing-sm)",
//               padding: "var(--spacing-sm) var(--spacing-xl)"
//             }}
//             animate={{
//               boxShadow: [
//                 "0 0 15px rgba(107,207,127,0.3)", 
//                 "0 0 25px rgba(107,207,127,0.5)", 
//                 "0 0 15px rgba(107,207,127,0.3)"
//               ]
//             }}
//             transition={{
//               duration: 3,
//               repeat: Infinity,
//               ease: "easeInOut"
//             }}
//           >
//             <div 
//               className="bg-[#6bcf7f] rounded-full animate-pulse"
//               style={{
//                 width: "0.75rem",
//                 height: "0.75rem"
//               }}
//             />
//             <span 
//               className="game-text text-foreground font-optimized"
//               style={{
//                 fontSize: "clamp(1rem, 4vw, 1.25rem)",
//                 fontWeight: "var(--font-weight-medium)",
//                 lineHeight: "1.4"
//               }}
//             >
//               온라인 {onlineFriends.length}명
//             </span>
//           </motion.div>
//         </motion.div>

//         {/* 탭 네비게이션 */}
//         <motion.div
//           className="flex overflow-x-auto pb-2 font-optimized"
//           style={{
//             gap: "var(--spacing-md)",
//             marginBottom: "var(--spacing-4xl)"
//           }}
//           initial={{ y: 20, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ delay: 0.4, duration: 0.6 }}
//         >
//           {tabs.map((tab, index) => {
//             const Icon = tab.icon;
//             const isActive = selectedTab === tab.id;
            
//             return (
//               <motion.button
//                 key={tab.id}
//                 className={`relative flex-shrink-0 flex items-center rounded-lg overflow-hidden transition-all duration-300 touch-target font-optimized game-text ${
//                   isActive
//                     ? 'bg-[#6dc4e8] text-white shadow-lg'
//                     : 'text-foreground bg-card/50 hover:bg-card/70 border border-border'
//                 }`}
//                 style={{
//                   gap: "var(--spacing-sm)",
//                   padding: "var(--spacing-md) var(--spacing-xl)",
//                   fontSize: "clamp(0.875rem, 3vw, 1rem)",
//                   fontWeight: "var(--font-weight-medium)",
//                   lineHeight: "1.5",
//                   minHeight: "var(--touch-target-min)"
//                 }}
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => setSelectedTab(tab.id as any)}
//                 initial={{ x: -50, opacity: 0 }}
//                 animate={{ x: 0, opacity: 1 }}
//                 transition={{ delay: 0.4 + (index * 0.1), duration: 0.6 }}
//               >
//                 <Icon 
//                   style={{
//                     width: "var(--icon-sm)",
//                     height: "var(--icon-sm)"
//                   }}
//                 />
//                 <span className="relative z-10">{tab.name}</span>
//                 {tab.count > 0 && (
//                   <motion.span 
//                     className="bg-white/30 text-xs rounded-full font-optimized"
//                     style={{
//                       padding: "var(--spacing-xs) var(--spacing-sm)",
//                       fontSize: "0.75rem",
//                       fontWeight: "var(--font-weight-medium)",
//                       lineHeight: "1.2"
//                     }}
//                     animate={{
//                       scale: tab.id === "requests" && tab.count > 0 ? [1, 1.1, 1] : 1
//                     }}
//                     transition={{
//                       duration: 1.5,
//                       repeat: tab.id === "requests" ? Infinity : 0,
//                       ease: "easeInOut"
//                     }}
//                   >
//                     {tab.count}
//                   </motion.span>
//                 )}
                
//                 {isActive && (
//                   <motion.div
//                     className="absolute top-0 left-0 w-[120%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
//                     animate={{ x: ["-120%", "120%"] }}
//                     transition={{
//                       duration: 2.5,
//                       repeat: Infinity,
//                       repeatDelay: 5,
//                       ease: "easeInOut"
//                     }}
//                   />
//                 )}
//               </motion.button>
//             );
//           })}
//         </motion.div>

//         {/* 친구 목록 탭 */}
//         {selectedTab === "friends" && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//             className="font-optimized"
//           >
//             {/* 검색 바 */}
//             <div 
//               className="relative font-optimized"
//               style={{
//                 marginBottom: "var(--spacing-2xl)"
//               }}
//             >
//               <Search 
//                 className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
//                 style={{
//                   width: "var(--icon-md)",
//                   height: "var(--icon-md)"
//                 }}
//               />
//               <input
//                 type="text"
//                 placeholder="친구 검색..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="w-full bg-card/50 backdrop-blur-sm rounded-xl border border-border focus:border-[#6dc4e8] outline-none transition-all duration-300 font-optimized game-text"
//                 style={{
//                   paddingLeft: "var(--spacing-4xl)",
//                   paddingRight: "var(--spacing-lg)",
//                   paddingTop: "var(--spacing-lg)",
//                   paddingBottom: "var(--spacing-lg)",
//                   fontSize: "clamp(0.875rem, 3vw, 1rem)",
//                   fontWeight: "var(--font-weight-normal)",
//                   lineHeight: "1.5",
//                   minHeight: "var(--touch-target-min)"
//                 }}
//               />
//             </div>

//             {/* 친구 리스트 */}
//             <div 
//               className="font-optimized"
//               style={{
//                 display: "flex",
//                 flexDirection: "column",
//                 gap: "var(--spacing-lg)"
//               }}
//             >
//               <AnimatePresence>
//                 {filteredFriends.map((friend, index) => (
//                   <motion.div
//                     key={friend.id}
//                     layout
//                     initial={{ opacity: 0, x: -50 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     exit={{ opacity: 0, x: 50 }}
//                     transition={{ delay: index * 0.1, duration: 0.6 }}
//                     className={`bg-white/80 backdrop-blur-sm rounded-xl border border-border shadow-lg hover:shadow-xl transition-all duration-300 font-optimized relative ${showMenu === friend.id ? 'z-10' : 'z-0'}`}
//                     style={{
//                       padding: "var(--spacing-xl)"
//                     }}
//                     whileHover={{ y: -3 }}
//                   >
//                     <div className="flex items-center justify-between font-optimized">
//                       <div 
//                         className="flex items-center font-optimized"
//                         style={{
//                           gap: "var(--spacing-lg)"
//                         }}
//                       >
//                         {/* 아바타 */}
//                         <div className="relative">
//                           <img
//                             src={friend.avatar}
//                             alt={friend.name}
//                             className="rounded-full object-cover border-2 border-card"
//                             style={{
//                               width: "var(--spacing-5xl)",
//                               height: "var(--spacing-5xl)"
//                             }}
//                           />
//                           <div
//                             className="absolute -bottom-1 -right-1 rounded-full border-2 border-card"
//                             style={{
//                               width: "var(--spacing-2xl)",
//                               height: "var(--spacing-2xl)",
//                               backgroundColor: statusColors[friend.status]
//                             }}
//                           />
//                         </div>

//                         {/* 친구 정보 */}
//                         <div 
//                           className="font-optimized"
//                           style={{
//                             display: "flex",
//                             flexDirection: "column",
//                             gap: "var(--spacing-xs)"
//                           }}
//                         >
//                           <h3 
//                             className="game-text text-foreground font-optimized"
//                             style={{
//                               fontSize: "clamp(1rem, 4vw, 1.25rem)",
//                               fontWeight: "var(--font-weight-medium)",
//                               lineHeight: "1.4"
//                             }}
//                           >
//                             {friend.name}
//                           </h3>
                          
//                           <div 
//                             className="flex items-center text-muted-foreground font-optimized"
//                             style={{
//                               gap: "var(--spacing-sm)",
//                               fontSize: "0.875rem",
//                               fontWeight: "var(--font-weight-normal)",
//                               lineHeight: "1.4"
//                             }}
//                           >
//                             <span>레벨 {friend.level}</span>
//                             <span>•</span>
//                             <span style={{ color: statusColors[friend.status] }}>
//                               {statusText[friend.status]}
//                             </span>
//                           </div>
                          
//                           {friend.lastSeen && friend.status === "offline" && (
//                             <div 
//                               className="text-muted-foreground font-optimized"
//                               style={{
//                                 fontSize: "0.75rem",
//                                 fontWeight: "var(--font-weight-normal)",
//                                 lineHeight: "1.4"
//                               }}
//                             >
//                               {friend.lastSeen.toLocaleDateString('ko-KR')} 마지막 접속
//                             </div>
//                           )}
                          
//                           <div 
//                             className="text-muted-foreground font-optimized"
//                             style={{
//                               fontSize: "0.75rem",
//                               fontWeight: "var(--font-weight-normal)",
//                               lineHeight: "1.4"
//                             }}
//                           >
//                             공통 친구 {friend.mutualFriends}명
//                           </div>
//                         </div>
//                       </div>

//                       {/* 액션 버튼들 */}
//                       <div 
//                         className="flex items-center font-optimized"
//                         style={{
//                           gap: "var(--spacing-sm)"
//                         }}
//                       >
//                         <motion.button
//                           className="relative bg-[#6dc4e8] text-white rounded-lg hover:bg-[#5ab4d8] transition-all duration-300 overflow-hidden touch-target"
//                           style={{
//                             padding: "var(--spacing-md)",
//                             minHeight: "var(--touch-target-min)"
//                           }}
//                           whileHover={{ scale: 1.05 }}
//                           whileTap={{ scale: 0.95 }}
//                           disabled={friend.status === "offline"}
//                           onClick={() => handleStartChat(friend)}
//                         >
//                           <MessageCircle 
//                             style={{
//                               width: "var(--icon-md)",
//                               height: "var(--icon-md)"
//                             }}
//                           />
//                           <motion.div
//                             className="absolute top-0 left-0 w-[120%] h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
//                             animate={{ x: ["-120%", "120%"] }}
//                             transition={{
//                               duration: 2,
//                               repeat: Infinity,
//                               repeatDelay: 4,
//                               ease: "easeInOut"
//                             }}
//                           />
//                         </motion.button>

//                         <div className="relative">
//                           <motion.button
//                             className="text-muted-foreground hover:text-foreground hover:bg-card rounded-lg transition-all duration-300 touch-target"
//                             style={{
//                               padding: "var(--spacing-md)",
//                               minHeight: "var(--touch-target-min)"
//                             }}
//                             whileHover={{ scale: 1.05 }}
//                             whileTap={{ scale: 0.95 }}
//                             onClick={() => setShowMenu(showMenu === friend.id ? null : friend.id)}
//                           >
//                             <MoreVertical 
//                               style={{
//                                 width: "var(--icon-md)",
//                                 height: "var(--icon-md)"
//                               }}
//                             />
//                           </motion.button>

//                           <AnimatePresence>
//                             {showMenu === friend.id && (
//                               <motion.div
//                                 className={`absolute right-0 z-10 w-40 bg-white rounded-lg shadow-lg border border-border p-1 ${
//                                   index >= filteredFriends.length - 2 ? "bottom-full" : "top-full"
//                                 }`}
//                                 style={{
//                                   [index >= filteredFriends.length - 2 ? "marginBottom" : "marginTop"]: "var(--spacing-sm)",
//                                 }}
//                                 initial={{ opacity: 0, scale: 0.8, y: index >= filteredFriends.length - 2 ? 10 : -10 }}
//                                 animate={{ opacity: 1, scale: 1, y: 0 }}
//                                 exit={{ opacity: 0, scale: 0.8, y: index >= filteredFriends.length - 2 ? 10 : -10 }}
//                                 transition={{ duration: 0.2 }}
//                               >
//                                 <button
//                                   className="w-full text-left text-warning hover:bg-warning/10 transition-colors duration-200 flex items-center font-optimized game-text rounded-md"
//                                   style={{
//                                     padding: "var(--spacing-md)",
//                                     gap: "var(--spacing-sm)",
//                                     fontSize: "0.875rem",
//                                     fontWeight: "var(--font-weight-medium)",
//                                     lineHeight: "1.4"
//                                   }}
//                                   onClick={() => handleRemoveFriend(friend.id)}
//                                 >
//                                   <UserMinus 
//                                     style={{
//                                       width: "var(--icon-sm)",
//                                       height: "var(--icon-sm)"
//                                     }}
//                                   />
//                                   친구 삭제
//                                 </button>
//                                 <div className="h-px my-1 bg-gray-500" />
//                                 <button
//                                   className="w-full text-left text-destructive hover:bg-destructive/10 transition-colors duration-200 flex items-center font-optimized game-text rounded-md"
//                                   style={{
//                                     padding: "var(--spacing-md)",
//                                     gap: "var(--spacing-sm)",
//                                     fontSize: "0.875rem",
//                                     fontWeight: "var(--font-weight-medium)",
//                                     lineHeight: "1.4"
//                                   }}
//                                   onClick={() => handleBlockFriend(friend.id)}
//                                 >
//                                   <UserX
//                                     style={{
//                                       width: "var(--icon-sm)",
//                                       height: "var(--icon-sm)"
//                                     }}
//                                   />
//                                   차단하기
//                                 </button>
//                               </motion.div>
//                             )}
//                           </AnimatePresence>
//                         </div>
//                       </div>
//                     </div>
//                   </motion.div>
//                 ))}
//               </AnimatePresence>
//             </div>
//           </motion.div>
//         )}

//         {/* 친구 요청 탭 */}
//         {selectedTab === "requests" && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//             className="font-optimized"
//           >
//             {friendRequests.length === 0 ? (
//               <motion.div
//                 className="text-center font-optimized"
//                 style={{
//                   paddingTop: "var(--spacing-5xl)",
//                   paddingBottom: "var(--spacing-5xl)"
//                 }}
//                 initial={{ opacity: 0, scale: 0.8 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 transition={{ duration: 0.6 }}
//               >
//                 <Mail 
//                   className="mx-auto text-muted-foreground"
//                   style={{
//                     width: "var(--spacing-5xl)",
//                     height: "var(--spacing-5xl)",
//                     marginBottom: "var(--spacing-lg)"
//                   }}
//                 />
//                 <h3 
//                   className="game-text text-foreground font-optimized"
//                   style={{
//                     fontSize: "clamp(1.125rem, 4vw, 1.5rem)",
//                     fontWeight: "var(--font-weight-medium)",
//                     lineHeight: "1.4",
//                     marginBottom: "var(--spacing-sm)"
//                   }}
//                 >
//                   받은 친구 요청이 없습니다
//                 </h3>
//                 <p 
//                   className="text-muted-foreground font-optimized"
//                   style={{
//                     fontSize: "clamp(0.875rem, 3vw, 1rem)",
//                     fontWeight: "var(--font-weight-normal)",
//                     lineHeight: "1.6"
//                   }}
//                 >
//                   새로운 친구 요청이 오면 여기에 표시됩니다
//                 </p>
//               </motion.div>
//             ) : (
//               <div 
//                 className="font-optimized"
//                 style={{
//                   display: "flex",
//                   flexDirection: "column",
//                   gap: "var(--spacing-lg)"
//                 }}
//               >
//                 <AnimatePresence>
//                   {friendRequests.map((request, index) => (
//                     <motion.div
//                       key={request.id}
//                       layout
//                       initial={{ opacity: 0, x: -50 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       exit={{ opacity: 0, x: 50 }}
//                       transition={{ delay: index * 0.1, duration: 0.6 }}
//                       className="bg-card/80 backdrop-blur-sm rounded-xl border border-border shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden font-optimized"
//                       style={{
//                         padding: "var(--spacing-xl)"
//                       }}
//                     >
//                       <div className="flex items-center justify-between font-optimized">
//                         <div 
//                           className="flex items-center font-optimized"
//                           style={{
//                             gap: "var(--spacing-lg)"
//                           }}
//                         >
//                           <div className="relative">
//                             <img
//                               src={request.avatar}
//                               alt={request.name}
//                               className="rounded-full object-cover border-2 border-card"
//                               style={{
//                                 width: "var(--spacing-5xl)",
//                                 height: "var(--spacing-5xl)"
//                               }}
//                             />
//                             {/* 새 요청 표시 */}
//                             <motion.div
//                               className="absolute -top-1 -right-1 bg-[#ff6b6b] rounded-full border-2 border-card"
//                               style={{
//                                 width: "var(--spacing-lg)",
//                                 height: "var(--spacing-lg)"
//                               }}
//                               animate={{
//                                 scale: [1, 1.2, 1],
//                                 opacity: [0.8, 1, 0.8]
//                               }}
//                               transition={{
//                                 duration: 1.5,
//                                 repeat: Infinity,
//                                 ease: "easeInOut"
//                               }}
//                             />
//                           </div>
                          
//                           <div 
//                             className="font-optimized"
//                             style={{
//                               display: "flex",
//                               flexDirection: "column",
//                               gap: "var(--spacing-xs)"
//                             }}
//                           >
//                             <h3 
//                               className="game-text text-foreground font-optimized"
//                               style={{
//                                 fontSize: "clamp(1rem, 4vw, 1.25rem)",
//                                 fontWeight: "var(--font-weight-medium)",
//                                 lineHeight: "1.4"
//                               }}
//                             >
//                               {request.name}
//                             </h3>
                            
//                             <div 
//                               className="text-muted-foreground font-optimized"
//                               style={{
//                                 fontSize: "0.875rem",
//                                 fontWeight: "var(--font-weight-normal)",
//                                 lineHeight: "1.4"
//                               }}
//                             >
//                               레벨 {request.level} • 공통 친구 {request.mutualFriends}명
//                             </div>
                            
//                             <div 
//                               className="text-muted-foreground font-optimized"
//                               style={{
//                                 fontSize: "0.75rem",
//                                 fontWeight: "var(--font-weight-normal)",
//                                 lineHeight: "1.4"
//                               }}
//                             >
//                               {request.sentAt.toLocaleDateString('ko-KR')} 요청
//                             </div>
//                           </div>
//                         </div>

//                         <div 
//                           className="flex items-center font-optimized"
//                           style={{
//                             gap: "var(--spacing-sm)"
//                           }}
//                         >
//                           {processingRequest === request.id ? (
//                             <div 
//                               className="flex items-center font-optimized"
//                               style={{
//                                 gap: "var(--spacing-sm)",
//                                 padding: "var(--spacing-sm) var(--spacing-lg)"
//                               }}
//                             >
//                               <motion.div
//                                 className="border-2 border-[#6dc4e8] border-t-transparent rounded-full"
//                                 style={{
//                                   width: "var(--icon-md)",
//                                   height: "var(--icon-md)"
//                                 }}
//                                 animate={{ rotate: 360 }}
//                                 transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//                               />
//                               <span 
//                                 className="text-muted-foreground font-optimized game-text"
//                                 style={{
//                                   fontSize: "0.875rem",
//                                   fontWeight: "var(--font-weight-normal)",
//                                   lineHeight: "1.4"
//                                 }}
//                               >
//                                 처리중...
//                               </span>
//                             </div>
//                           ) : (
//                             <>
//                               <motion.button
//                                 className="relative flex items-center bg-[#6bcf7f] text-white rounded-lg hover:bg-[#5bb86f] transition-all duration-300 overflow-hidden touch-target font-optimized game-text"
//                                 style={{
//                                   gap: "var(--spacing-sm)",
//                                   padding: "var(--spacing-sm) var(--spacing-lg)",
//                                   fontSize: "0.875rem",
//                                   fontWeight: "var(--font-weight-medium)",
//                                   lineHeight: "1.4",
//                                   minHeight: "var(--touch-target-min)"
//                                 }}
//                                 whileHover={{ scale: 1.05 }}
//                                 whileTap={{ scale: 0.95 }}
//                                 onClick={() => handleAcceptRequest(request.id)}
//                               >
//                                 <Check 
//                                   style={{
//                                     width: "var(--icon-sm)",
//                                     height: "var(--icon-sm)"
//                                   }}
//                                 />
//                                 <span className="relative z-10">수락</span>
//                                 <motion.div
//                                   className="absolute top-0 left-0 w-[120%] h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
//                                   animate={{ x: ["-120%", "120%"] }}
//                                   transition={{
//                                     duration: 2,
//                                     repeat: Infinity,
//                                     repeatDelay: 4,
//                                     ease: "easeInOut"
//                                   }}
//                                 />
//                               </motion.button>

//                               <motion.button
//                                 className="flex items-center bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-all duration-300 touch-target font-optimized game-text"
//                                 style={{
//                                   gap: "var(--spacing-sm)",
//                                   padding: "var(--spacing-sm) var(--spacing-lg)",
//                                   fontSize: "0.875rem",
//                                   fontWeight: "var(--font-weight-medium)",
//                                   lineHeight: "1.4",
//                                   minHeight: "var(--touch-target-min)"
//                                 }}
//                                 whileHover={{ scale: 1.05 }}
//                                 whileTap={{ scale: 0.95 }}
//                                 onClick={() => handleRejectRequest(request.id)}
//                               >
//                                 <X 
//                                   style={{
//                                     width: "var(--icon-sm)",
//                                     height: "var(--icon-sm)"
//                                   }}
//                                 />
//                                 거절
//                               </motion.button>
//                             </>
//                           )}
//                         </div>
//                       </div>

//                       {/* 요청 카드 반짝이는 효과 */}
//                       <motion.div
//                         className="absolute top-0 left-0 w-[120%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 pointer-events-none"
//                         animate={{ x: ["-120%", "120%"] }}
//                         transition={{
//                           duration: 4,
//                           repeat: Infinity,
//                           repeatDelay: 6 + (index * 0.5),
//                           ease: "easeInOut"
//                         }}
//                       />
//                     </motion.div>
//                   ))}
//                 </AnimatePresence>
//               </div>
//             )}
//           </motion.div>
//         )}
        
//         {/* 차단 목록 탭 */}
//         {selectedTab === "blocked" && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//             className="font-optimized"
//           >
//             {blockedUsers.length === 0 ? (
//               <motion.div
//                 className="text-center font-optimized"
//                 style={{ paddingTop: "var(--spacing-5xl)", paddingBottom: "var(--spacing-5xl)" }}
//                 initial={{ opacity: 0, scale: 0.8 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 transition={{ duration: 0.6 }}
//               >
//                 <UserX 
//                   className="mx-auto text-muted-foreground"
//                   style={{ width: "var(--spacing-5xl)", height: "var(--spacing-5xl)", marginBottom: "var(--spacing-lg)" }}
//                 />
//                 <h3 className="game-text text-foreground font-optimized" style={{ fontSize: "clamp(1.125rem, 4vw, 1.5rem)", fontWeight: "var(--font-weight-medium)", lineHeight: "1.4", marginBottom: "var(--spacing-sm)" }}>
//                   차단한 사용자가 없습니다
//                 </h3>
//                 <p className="text-muted-foreground font-optimized" style={{ fontSize: "clamp(0.875rem, 3vw, 1rem)", fontWeight: "var(--font-weight-normal)", lineHeight: "1.6" }}>
//                   사용자를 차단하면 여기에 표시됩니다.
//                 </p>
//               </motion.div>
//             ) : (
//               <div className="font-optimized" style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-lg)" }}>
//                 <AnimatePresence>
//                   {blockedUsers.map((user, index) => (
//                     <motion.div
//                       key={user.id}
//                       layout
//                       initial={{ opacity: 0, x: -50 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       exit={{ opacity: 0, x: 50 }}
//                       transition={{ delay: index * 0.1, duration: 0.6 }}
//                       className="bg-card/80 backdrop-blur-sm rounded-xl border border-border shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden font-optimized"
//                       style={{ padding: "var(--spacing-xl)" }}
//                     >
//                       <div className="flex items-center justify-between font-optimized">
//                         <div className="flex items-center font-optimized" style={{ gap: "var(--spacing-lg)" }}>
//                           <img
//                           src={user.avatar}
//                           alt={user.name}
//                           className="rounded-full object-cover border-2 border-card"
//                           style={{ width: "var(--spacing-5xl)", height: "var(--spacing-5xl)" }}
//                         />
//                           <div className="font-optimized" style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-xs)" }}>
//                             <h3 className="game-text text-foreground font-optimized" style={{ fontSize: "clamp(1rem, 4vw, 1.25rem)", fontWeight: "var(--font-weight-medium)", lineHeight: "1.4" }}>
//                               {user.name}
//                             </h3>
//                             <div className="text-muted-foreground font-optimized" style={{ fontSize: "0.75rem", fontWeight: "var(--font-weight-normal)", lineHeight: "1.4" }}>
//                               {user.blockedAt.toLocaleDateString('ko-KR')} 차단됨
//                             </div>
//                           </div>
//                         </div>
//                         <motion.button
//                           className="relative flex items-center bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-all duration-300 touch-target font-optimized game-text"
//                           style={{ gap: "var(--spacing-sm)", padding: "var(--spacing-sm) var(--spacing-lg)", fontSize: "0.875rem", fontWeight: "var(--font-weight-medium)", lineHeight: "1.4", minHeight: "var(--touch-target-min)" }}
//                           whileHover={{ scale: 1.05 }}
//                           whileTap={{ scale: 0.95 }}
//                           onClick={() => handleUnblockUser(user.id)}
//                         >
//                           차단 해제
//                         </motion.button>
//                       </div>
//                     </motion.div>
//                   ))}
//                 </AnimatePresence>
//               </div>
//             )}
//           </motion.div>
//         )}

//         {/* 친구 추가 탭 */}
//         {selectedTab === "add" && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//             className="text-center font-optimized"
//           >
//             <div 
//               className="bg-card/80 backdrop-blur-sm rounded-xl border border-border shadow-lg mx-auto font-optimized"
//               style={{
//                 padding: "var(--spacing-4xl)",
//                 maxWidth: "32rem"
//               }}
//             >
//               <UserPlus 
//                 className="mx-auto text-[#6dc4e8]"
//                 style={{
//                   width: "var(--spacing-5xl)",
//                   height: "var(--spacing-5xl)",
//                   marginBottom: "var(--spacing-lg)"
//                 }}
//               />
              
//               <h2 
//                 className="game-text text-foreground font-optimized"
//                 style={{
//                   fontSize: "clamp(1.25rem, 5vw, 2rem)",
//                   fontWeight: "var(--font-weight-medium)",
//                   lineHeight: "1.3",
//                   marginBottom: "var(--spacing-lg)"
//                 }}
//               >
//                 새로운 친구를 찾아보세요
//               </h2>
              
//               <p 
//                 className="text-muted-foreground font-optimized"
//                 style={{
//                   fontSize: "clamp(0.875rem, 3vw, 1rem)",
//                   fontWeight: "var(--font-weight-normal)",
//                   lineHeight: "1.6",
//                   marginBottom: "var(--spacing-2xl)"
//                 }}
//               >
//                 플레이어 이름으로 검색하거나 추천 친구를 확인해보세요
//               </p>
              
//               <div 
//                 className="font-optimized"
//                 style={{
//                   display: "flex",
//                   flexDirection: "column",
//                   gap: "var(--spacing-lg)"
//                 }}
//               >
//                 <input
//                   type="text"
//                   placeholder="플레이어 이름 입력..."
//                   className="w-full bg-card/50 backdrop-blur-sm rounded-xl border border-border focus:border-[#6dc4e8] outline-none transition-all duration-300 font-optimized game-text"
//                   style={{
//                     padding: "var(--spacing-lg) var(--spacing-xl)",
//                     fontSize: "clamp(0.875rem, 3vw, 1rem)",
//                     fontWeight: "var(--font-weight-normal)",
//                     lineHeight: "1.5",
//                     minHeight: "var(--touch-target-min)"
//                   }}
//                 />
                
//                 <motion.button
//                   className="relative w-full bg-[#6dc4e8] text-white rounded-xl hover:bg-[#5ab4d8] transition-all duration-300 overflow-hidden touch-target font-optimized game-text"
//                   style={{
//                     padding: "var(--spacing-lg)",
//                     fontSize: "clamp(1rem, 4vw, 1.25rem)",
//                     fontWeight: "var(--font-weight-medium)",
//                     lineHeight: "1.4",
//                     minHeight: "var(--touch-target-min)"
//                   }}
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   <span className="relative z-10">친구 검색</span>
//                   <motion.div
//                     className="absolute top-0 left-0 w-[120%] h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
//                     animate={{ x: ["-120%", "120%"] }}
//                     transition={{
//                       duration: 2,
//                       repeat: Infinity,
//                       repeatDelay: 3,
//                       ease: "easeInOut"
//                     }}
//                   />
//                 </motion.button>
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </div>

//       {/* 채팅 창 */}
//       <AnimatePresence>
//         {chattingWith && (
//           <ChatWindow
//             friend={chattingWith}
//             onClose={handleCloseChat}
//           />
//         )}
//       </AnimatePresence>
//     </motion.div>
//   );
// }

