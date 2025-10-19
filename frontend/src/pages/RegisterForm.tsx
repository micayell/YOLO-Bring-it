import { motion } from "framer-motion";
import { X, Mail, Lock, Eye, EyeOff, User, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Separator } from "@/shared/ui/separator";
import apiClient from "@/shared/services/api";

// User 정보 저장
import { useUserLoginStore } from "@/app/stores/userStore";

interface RegisterFormProps {
  onRegister: () => void;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onRegister, onClose, onSwitchToLogin }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAgreementChange = (field: string, checked: boolean) => {
    setAgreements(prev => ({ ...prev, [field]: checked }));
  };

  const handleSocialRegister = async (provider: 'kakao' | 'google') => {
    setIsLoading(true);
    
    // 소셜 회원가입 시뮬레이션
    console.log(`${provider} 회원가입 시도`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    onRegister();
  };

  ///////////////
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    nickname: "",
    password: "",
    confirmPassword: "",
  });
  const [code, setCode] = useState("");
  const [timer, setTimer] = useState(300);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

  const isFormValid =
    formData.name &&
    formData.nickname &&
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword &&
    agreements.terms &&
    agreements.privacy;

  // 타이머
  useEffect(() => {
    if (step === 2 && timer > 0) {
      const id = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      setTimerId(id);
      return () => clearInterval(id);
    } else if (timer === 0 && timerId) {
      clearInterval(timerId);
    }
  }, [step, timer]);

  const handleSendCode = async () => {
    try {
      await apiClient.post("/users/tokens/signup/email", { email: formData.email });
      setStep(2);
      setTimer(300); // 5분
    } catch(error) {
      console.log("에러",error);
      alert("이메일 전송 실패");
      
    }
  };

  const handleVerifyCode = async () => {
    try {
      await apiClient.post("/users/tokens/verification", {
        email: formData.email,
        code,
      });
      if (timerId) clearInterval(timerId);
      setStep(3);
    } catch {
      alert("인증번호가 올바르지 않습니다.");
    }
  };

    {/* 커스텀 체크박스 */}
  function Checkbox({ label, field, optional = false }: {
    label: string;
    field: keyof typeof agreements;
    optional?: boolean;
  }) {
    return (
      <label className="flex items-center gap-3 text-sm">
        <div className="relative">
          <input
            type="checkbox"
            checked={agreements[field]}
            onChange={(e) => handleAgreementChange(field, e.target.checked)}
            className="sr-only"
          />
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
              agreements[field] ? "bg-primary border-primary" : "border-border"
            }`}
          >
            {agreements[field] && <Check className="w-3 h-3 text-primary-foreground" />}
          </div>
        </div>
        <span className={optional ? "text-muted-foreground" : "text-foreground"}>
          {!optional && <span className="text-destructive">*</span>} {label}
        </span>
      </label>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await apiClient.post("/users/users", {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        nickname: formData.nickname,
        intro: "",
      });

      // 응답에서 필요한 데이터 추출 (백엔드 응답 구조에 맞춰야 함)
      const userData = response.data.data;

      // useUserLoginStore에 저장
      useUserLoginStore.getState().setUser(userData);

      // 부모로 콜백: 게임 로비로 이동
      onRegister();  // App.tsx 또는 useGameLogic에서 currentScreen을 'lobby'로 변경

    } catch (error) {
      console.log("회원가입 에러", error);
      alert("회원가입 실패");
    } finally {
      setIsLoading(false);
    }
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
        className="bg-white border border-border rounded-[25px] w-full max-w-sm shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
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
              회원가입
            </motion.h2>
            <motion.p 
              className="text-white/80 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              새로운 모험을 시작해보세요!
            </motion.p>
          </div>
        </div>

        {/* 폼 내용 */}
        <div className="p-6">
          {/* 소셜 회원가입 버튼들 */}
          <div className="space-y-3 mb-6">
            <motion.button
              className="w-full flex items-center justify-center gap-3 bg-[#FEE500] hover:bg-[#FDD800] text-black p-3 rounded-[15px] transition-all duration-300 group"
              whileHover={{ scale: 1.02, boxShadow: "0 4px 20px rgba(254,229,0,0.3)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSocialRegister('kakao')}
              disabled={isLoading}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center">
                <span className="text-[#FEE500] text-xs font-bold">K</span>
              </div>
              <span className="font-['BM_HANNA_TTF:Regular',_sans-serif] tracking-wider">
                카카오로 가입하기
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
              onClick={() => handleSocialRegister('google')}
              disabled={isLoading}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center">
                <span className="text-[#FFFFFF] text-xs font-bold">G</span>
              </div>
              <span className="font-['BM_HANNA_TTF:Regular',_sans-serif] tracking-wider">
                구글로 가입하기
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

          {/* 회원가입 폼 */}
          <motion.form
              onSubmit={handleSubmit}
              className="space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {step === 1 && (
                <>
                  <Label htmlFor="email">이메일</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="이메일을 입력하세요"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="pl-10 h-12 rounded-[12px] border-2 focus:border-primary"
                      required
                    />
                  </div>
                  <Button type="button" onClick={handleSendCode}
                    className="w-full h-12 bg-gradient-to-r from-[#6dc4e8] to-[#5ab4d8] hover:from-[#5ab4d8] hover:to-[#4aa2c8] text-white rounded-[12px] font-['BM_HANNA_TTF:Regular',_sans-serif] tracking-wider disabled:opacity-50"
                  >
                    인증메일 보내기
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <Label>이메일</Label>
                  <Input value={formData.email} readOnly className="h-12 bg-gray-400" />
                  <Label htmlFor="code">인증번호</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="인증번호를 입력하세요"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="h-12"
                  />
                  <div className="text-sm text-gray-500">
                    남은 시간: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
                  </div>
                  <Button type="button" onClick={handleVerifyCode}
                    className="w-full h-12 bg-gradient-to-r from-[#6dc4e8] to-[#5ab4d8] hover:from-[#5ab4d8] hover:to-[#4aa2c8] text-white rounded-[12px] font-['BM_HANNA_TTF:Regular',_sans-serif] tracking-wider disabled:opacity-50"
                  >
                    인증하기
                  </Button>
                </>
              )}

              {step === 3 && (
                <>
                  <Label>이메일</Label>
                  <Input value={formData.email} readOnly className="h-12 bg-gray-400" />

                  <Label htmlFor="nickname">이름</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="이름을 입력해주세요"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="pl-10 h-12 rounded-[12px] border-2 focus:border-primary"
                      required
                    />
                  </div>

                  <Label htmlFor="nickname">닉네임</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="nickname"
                      type="text"
                      placeholder="닉네임을 입력해주세요"
                      value={formData.nickname}
                      onChange={(e) => handleInputChange("nickname", e.target.value)}
                      className="pl-10 h-12 rounded-[12px] border-2 focus:border-primary"
                      required
                    />
                  </div>

                  <Label htmlFor="password">비밀번호</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="8자 이상의 비밀번호"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="pl-10 pr-10 h-12 rounded-[12px] border-2 focus:border-primary"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="비밀번호를 다시 입력하세요"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="pl-10 pr-10 h-12 rounded-[12px] border-2 focus:border-primary"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {formData.confirmPassword &&
                    formData.password !== formData.confirmPassword && (
                      <p className="text-destructive text-xs">비밀번호가 일치하지 않습니다.</p>
                    )}

                  <div className="space-y-2 py-4 border-t border-border">
                    <Checkbox label="이용약관에 동의합니다" field="terms" />
                    <Checkbox label="개인정보 처리방침에 동의합니다" field="privacy" />
                    <Checkbox label="마케팅 정보 수신에 동의합니다 (선택)" field="marketing" optional />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-[#6dc4e8] to-[#5ab4d8] hover:from-[#5ab4d8] hover:to-[#4aa2c8] text-white rounded-[12px] font-['BM_HANNA_TTF:Regular',_sans-serif] tracking-wider disabled:opacity-50"
                    disabled={isLoading || !isFormValid}
                  >
                    {isLoading ? (
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    ) : (
                      "가입하기"
                    )}
                  </Button>
                </>
              )}


            </motion.form>

          {/* 로그인 링크 */}
          <motion.div 
            className="text-center mt-6 pt-4 border-t border-border"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-sm text-muted-foreground">
              이미 계정이 있으신가요?{" "}
              <button
                onClick={onSwitchToLogin}
                className="text-primary hover:underline font-medium"
              >
                로그인하기
              </button>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}