import { motion } from "framer-motion";
import { X, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Separator } from "@/shared/ui/separator";

import apiClient from "@/shared/services/api";
import { useUserLoginStore } from "@/app/stores/userStore";

interface LoginFormProps {
  onLogin: () => void;
  onClose: () => void;
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
}

export function LoginForm({ onLogin, onClose, onSwitchToRegister, onForgotPassword }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const setUser = useUserLoginStore((state) => state.setUser);

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsLoading(true);

  //   // 실제 로그인 로직 시뮬레이션
  //   await new Promise(resolve => setTimeout(resolve, 1000));
  //   setIsLoading(false);
  //   onLogin();
  // };

  // 로그인 로직
  const handleLogin = async () => {
    try {

      console.log("🚀 로그인 요청 시작:", email, password);


      const res = await apiClient.post("/users/tokens/login", {
        email,
        password,
      });

      console.log("✅ 로그인 응답 전체:", res.data);

      // 1. 토큰 정보와 memberInfo 객체를 분리해서 받습니다.
      const { accessToken, refreshToken, memberInfo } = res.data.data;

      // 2. memberInfo 객체에서 사용자 상세 정보를 추출합니다.
      const {
        memberUid,
        email: userEmail,
        nickname,
        coin,
        score,
        xp,
        yoloScore,
        firstWinCnt,
        secondWinCnt,
        thirdWinCnt,
        useCoin,
        playCnt,
        char2dpath,
        char3dpath,
        badgename,
        titlepath
      } = memberInfo;
      
      console.log("🧩 구조분해 완료:", { accessToken, refreshToken, memberInfo });

      // 3. 모든 정보를 하나의 user 객체로 합쳐서 스토어에 저장합니다.
      const user = { 
        accessToken, 
        refreshToken, 
        memberUid, 
        email: userEmail, 
        nickname, 
        coin, 
        score, 
        xp, 
        yoloScore, 
        firstWinCnt, 
        secondWinCnt, 
        thirdWinCnt, 
        useCoin, 
        playCnt,
        char2dpath,
        char3dpath,
        badgename,
        titlepath
      };

      // 상태 저장
      setUser(user);

      // 로컬스토리지 저장(선택사항)
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      console.log("📦 localStorage 저장 완료");

      // 로비로 이동
      onLogin();
    } catch (err) {
      alert(" 로그인 실패 ")
    }
  }


  const handleSocialLogin = async (provider: 'kakao' | 'google') => {
    setIsLoading(true);

    // 소셜 로그인 시뮬레이션
    console.log(`${provider} 로그인 시도`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    onLogin();
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white border border-border rounded-[25px] w-full max-w-sm shadow-2xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="relative bg-[#6dc4e8] p-6 text-white">
          <motion.button
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </motion.button>

          <div className="text-center">
            <motion.h2
              className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-2xl tracking-wider mb-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              로그인
            </motion.h2>
            <motion.p
              className="text-white/80 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              YOLO Bring IT에 오신 것을 환영합니다!
            </motion.p>
          </div>
        </div>

        {/* 폼 내용 */}
        <div className="p-6">
          {/* 소셜 로그인 버튼들 */}
          <div className="space-y-3 mb-6">
            <motion.button
              // 카카오톡 로그인
              className="w-full flex items-center justify-center gap-3 bg-[#FEE500] hover:bg-[#FDD800] text-black p-3 rounded-[15px] transition-all duration-300 group"
              whileHover={{ scale: 1.02, boxShadow: "0 4px 20px rgba(254,229,0,0.3)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSocialLogin('kakao')}
              disabled={isLoading}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center">
                <span className="text-[#FEE500] text-xs font-bold">K</span>
              </div>
              <span className="font-['BM_HANNA_TTF:Regular',_sans-serif] tracking-wider">
                카카오로 로그인
              </span>
              {isLoading && (
                <motion.div
                  className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              )}
            </motion.button>

            <motion.button
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-700 p-3 rounded-[15px] border border-gray-300 transition-all duration-300 group"
              whileHover={{ scale: 1.02, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center">
                <span className="text-[#FFFFFF] text-xs font-bold">G</span>
              </div>
              <span className="font-['BM_HANNA_TTF:Regular',_sans-serif] tracking-wider">
                구글로 로그인
              </span>
              {isLoading && (
                <motion.div
                  className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              )}
            </motion.button>
          </div>

          {/* 구분선 */}
          <div className="relative mb-6">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-card px-3 text-sm text-muted-foreground">
                또는
              </span>
            </div>
          </div>

          {/* 이메일 로그인 폼 */}
          <motion.form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-[12px] border-2 focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 rounded-[12px] border-2 focus:border-primary"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-muted-foreground">로그인 상태 유지</span>
              </label>
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-primary hover:underline transition-colors"
              >
                비밀번호 찾기
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-[#6dc4e8] to-[#5ab4d8] hover:from-[#5ab4d8] hover:to-[#4aa2c8] text-white rounded-[12px] font-['BM_HANNA_TTF:Regular',_sans-serif] tracking-wider"
              disabled={isLoading}
            >
              {isLoading ? (
                <motion.div
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                "로그인"
              )}
            </Button>
          </motion.form>

          {/* 회원가입 링크 */}
          <motion.div
            className="text-center mt-6 pt-4 border-t border-border"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-sm text-muted-foreground">
              아직 계정이 없으신가요?{" "}
              <button
                onClick={onSwitchToRegister}
                className="text-primary hover:underline font-medium"
              >
                회원가입하기
              </button>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}