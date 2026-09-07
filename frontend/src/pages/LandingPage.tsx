import { motion } from "framer-motion";
import { LandingPageImage } from "@/domains/game/components/LandingPageImage";

interface LandingPageProps {
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onLogout: () => void;
  onGameStart: () => void;
}

export function LandingPage({
  isLoggedIn,
  onLoginClick,
  onRegisterClick,
  onLogout,
  onGameStart,
}: LandingPageProps) {
  return (
    <div className="bg-background text-foreground min-h-screen w-full overflow-hidden font-optimized">
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* 상단 헤더 */}
        <motion.header
          className="flex justify-between items-center px-4 sm:px-8 lg:px-16 py-5 sm:py-6 lg:py-8 pb-2 sm:pb-0"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* 제목 */}
          <motion.h1
            className="font-bungee-shade text-[#6dc4e8] text-2xl sm:text-3xl lg:text-6xl cursor-pointer whitespace-nowrap"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            YOLO Bring IT
          </motion.h1>

          {/* 로그인/회원가입 버튼들 */}
          <motion.div
            className="flex gap-1 sm:gap-4 font-['BM_HANNA_TTF:Regular',_sans-serif]"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {isLoggedIn ? (
              <motion.button
                className="relative px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#ff5252] text-white border-2 border-transparent overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-[#ff6b6b]/40"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 25px rgba(255,107,107,0.5)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
              >
                <span className="relative z-10 text-sm sm:text-base lg:text-lg tracking-wider font-medium whitespace-nowrap">
                  로그아웃
                </span>
              </motion.button>
            ) : (
              <>
                {/* 로그인 버튼 (Outline 스타일) */}
                <motion.button
                  className="relative px-3 sm:px-6 lg:px-8 py-1 sm:py-3 rounded-full border-2 border-[#6dc4e8] text-[#6dc4e8] bg-transparent backdrop-blur-sm overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-[#6dc4e8]/25"
                  whileHover={{
                    scale: 1.05,
                    borderColor: "#5ab4d8",
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onLoginClick}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#6dc4e8] to-[#5ab4d8] opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                    initial={false}
                  />
                  <span className="relative z-10 text-xs sm:text-base lg:text-lg tracking-wider font-medium whitespace-nowrap">
                    로그인
                  </span>
                  <motion.div
                    className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                    animate={{
                      left: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                      ease: "easeInOut",
                    }}
                  />
                </motion.button>

                {/* 회원가입 버튼 (Filled 스타일) */}
                <motion.button
                  className="relative px-3 sm:px-6 lg:px-8 py-1 sm:py-3 rounded-full bg-gradient-to-r from-[#6dc4e8] to-[#5ab4d8] text-white border-2 border-transparent overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-[#6dc4e8]/40"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 25px rgba(109,196,232,0.5)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onRegisterClick}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#5ab4d8] to-[#4aa2c8] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={false}
                  />
                  <span className="relative z-10 text-xs sm:text-base lg:text-lg tracking-wider font-medium whitespace-nowrap">
                    회원가입
                  </span>
                  <motion.div
                    className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                    animate={{
                      left: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 4,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-t from-white/20 to-transparent opacity-50"
                    animate={{
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.button>
              </>
            )}
          </motion.div>
        </motion.header>

        {/* 메인 콘텐츠와 버튼을 포함하는 영역 */}
        <main className="flex-1 flex flex-col items-center justify-center gap-12 sm:gap-16 lg:gap-20 px-4 pb-8 sm:pb-12">
          {/* 캐릭터 이미지 및 효과를 위한 기준 컨테이너 */}
          <div className="relative w-64 h-64 sm:w-96 sm:h-96 lg:w-[500px] lg:h-[500px]">
            {/* 배경 소용돌이 효과 */}
            <div className="absolute inset-0 overflow-hidden z-0">
              <motion.div
                className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] border-t-2 border-[#6dc4e8]/20 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute w-[150%] h-[150%] top-[20%] left-[-30%] border-t-2 border-[#6dc4e8]/20 rounded-full"
                initial={{ rotate: 120 }}
                animate={{ rotate: 480 }}
                transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute w-[180%] h-[180%] top-[-20%] left-[30%] border-b-2 border-[#6dc4e8]/20 rounded-full"
                initial={{ rotate: -80 }}
                animate={{ rotate: 280 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              />
            </div>

            {/* 중앙에서 퍼지는 에너지 웨이브 */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`wave-${i}`}
                className="absolute top-1/2 left-1/2 border border-[#6dc4e8] rounded-full z-20 pointer-events-none"
                style={{
                  width: '100%',
                  height: '100%',
                  translateX: '-50%',
                  translateY: '-50%',
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1.8, 2.5],
                  opacity: [0, 0.4, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: i * 1.3,
                }}
              />
            ))}

            {/* 메인 캐릭터 이미지 컨테이너 */}
            <motion.div
              className="relative w-full h-full rounded-full overflow-hidden border-4 border-[#6dc4e8] shadow-2xl z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              {/* 회전하는 외부 테두리 */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-dashed border-[#6dc4e8] opacity-60"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />

              {/* 캐릭터 이미지 */}
              <motion.div
                className="w-full h-full rounded-full"
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, -2, 0],
                }}
                transition={{
                  scale: {
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                  rotate: {
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
              >
                <LandingPageImage className="w-full h-full object-cover" />
              </motion.div>

              {/* 내부 발광 효과 1 */}
              {/* <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/20 to-transparent"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear",
                }}
              /> */}
              {/* 내부 발광 효과 2 */}
              {/* <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-l from-blue-500/20 to-transparent"
                animate={{ rotate: -360 }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 0.5,
                }}
              /> */}
            </motion.div>
            {/* 떠다니는 파티클 효과 */}
            {[...Array(12)].map((_, i) => (
              // 1. 바깥쪽 div: 파티클을 원형으로 배치하는 역할만 담당
              <div
                key={i}
                className="absolute z-30"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `rotate(${i * 30}deg) translatex(clamp(140px, 22vw, 280px))`,
                }}
              >
                {/* 2. 안쪽 div: 제자리에서 흔들리는 애니메이션과 스타일 담당 */}
                <motion.div
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#6dc4e8] rounded-full opacity-60 shadow-lg"
                  style={{
                    // 부모 div가 정해준 위치에서 자신의 중심을 맞춤
                    transform: 'translate(-50%, -50%)',
                  }}
                  animate={{
                    y: [-5, 5, -5],
                    x: [-3, 3, -3],
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.2,
                  }}
                />
              </div>
            ))}
          </div>

          {/* 하단 게임 시작 버튼 */}
          <motion.button
            className="bg-[rgba(109,196,232,0.2)] hover:bg-[rgba(109,196,232,0.3)] px-12 sm:px-16 lg:px-20 py-4 sm:py-5 lg:py-6 rounded-[30px] sm:rounded-[35px] lg:rounded-[40px] cursor-pointer transition-all duration-200 border-2 border-transparent hover:border-[#6dc4e8] shadow-lg"
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(109,196,232,0.3)",
              boxShadow: "0 0 30px rgba(109,196,232,0.5)",
              transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            onClick={onGameStart}
          >
            <span className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-xl sm:text-2xl lg:text-4xl tracking-[3px] sm:tracking-[4px] lg:tracking-[5px] block">
              게 임 시 작
            </span>
          </motion.button>
        </main>
      </div>
    </div>
  );
}
