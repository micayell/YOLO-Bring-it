import { motion } from "framer-motion";
import { X, Mail, ArrowLeft, Check, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import apiClient from "@/shared/services/api";

interface ForgotPasswordFormProps {
  onClose: () => void;
  onBackToLogin: () => void;
}

export function ForgotPasswordForm({ onClose, onBackToLogin }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isNameSent, setIsNameSent] = useState(false);
  const [, setError] = useState("");

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!email.trim()) return;
    
  //   setIsLoading(true);
    
  //   // 비밀번호 재설정 이메일 전송 시뮬레이션
  //   await new Promise(resolve => setTimeout(resolve, 2000));
  //   setIsLoading(false);
  //   setIsEmailSent(true);
  // };

  const handleSendEmail = async () => {
    try {
      await apiClient.post("/users/users/password-reset",{
        email,
        name,
      })

      setIsEmailSent(true);
      setIsNameSent(true);
    } catch(err){
      console.error("이메일 전송 실패", err)
      setError("이메일 전송에 실패했습니다, 이메일 주소를 확인해주세요.")
    }
  }
  

  const handleBackToLogin = () => {
    setIsEmailSent(false);
    setIsNameSent(false);
    setEmail("");
    setName("");
    onBackToLogin();
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white border border-border rounded-[25px] w-full max-w-md shadow-2xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="relative bg-gradient-to-r from-[#6dc4e8] to-[#5ab4d8] p-6 text-white">
          <motion.button
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </motion.button>

          <motion.button
            className="absolute top-4 left-4 p-2 rounded-full hover:bg-white/20 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleBackToLogin}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          
          <div className="text-center">
            <motion.h2 
              className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-2xl tracking-wider mb-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {isEmailSent ? "이메일 전송 완료" : "비밀번호 찾기"}
            </motion.h2>
            <motion.p 
              className="text-white/80 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {isEmailSent 
                ? "이메일을 확인해 주세요" 
                : "가입한 이메일 주소를 입력해 주세요"
              }
              {isNameSent 
                ? "이름을 확인해 주세요" 
                : "본인의 이름을 입력해 주세요"
              }
              
            </motion.p>
          </div>
        </div>

        {/* 폼 내용 */}
        <div className="p-6">
          {!isEmailSent ? (
            // 이메일 입력 폼
            <motion.form 
              onSubmit={handleSendEmail} 
              className="space-y-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="space-y-2">
                <Label htmlFor="reset-email">이메일 주소</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="가입한 이메일을 입력하세요"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 rounded-[12px] border-2 focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reset-email">이름</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="reset-name"
                    type="text"
                    placeholder="이름을 입력하세요"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 h-12 rounded-[12px] border-2 focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="bg-muted/50 rounded-[12px] p-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  입력하신 이메일로 비밀번호 재설정 링크를 보내드립니다. 
                  이메일 확인 후 링크를 클릭하여 새로운 비밀번호를 설정해 주세요.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-[#6dc4e8] to-[#5ab4d8] hover:from-[#5ab4d8] hover:to-[#4aa2c8] text-white rounded-[12px] font-['BM_HANNA_TTF:Regular',_sans-serif] tracking-wider"
                disabled={isLoading || !email.trim()}
              >
                {isLoading ? (
                  <motion.div
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  "재설정 이메일 보내기"
                )}
              </Button>
            </motion.form>
          ) : (
            // 이메일 전송 완료 화면
            <motion.div 
              className="text-center space-y-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <motion.div
                className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              >
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </motion.div>

              <div className="space-y-3">
                <motion.h3 
                  className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-lg tracking-wider"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  이메일이 전송되었습니다!
                </motion.h3>
                
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-primary">{email}</span>로
                  </p>
                  <p className="text-sm text-muted-foreground">
                    비밀번호 재설정 링크를 보내드렸습니다.
                  </p>
                </motion.div>

                <motion.div 
                  className="bg-blue-50 dark:bg-blue-900/20 rounded-[12px] p-4 mt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                    이메일이 도착하지 않았다면 스팸 폴더를 확인해 주세요. 
                    5분 이내에 도착하지 않으면 다시 시도해 주세요.
                  </p>
                </motion.div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleBackToLogin}
                  className="w-full h-12 bg-gradient-to-r from-[#6dc4e8] to-[#5ab4d8] hover:from-[#5ab4d8] hover:to-[#4aa2c8] text-white rounded-[12px] font-['BM_HANNA_TTF:Regular',_sans-serif] tracking-wider"
                >
                  로그인으로 돌아가기
                </Button>
                
                <Button
                  onClick={() => {
                    setIsEmailSent(false);
                    setIsNameSent(false);
                    setEmail("");
                    setName("");
                  }}
                  variant="outline"
                  className="w-full h-12 rounded-[12px] font-['BM_HANNA_TTF:Regular',_sans-serif] tracking-wider"
                >
                  다시 시도하기
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}