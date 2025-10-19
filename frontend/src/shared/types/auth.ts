export interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  provider: 'kakao' | 'google' | 'local';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface SocialLoginRequest {
  provider: 'kakao' | 'google';
  code: string;
  redirectUri: string;
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

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshTokenValue: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface SocialLoginConfig {
  kakao: {
    clientId: string;
    redirectUri: string;
    scope: string;
  };
  google: {
    clientId: string;
    redirectUri: string;
    scope: string;
  };
} 