import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/ui/button';
import { getKakaoLoginUrl, getGoogleLoginUrl } from '@/app/config/social';

interface SocialLoginProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SocialLogin: React.FC<SocialLoginProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const handleKakaoLogin = () => {
    const kakaoUrl = getKakaoLoginUrl();
    window.location.href = kakaoUrl;
  };

  const handleGoogleLogin = () => {
    const googleUrl = getGoogleLoginUrl();
    window.location.href = googleUrl;
  };

  const buttonSize = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-12 px-6 text-base',
    lg: 'h-14 px-8 text-lg',
  };

  return (
    <div className={`flex flex-col space-y-3 ${className}`}>
      {/* 카카오 로그인 */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          onClick={handleKakaoLogin}
          className={`w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium ${buttonSize[size]}`}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C7.03 3 3 6.14 3 10c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h1v-3.5h-1v-1.5c0-1.1.9-2 2-2h1c1.1 0 2 .9 2 2v1.5h-1V17h1c.55 0 1-.45 1-1v-1.26c1.81-1.27 3-3.36 3-5.74 0-3.86-4.03-7-9-7z"/>
            </svg>
            <span>카카오로 시작하기</span>
          </div>
        </Button>
      </motion.div>

      {/* 구글 로그인 */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          onClick={handleGoogleLogin}
          variant="outline"
          className={`w-full border-gray-300 hover:bg-gray-50 ${buttonSize[size]}`}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>구글로 시작하기</span>
          </div>
        </Button>
      </motion.div>
    </div>
  );
}; 