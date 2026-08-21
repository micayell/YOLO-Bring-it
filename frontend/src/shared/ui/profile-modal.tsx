import { AnimatePresence, motion } from "framer-motion";
import { LogOut, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { useUserLoginStore } from "@/domains/user/stores/userStore";
import { EditProfileModal } from "./edit-profile-modal"; // ⭐ 회원정보 수정 모달

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOwnProfile?: boolean; // 자신의 프로필인지 친구 프로필인지 구분
  memberOverride?: any; // 친구 프로필을 위한 오버라이드 데이터
}

export function ProfileModal({ isOpen, onClose, isOwnProfile = true, memberOverride }: ProfileModalProps) {
  const { userData, clearUser: clearUserLogin } = useUserLoginStore();
  // ⭐ 자신 프로필이면 store, 친구면 override 표시
  const member: any = isOwnProfile ? userData : memberOverride;

  // ✅ 레벨/경험치 계산
  const lev = Math.floor((userData?.xp || 0) / 100);
  const exp = Math.floor((userData?.xp || 0) % 100);

  // ✅ 라우팅
  const navigate = useNavigate();

  // ✅ 회원정보 수정 모달 상태
  const [editOpen, setEditOpen] = useState(false);

  // ✅ 로그아웃 핸들러 (왼쪽 하단 버튼)
  const handleLogout = () => {
    try {
      // 토큰 키 이름이 다른 경우 여기서 함께 삭제
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      // 스토어 초기화
      clearUserLogin();
    } finally {
      onClose?.();
      navigate("/"); // 랜딩 페이지로 이동
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
          {/* 모달 컨테이너: flex-col 로 바꾸고, 안쪽 내용은 스크롤 처리 */}
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
                {isOwnProfile ? "프로필" : `${member?.nickname}의 프로필`}
              </h2>
              <div className="flex-1 flex justify-end">
                <motion.button
                  className="p-3 rounded-lg bg-gray-200/50 hover:bg-gray-300/50"
                  onClick={() => {
                    setEditOpen(false);
                    onClose();
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-8 h-8 text-gray-600" />
                </motion.button>
              </div>
            </div>

            {/* 본문(스크롤 영역) */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  {/* 왼쪽: 기본 정보 */}
                  <div className="space-y-6 text-center">
                    {/* 캐릭터 정보 */}
                    <div>
                      <div className="w-32 h-32 bg-gray-200/60 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <span className="text-6xl">🦈</span>
                      </div>
                      <h3 className="text-3xl font-['BM_HANNA_TTF:Regular',_sans-serif] text-gray-800 mb-2">
                        {member?.nickname}
                      </h3>
                      <p className="text-2xl font-['BM_HANNA_TTF:Regular',_sans-serif] text-gray-600">
                        LV {lev}
                      </p>
                    </div>

                    {/* 경험치 바 */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-lg text-gray-600">Exp:</span>
                        <span className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-lg text-gray-600">
                          {exp}%
                        </span>
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

                    {/* 랭크 포인트 */}
                    <div className="text-center p-6 bg-gray-200/40 rounded-xl">
                      <p className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-2xl text-gray-700">Rank Point</p>
                      <p className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-4xl text-gray-800">{member?.score}</p>
                    </div>
                  </div>

                  {/* 오른쪽: 상세 정보 */}
                  <div className="space-y-6 text-center">
                    {/* 칭호 */}
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

                    {/* YOLO Point */}
                    <div className="space-y-3">
                      <h4 className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-2xl text-gray-800">🏅 명예 포인트</h4>
                      <div className="p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200/60 shadow-lg relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/20 to-transparent transform -skew-x-12"></div>
                        <div className="relative">
                          <p className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-3xl text-gray-800">{member?.yoloScore}</p>
                        </div>
                      </div>
                    </div>

                    {/* 순위 기록 */}
                    <div className="space-y-4">
                      <h4 className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-2xl text-gray-800">순위 기록</h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                          <p className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-sm text-yellow-700">1st</p>
                          <p className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-xl text-yellow-700">{member?.firstWinCnt}회</p>
                        </div>
                        <div className="text-center p-3 bg-gray-300/40 rounded-lg border border-gray-400/30">
                          <p className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-sm text-gray-700">2nd</p>
                          <p className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-xl text-gray-700">{member?.secondWinCnt}회</p>
                        </div>
                        <div className="text-center p-3 bg-orange-500/20 rounded-lg border border-orange-500/30">
                          <p className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-sm text-orange-700">3rd</p>
                          <p className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-xl text-orange-700">{member?.thirdWinCnt}회</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>{/* grid */}
              </div>{/* p-8 */}
            </div>{/* flex-1 overflow-y-auto */}

            {/* ✅ 푸터: 왼쪽 하단 로그아웃 + 오른쪽 회원정보 수정 */}
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

                <motion.button
                  onClick={() => setEditOpen(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-500 text-white px-4 py-2 shadow hover:bg-blue-600"
                >
                  회원정보 수정
                </motion.button>
              </div>
            )}
          </motion.div>

          {/* ⭐ 동일 크기의 수정 모달 (프로필 모달 위에) */}
          <EditProfileModal
            open={editOpen}
            onClose={() => setEditOpen(false)}
            initialNickname={member?.nickname ?? ""}
            initialName={(member as any)?.name ?? ""} // 백엔드 필드명이 다르면 여기만 맞추세요
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
