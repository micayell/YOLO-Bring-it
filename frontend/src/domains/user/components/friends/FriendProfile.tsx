// src/components/profile/ProfileModal.tsx
import { motion, AnimatePresence } from "framer-motion";
import { X, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserLoginStore } from "@/domains/user/stores/userStore";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOwnProfile?: boolean; // 기본 true
  // ⭐ NEW: 친구 프로필용 외부 데이터(넘기면 이것을 우선 사용)
  memberOverride?: Partial<{
    nickname: string;
    avatarUrl?: string;
    xp?: number; // 100당 1레벨
    score?: number;
    yoloScore?: number;
    firstWinCnt?: number;
    secondWinCnt?: number;
    thirdWinCnt?: number;
  }>;
}

export function ProfileModal({
  isOpen,
  onClose,
  isOwnProfile = true,
  memberOverride,
}: ProfileModalProps) {
  const { userData, clearUser: clearUserLogin } = useUserLoginStore();
  // ⭐ 자신 프로필이면 store, 친구면 override 표시
  const member: any = isOwnProfile ? userData : memberOverride;

  const lev = Math.floor(((member?.xp ?? 0) as number) / 100);
  const exp = Math.floor(((member?.xp ?? 0) as number) % 100);

  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      clearUserLogin();
    } finally {
      onClose?.();
      navigate("/");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-100/95 backdrop-blur-sm rounded-2xl border border-gray-300/50 shadow-xl max-w-4xl w-full max-h-[85vh] flex flex-col"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            {/* 헤더 */}
            <div className="flex justify-between items-center p-8 border-b border-gray-300/30">
              <div className="flex-1" />
              <h2 className="text-3xl font-['BM_HANNA_TTF:Regular',_sans-serif] text-gray-800 tracking-wider">
                {isOwnProfile ? "프로필" : `${member?.nickname ?? "알 수 없음"}의 프로필`}
              </h2>
              <div className="flex-1 flex justify-end">
                <motion.button
                  className="p-3 rounded-lg bg-gray-200/50 hover:bg-gray-300/50"
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-8 h-8 text-gray-600" />
                </motion.button>
              </div>
            </div>

            {/* 본문 */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  {/* 왼쪽 */}
                  <div className="space-y-6 text-center">
                    <div>
                      <div className="w-32 h-32 bg-gray-200/60 rounded-full mx-auto mb-6 overflow-hidden">
                        {member?.avatarUrl ? (
                          <img src={member.avatarUrl} className="w-full h-full object-cover" />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-5xl">🦸</div>
                        )}
                      </div>
                      <h3 className="text-3xl font-['BM_HANNA_TTF:Regular',_sans-serif] text-gray-800 mb-2">
                        {member?.nickname ?? "알 수 없음"}
                      </h3>
                      <p className="text-2xl font-['BM_HANNA_TTF:Regular',_sans-serif] text-gray-600">
                        LV {lev}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-lg text-gray-600">Exp:</span>
                        <span className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-lg text-gray-600">{exp}%</span>
                      </div>
                      <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-gray-400 to-gray-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${exp}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    <div className="text-center p-6 bg-gray-200/40 rounded-xl">
                      <p className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-2xl text-gray-700">Rank Point</p>
                      <p className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-4xl text-gray-800">
                        {member?.score ?? 0}
                      </p>
                    </div>
                  </div>

                  {/* 오른쪽 */}
                  <div className="space-y-6 text-center">
                    <div className="space-y-4">
                      <h4 className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-3xl text-gray-800 font-bold tracking-wider">
                        🏆 칭호
                      </h4>
                      <div className="p-6 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl border-2 border-yellow-300/50 shadow-lg">
                        <p className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-2xl text-gray-800 font-semibold">
                          우리집은 만물상
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-2xl text-gray-800">🎖️ 명예 포인트</h4>
                      <div className="p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200/60 shadow-lg">
                        <p className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-3xl text-gray-800">
                          {member?.yoloScore ?? 0}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-2xl text-gray-800">순위 기록</h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                          <p className="text-sm text-yellow-700">1st</p>
                          <p className="text-xl text-yellow-700">{member?.firstWinCnt ?? 0}회</p>
                        </div>
                        <div className="text-center p-3 bg-gray-300/40 rounded-lg border border-gray-400/30">
                          <p className="text-sm text-gray-700">2nd</p>
                          <p className="text-xl text-gray-700">{member?.secondWinCnt ?? 0}회</p>
                        </div>
                        <div className="text-center p-3 bg-orange-500/20 rounded-lg border border-orange-500/30">
                          <p className="text-sm text-orange-700">3rd</p>
                          <p className="text-xl text-orange-700">{member?.thirdWinCnt ?? 0}회</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>{/* grid */}
              </div>{/* p-8 */}
            </div>{/* scroll */}

            {/* 푸터: 내 프로필일 때만 로그아웃/수정 노출 */}
            {isOwnProfile && (
              <div className="border-t border-gray-300/30 px-6 py-4 flex items-center justify-between">
                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-500 text-white px-4 py-2 shadow hover:bg-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  로그아웃
                </motion.button>

                {/* 개인 프로필의 '회원정보 수정' 버튼은 필요 시 그대로 두세요 */}
                <div />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
