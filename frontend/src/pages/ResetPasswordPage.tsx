import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "@/shared/services/api";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") ?? ""; // /resetpassword?token=...

  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const canSubmit = pw.length >= 8 && pw === pw2 && !!token && !busy;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return setError("유효하지 않은 링크입니다. 메일의 링크로 다시 시도해 주세요.");
    if (pw.length < 8) return setError("비밀번호는 8자 이상이어야 합니다.");
    if (pw !== pw2) return setError("비밀번호가 일치하지 않습니다.");

    setError(null);
    setBusy(true);
    try {
      await apiClient.post("/users/", {
        token,
        newPassword: pw,
      });
      // 성공 시 랜딩으로 이동
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "비밀번호 재설정에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  };

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
          <motion.h1
            className="font-bungee-shade text-[#6dc4e8] text-2xl sm:text-3xl lg:text-6xl cursor-pointer whitespace-nowrap"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            onClick={() => navigate("/")}
          >
            YOLO Bring IT
          </motion.h1>
        </motion.header>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 pb-8 sm:pb-12">
          {/* 박스(카드) */}
          <motion.div
            className="w-full max-w-md rounded-2xl border border-black/50 bg-white/5 backdrop-blur p-6 sm:p-8 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-6">비밀번호 재설정</h2>

            {!token && (
              <p className="text-sm text-red-500 mb-4">
                링크의 토큰이 없습니다. 메일의 재설정 링크로 접속해 주세요.
              </p>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">새 비밀번호</label>
                <input
                  type="password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="8자 이상"
                  className="w-full h-11 rounded-lg border border-white/15 bg-background/70 px-3 outline-none focus:ring-2 focus:ring-[#6dc4e8]"
                  required
                  minLength={8}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">새 비밀번호 확인</label>
                <input
                  type="password"
                  value={pw2}
                  onChange={(e) => setPw2(e.target.value)}
                  placeholder="한 번 더 입력"
                  className="w-full h-11 rounded-lg border border-white/15 bg-background/70 px-3 outline-none focus:ring-2 focus:ring-[#6dc4e8]"
                  required
                  minLength={8}
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              {/* 비밀번호 재설정 버튼 */}
              <motion.button
                type="submit"
                disabled={!canSubmit}
                className={`w-full h-12 rounded-[14px] transition-all duration-200 border-2
                  ${canSubmit
                    ? "bg-[rgba(109,196,232,0.2)] hover:bg-[rgba(109,196,232,0.3)] hover:border-[#6dc4e8] shadow-lg"
                    : "bg-blue-500/10 opacity-60 cursor-not-allowed border-transparent"
                  }`}
                whileHover={canSubmit ? { scale: 1.02 } : undefined}
                whileTap={canSubmit ? { scale: 0.98 } : undefined}
              >
                <span className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-lg tracking-[2px]">
                  {busy ? "처리 중..." : "비밀번호 재설정"}
                </span>
              </motion.button>
            </form>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
