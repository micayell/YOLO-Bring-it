import { SocialLoginConfig } from '../types/auth';

export const SOCIAL_LOGIN_CONFIG: SocialLoginConfig = {
  kakao: {
    clientId: process.env.REACT_APP_KAKAO_CLIENT_ID || 'your-kakao-client-id',
    redirectUri: process.env.REACT_APP_KAKAO_REDIRECT_URI || 'http://localhost:3000/auth/kakao/callback',
    scope: 'profile_nickname,profile_image,account_email',
  },
  google: {
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id',
    redirectUri: process.env.REACT_APP_GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback',
    scope: 'email profile',
  },
};

// 카카오 로그인 URL 생성
export const getKakaoLoginUrl = (): string => {
  const { clientId, redirectUri, scope } = SOCIAL_LOGIN_CONFIG.kakao;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope,
  });
  
  return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
};

// 구글 로그인 URL 생성
export const getGoogleLoginUrl = (): string => {
  const { clientId, redirectUri, scope } = SOCIAL_LOGIN_CONFIG.google;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope,
    access_type: 'offline',
    prompt: 'consent',
  });
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

// URL에서 인증 코드 추출
export const extractAuthCode = (url: string): string | null => {
  const urlParams = new URLSearchParams(url.split('?')[1]);
  return urlParams.get('code');
};

// 에러 코드에서 에러 메시지 변환
export const getSocialLoginErrorMessage = (error: string): string => {
  switch (error) {
    case 'access_denied':
      return '사용자가 로그인을 취소했습니다.';
    case 'invalid_request':
      return '잘못된 요청입니다.';
    case 'server_error':
      return '서버 오류가 발생했습니다.';
    case 'temporarily_unavailable':
      return '일시적으로 서비스를 이용할 수 없습니다.';
    default:
      return '소셜 로그인 중 오류가 발생했습니다.';
  }
}; 