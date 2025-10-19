import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/app/stores/authStore';
import { getSocialLoginErrorMessage } from '@/app/config/social';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface SocialLoginCallbackProps {
  provider: 'kakao' | 'google';
}

export const SocialLoginCallback: React.FC<SocialLoginCallbackProps> = ({ provider }) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const { socialLogin } = useAuthStore();

  useEffect(() => {
    const handleSocialLogin = async () => {
      try {
        // URL에서 인증 코드 추출
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          const message = getSocialLoginErrorMessage(error);
          setErrorMessage(message);
          setStatus('error');
          return;
        }

        if (!code) {
          setErrorMessage('인증 코드를 찾을 수 없습니다.');
          setStatus('error');
          return;
        }

        // 리다이렉트 URI 설정
        const redirectUri = `${window.location.origin}/auth/${provider}/callback`;

        // 소셜 로그인 처리
        await socialLogin(provider, code, redirectUri);
        setStatus('success');

        // 로그인 성공 후 메인 페이지로 이동
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);

      } catch (error) {
        const message = error instanceof Error ? error.message : '소셜 로그인에 실패했습니다.';
        setErrorMessage(message);
        setStatus('error');
      }
    };

    handleSocialLogin();
  }, [provider, socialLogin]);

  const getProviderName = () => {
    return provider === 'kakao' ? '카카오' : '구글';
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-12 h-12 text-white mx-auto" />
              </motion.div>
              <h2 className="text-xl font-bold text-white">
                {getProviderName()} 로그인 처리 중...
              </h2>
              <p className="text-white/80">
                잠시만 기다려주세요.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
              </motion.div>
              <h2 className="text-xl font-bold text-white">
                {getProviderName()} 로그인 성공!
              </h2>
              <p className="text-white/80">
                메인 페이지로 이동합니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <XCircle className="w-12 h-12 text-red-400 mx-auto" />
            </motion.div>
            <h2 className="text-xl font-bold text-white">
              {getProviderName()} 로그인 실패
            </h2>
            <p className="text-white/80">
              {errorMessage}
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => window.location.href = '/login'}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                로그인 페이지로 돌아가기
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                메인 페이지로 이동
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 