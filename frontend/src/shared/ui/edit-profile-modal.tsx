// src/components/.../edit-profile-modal.tsx
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/shared/services/api";

// ✅ Zustand 스토어
import { useUserLoginStore } from "@/domains/user/stores/userStore";

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  initialNickname?: string;
  initialName?: string;
}

export function EditProfileModal({
  open,
  onClose,
  initialNickname = "",
  initialName = "",
}: EditProfileModalProps) {
  const { userData } = useUserLoginStore();

  // ✅ member-id 추론
  const memberId = useMemo(
    () => userData?.memberUid ?? (userData as any)?.memberId ?? (userData as any)?.myId,
    [userData]
  );

  // ✅ 토큰: localStorage 우선 → 스토어 fallback
  const accessToken =
    localStorage.getItem("accessToken") || (userData as any)?.accessToken || "";

  // ✅ 폼 상태
  const [nickname, setNickname] = useState(initialNickname);
  const [name, setName] = useState(initialName);
  const [password, setPassword] = useState("");      // 기존 비밀번호
  const [newpassword, setNewpassword] = useState(""); // 신규 비밀번호
  const [loading, setLoading] = useState(false);

  // ✅ 모달 열릴 때 초기화
  useEffect(() => {
    if (open) {
      setNickname(initialNickname);
      setName(initialName);
      setPassword("");
      setNewpassword("");
      setLoading(false);
    }
  }, [open, initialNickname, initialName]);

  const canSubmit = !!password && !!memberId && !!accessToken;

  const handleSave = async () => {
    if (!canSubmit) {
      alert("필수 입력값을 확인해 주세요. (기존 비밀번호는 필수입니다)");
      return;
    }
    const url = `${API_BASE_URL}/users/users/${memberId}`;
    const payload = { nickname, name, password, newpassword };

    try {
      setLoading(true);
      await axios.put(url, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      // ✅ PUT 성공 → 즉시 Zustand에 반영 (커스텀 액션 없이 setState로 안전 패치)
      useUserLoginStore.setState((s: any) => ({
        userData: {
          ...s.userData,
          nickname,
          name,
        },
      }));

      alert("회원정보가 수정되었습니다.");
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "수정 중 오류가 발생했습니다.";
      console.error("❌ EditProfile PUT error:", err);
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-100/95 backdrop-blur-sm rounded-2xl border border-gray-300/50 shadow-xl max-w-4xl w-full max-h-[85vh] flex flex-col"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* 헤더 */}
            <div className="flex justify-between items-center p-6 border-b border-gray-300/30">
              <h3 className="text-2xl font-['BM_HANNA_TTF:Regular',_sans-serif] text-gray-800">
                회원정보 수정
              </h3>
              <button
                className="p-2 rounded-lg bg-gray-200/50 hover:bg-gray-300/50 disabled:opacity-60"
                onClick={onClose}
                disabled={loading}
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* 본문 */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* 닉네임 */}
              <div>
                <label className="mb-1 block text-sm text-gray-600">닉네임</label>
                <input
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="새 닉네임"
                  disabled={loading}
                />
              </div>

              {/* 이름 */}
              <div>
                <label className="mb-1 block text-sm text-gray-600">이름</label>
                <input
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름"
                  disabled={loading}
                />
              </div>

              {/* 기존 비밀번호 (필수) */}
              <div>
                <label className="mb-1 block text-sm text-gray-600">기존 비밀번호</label>
                <input
                  type="password"
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="현재 비밀번호"
                  disabled={loading}
                />
              </div>

              {/* 신규 비밀번호 (선택) */}
              <div>
                <label className="mb-1 block text-sm text-gray-600">신규 비밀번호</label>
                <input
                  type="password"
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
                  value={newpassword}
                  onChange={(e) => setNewpassword(e.target.value)}
                  placeholder="새 비밀번호 (변경 시 입력)"
                  disabled={loading}
                />
              </div>
            </div>

            {/* 푸터 */}
            <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
              <button
                className="rounded-lg px-4 py-2 hover:bg-black/5 disabled:opacity-60"
                onClick={onClose}
                disabled={loading}
              >
                취소
              </button>
              <button
                className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-60"
                onClick={handleSave}
                disabled={!canSubmit || loading}
              >
                {loading ? "저장 중..." : "저장"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
