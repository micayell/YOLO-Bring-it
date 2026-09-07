import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";

interface GameJoinScreenProps {
  onBack: () => void;
  onMatchmaking: (rounds: number, mode: "quick" | "custom") => void;
}

export function GameJoinScreen({ onBack, onMatchmaking }: GameJoinScreenProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRounds, setSelectedRounds] = useState<number>(3);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleCreateRoom = () => {
    onMatchmaking(selectedRounds, "custom");
    handleCloseModal();
  };

  return (
    <div className="bg-[#ffffff] dark:bg-background relative min-h-screen w-full transition-colors duration-300 overflow-hidden">
      {/* 뒤로가기 버튼 - 반응형 크기 */}
      <motion.button
        className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 bg-card/80 hover:bg-card/90 backdrop-blur-sm px-2 py-1 sm:px-4 sm:py-2 rounded-[10px] sm:rounded-[15px] border border-border hover:border-[#6dc4e8] shadow-lg transition-all duration-300 flex items-center gap-1 sm:gap-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onBack}
      >
        <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 text-foreground" />
        <span className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-xs sm:text-sm text-foreground">
          <span className="sm:hidden">뒤로</span>
          <span className="hidden sm:inline">뒤로가기</span>
        </span>
      </motion.button>

      {/* 메인 컨테이너 - 완전 반응형 */}
      <div className="flex flex-col md:flex-row items-center justify-center min-h-screen gap-3 sm:gap-4 md:gap-8 lg:gap-12 px-3 sm:px-4 md:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        
        {/* 헤더 타이틀 - 반응형, md 이상에서 숨김 */}
        <motion.div
          className="text-center mb-2 sm:mb-4 md:hidden w-full"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <h1 className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-lg sm:text-2xl text-foreground mb-1 tracking-wider">
            게임 참가
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            참가 방식을 선택해주세요
          </p>
        </motion.div>

        {/* 매칭 카드 - 완전 반응형 */}
        <motion.div
          className="relative w-full max-w-[280px] sm:max-w-[320px] md:max-w-[300px] lg:max-w-[350px] xl:max-w-[400px]"
          initial={{ x: -30, opacity: 0, scale: 0.9 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          transition={{ 
            delay: 0.3, 
            duration: 0.6, 
            ease: [0.23, 1, 0.32, 1]
          }}
        >
          <motion.div
            className="group relative w-full
                      h-[120px] sm:h-[140px]
                      md:h-[400px] lg:h-[450px] xl:h-[500px]
                      bg-[rgba(255,191,239,0.53)] 
              rounded-[15px] sm:rounded-[20px] md:rounded-[25px] lg:rounded-[35px] xl:rounded-[45px] 
              border-3 sm:border-4 md:border-5 lg:border-6 xl:border-7 
              border-[#6dc4e8] overflow-hidden cursor-pointer shadow-xl md:shadow-2xl"
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 15px 40px rgba(255,191,239,0.4)",
              transition: { duration: 0.3, ease: "easeOut" }
            }}
            whileTap={{ 
              scale: 0.98,
              transition: { duration: 0.1 }
            }}
            onClick={() => onMatchmaking(5, "quick")}
          >
            {/* 매칭 콘텐츠 - 반응형 레이아웃 */}
            <div className="flex md:flex-col items-center md:justify-center h-full p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 relative z-10">
              {/* 아이콘 - 반응형 크기와 위치 */}
              <motion.div
                className="flex-shrink-0 mr-3 md:mr-0 md:mb-4 lg:mb-6 xl:mb-8"
                animate={{
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <motion.div
                  className="flex items-center justify-center text-[4rem] sm:text-[5rem] md:text-[7rem] lg:text-[9rem] xl:text-[11rem] drop-shadow-xl"
                  // style={{ backgroundImage: `url('${imgFreeIconGlobalNetwork12794951}')` }} // 주석 처리
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  🌐
                </motion.div>
              </motion.div>

              {/* 텍스트 영역 - 반응형 레이아웃 */}
              <div className="flex-1 md:flex-none text-left md:text-center">
                <motion.h2
                  className="font-['BM_HANNA_TTF:Regular',_sans-serif] 
                    text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl 
                    text-white 
                    tracking-[2px] md:tracking-[4px] lg:tracking-[6px] xl:tracking-[8px] 
                    mb-1 md:mb-3 lg:mb-4 xl:mb-6"
                  style={{
                    textShadow: "0 0 15px rgba(255,255,255,0.8), 0 2px 8px rgba(0,0,0,0.3)"
                  }}
                  animate={{
                    textShadow: [
                      "0 0 15px rgba(255,255,255,0.8), 0 2px 8px rgba(0,0,0,0.3)",
                      "0 0 25px rgba(255,255,255,1), 0 2px 8px rgba(0,0,0,0.3)",
                      "0 0 15px rgba(255,255,255,0.8), 0 2px 8px rgba(0,0,0,0.3)"
                    ]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  매칭
                </motion.h2>
                
                {/* 설명 텍스트 - 반응형 표시 */}
                <div className="text-[#312e81] font-bold drop-shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 text-xs sm:text-sm md:text-base leading-tight md:leading-relaxed">
                        {/* 모바일용 간단한 설명 */}
                        <div className="md:hidden space-y-0.5">
                          <p>랜덤 매칭으로</p>
                    <p>바로 게임 시작!</p>
                  </div>
                  
                  {/* 데스크톱용 자세한 설명 */}
                  <div className="hidden md:block space-y-1">
                    <p>랜덤 매칭을 통해</p>
                    <p>다른 플레이어들과</p>
                    <p>실시간으로 게임을</p>
                    <p>즐길 수 있습니다</p>
                    <p className="mt-2 lg:mt-3 text-xs lg:text-sm opacity-80">
                      카드를 터치하여 선택하세요
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 반짝이는 효과 */}
            <motion.div
              className="absolute top-0 left-0 w-[120%] h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
              animate={{
                x: ["-120%", "120%"]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                repeatDelay: 4,
                ease: "easeInOut"
              }}
            />

            {/* 하단 발광 - 반응형 높이 */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-6 sm:h-8 md:h-12 lg:h-16 xl:h-20 bg-gradient-to-t from-[rgba(255,191,239,0.8)] to-transparent"
              animate={{
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </motion.div>

        {/* 사용자 설정 카드 - 완전 반응형 */}
        <motion.div
          className="relative w-full max-w-[280px] sm:max-w-[320px] md:max-w-[300px] lg:max-w-[350px] xl:max-w-[400px]"
          initial={{ x: 30, opacity: 0, scale: 0.9 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          transition={{ 
            delay: 0.4, 
            duration: 0.6, 
            ease: [0.23, 1, 0.32, 1]
          }}
        >
          <motion.div
            className="group relative w-full
                      h-[120px] sm:h-[140px]
                      md:h-[400px] lg:h-[450px] xl:h-[500px]
                      bg-[rgba(94,255,100,0.53)] 
              rounded-[15px] sm:rounded-[20px] md:rounded-[25px] lg:rounded-[35px] xl:rounded-[45px] 
              border-3 sm:border-4 md:border-5 lg:border-6 xl:border-7 
              border-[#6dc4e8] overflow-hidden cursor-pointer shadow-xl md:shadow-2xl"
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 15px 40px rgba(94,255,100,0.4)",
              transition: { duration: 0.3, ease: "easeOut" }
            }}
            whileTap={{ 
              scale: 0.98,
              transition: { duration: 0.1 }
            }}
            onClick={handleOpenModal}
          >
            {/* 사용자 설정 콘텐츠 - 반응형 레이아웃 */}
            <div className="flex md:flex-col items-center md:justify-center h-full p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 relative z-10">
              {/* 아이콘 - 반응형 크기와 위치 */}
              <motion.div
                className="flex-shrink-0 mr-3 md:mr-0 md:mb-4 lg:mb-6 xl:mb-8"
                animate={{
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                <motion.div
                  className="flex items-center justify-center text-[4rem] sm:text-[5rem] md:text-[7rem] lg:text-[9rem] xl:text-[11rem] drop-shadow-xl"
                  // style={{ backgroundImage: `url('${imgFreeIconCustomization17998071}')` }} // 주석 처리
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  ⚙️
                </motion.div>
              </motion.div>

              {/* 텍스트 영역 - 반응형 레이아웃 */}
              <div className="flex-1 md:flex-none text-left md:text-center">
                <motion.h2
                  className="font-['BM_HANNA_TTF:Regular',_sans-serif] 
                    text-lg sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl 
                    text-white leading-tight 
                    mb-1 md:mb-3 lg:mb-4 xl:mb-6"
                  style={{
                    textShadow: "0 0 15px rgba(255,255,255,0.8), 0 2px 8px rgba(0,0,0,0.3)"
                  }}
                  animate={{
                    textShadow: [
                      "0 0 15px rgba(255,255,255,0.8), 0 2px 8px rgba(0,0,0,0.3)",
                      "0 0 25px rgba(255,255,255,1), 0 2px 8px rgba(0,0,0,0.3)",
                      "0 0 15px rgba(255,255,255,0.8), 0 2px 8px rgba(0,0,0,0.3)"
                    ]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                >
                  사용자 설정
                </motion.h2>
                
                {/* 설명 텍스트 - 반응형 표시 */}
                <div className="text-[#064e3b] font-bold drop-shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 text-xs sm:text-sm md:text-base leading-tight md:leading-relaxed">
                        {/* 모바일용 간단한 설명 */}
                        <div className="md:hidden space-y-0.5">
                          <p>커스텀 방 생성</p>
                    <p>친구 초대하기</p>
                  </div>
                  
                  {/* 데스크톱용 자세한 설명 */}
                  <div className="hidden md:block space-y-1">
                    <p>커스텀 방을 생성하고</p>
                    <p>친구들을 초대해서</p>
                    <p>함께 게임을 즐기거나</p>
                    <p>게임 설정을 변경할</p>
                    <p>수 있습니다</p>
                    <p className="mt-2 lg:mt-3 text-xs lg:text-sm opacity-80">
                      카드를 터치하여 선택하세요
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 반짝이는 효과 */}
            <motion.div
              className="absolute top-0 left-0 w-[120%] h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
              animate={{
                x: ["-120%", "120%"]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 5,
                ease: "easeInOut"
              }}
            />

            {/* 하단 발광 - 반응형 높이 */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-6 sm:h-8 md:h-12 lg:h-16 xl:h-20 bg-gradient-to-t from-[rgba(94,255,100,0.8)] to-transparent"
              animate={{
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* 사용자 설정 모달 */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl w-[90vw] max-w-md p-6 relative border border-border"
              initial={{ y: 30, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 30, opacity: 0, scale: 0.95 }}
              transition={{ ease: "easeOut", duration: 0.3 }}
              onClick={(e) => e.stopPropagation()} // 이벤트 버블링 방지
            >
              <h3 className="text-2xl font-['BM_HANNA_TTF:Regular',_sans-serif] text-foreground text-center mb-6">
                방 설정
              </h3>

              <div className="mb-8">
                <p className="text-xl font-['BM_HANNA_TTF:Regular',_sans-serif] text-muted-foreground text-center mb-4">
                  라운드 선택
                </p>
                <div className="flex justify-center gap-4">
                  {[3, 5, 7].map((rounds) => (
                    <motion.button
                      key={rounds}
                      onClick={() => setSelectedRounds(rounds)}
                      className={`px-6 py-3 rounded-xl text-xl font-bold transition-all duration-200 border-2 ${
                        selectedRounds === rounds
                          ? 'bg-[#6dc4e8] text-white border-transparent shadow-lg'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-[#6dc4e8] hover:text-[#6dc4e8]'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {rounds} 라운드
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.button
                onClick={handleCreateRoom}
                className="w-full bg-[#6dc4e8] hover:bg-[#57b3d9] text-white font-bold text-xl py-4 rounded-xl shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                방 만들기
              </motion.button>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 하단 힌트 텍스트 - 반응형 위치 */}
      <motion.div
        className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 text-center md:hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <p className="text-muted-foreground text-xs sm:text-sm">
          원하는 방식을 터치하세요
        </p>
      </motion.div>

      {/* 배경 장식 효과 - 반응형 크기 */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 좌상단 그라데이션 - 반응형 크기 */}
        <motion.div
          className="absolute top-10 sm:top-16 md:top-20 left-10 sm:left-16 md:left-20 
            w-20 h-20 sm:w-32 sm:h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 
            bg-gradient-to-br from-[rgba(255,191,239,0.1)] to-[rgba(109,196,232,0.1)] rounded-full blur-2xl md:blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [-5, 5, -5],
            y: [-3, 3, -3]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* 우하단 그라데이션 - 반응형 크기 */}
        <motion.div
          className="absolute bottom-10 sm:bottom-16 md:bottom-20 right-10 sm:right-16 md:right-20 
            w-16 h-16 sm:w-28 sm:h-28 md:w-40 md:h-40 lg:w-56 lg:h-56 
            bg-gradient-to-bl from-[rgba(94,255,100,0.1)] to-[rgba(109,196,232,0.1)] rounded-full blur-2xl md:blur-3xl"
          animate={{
            scale: [1.1, 0.9, 1.1],
            opacity: [0.4, 0.2, 0.4],
            x: [5, -5, 5],
            y: [3, -3, 3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />

        {/* 파티클 효과 - 반응형 개수와 크기 */}
        {[...Array(window.innerWidth >= 768 ? 8 : 4)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-0.5 h-0.5 md:w-1 md:h-1 bg-[#6dc4e8] rounded-full opacity-40"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
            animate={{
              y: [-4, 4, -4],
              x: [-2, 2, -2],
              opacity: [0.4, 0.8, 0.4],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 2 + (i * 0.2),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3
            }}
          />
        ))}
      </div>
    </div>
  );
}