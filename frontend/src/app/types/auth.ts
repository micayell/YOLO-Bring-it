export interface SocialProvider {
  clientId: string;
  redirectUri: string;
  scope: string;
}

export interface SocialLoginConfig {
  kakao: SocialProvider;
  google: SocialProvider;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface SocialLoginRequest {
  provider: 'kakao' | 'google';
  code: string;
  redirectUri: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  nickname?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}
