# Spring Boot + OpenVidu + 소셜 로그인 API 스펙

## 개요
Spring Boot 백엔드에서 OpenVidu를 프록시하고 소셜 로그인(카카오, 구글)을 지원하는 API 스펙입니다.

## 의존성 (pom.xml)
```xml
<dependencies>
    <!-- Spring Boot Starter Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Spring Boot Starter Security -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    
    <!-- Spring Boot Starter OAuth2 Client -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-oauth2-client</artifactId>
    </dependency>
    
    <!-- JWT -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.11.5</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.11.5</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.11.5</version>
    </dependency>
    
    <!-- OpenVidu Java Client -->
    <dependency>
        <groupId>io.openvidu</groupId>
        <artifactId>openvidu-java-client</artifactId>
        <version>2.28.0</version>
    </dependency>
    
    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
```

## 설정 (application.yml)
```yaml
server:
  port: 8080

spring:
  application:
    name: yolo-bring-it-backend
  
  # 소셜 로그인 설정
  security:
    oauth2:
      client:
        registration:
          kakao:
            client-id: ${KAKAO_CLIENT_ID}
            client-secret: ${KAKAO_CLIENT_SECRET}
            redirect-uri: http://localhost:3000/auth/kakao/callback
            authorization-grant-type: authorization_code
            scope:
              - profile_nickname
              - profile_image
              - account_email
            client-authentication-method: post
            client-name: Kakao
            provider:
              kakao:
                authorization-uri: https://kauth.kakao.com/oauth/authorize
                token-uri: https://kauth.kakao.com/oauth/token
                user-info-uri: https://kapi.kakao.com/v2/user/me
                user-name-attribute: id
          
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}
            redirect-uri: http://localhost:3000/auth/google/callback
            authorization-grant-type: authorization_code
            scope:
              - email
              - profile
            client-authentication-method: post
            client-name: Google
            provider:
              google:
                authorization-uri: https://accounts.google.com/o/oauth2/v2/auth
                token-uri: https://oauth2.googleapis.com/token
                user-info-uri: https://www.googleapis.com/oauth2/v3/userinfo
                user-name-attribute: sub

openvidu:
  url: https://localhost:4443
  secret: MY_SECRET

jwt:
  secret: your-jwt-secret-key-here
  expiration: 86400000 # 24시간

cors:
  allowed-origins: "http://localhost:3000,http://localhost:5173"
```

## API 엔드포인트

### 1. 헬스 체크
```
GET /api/health
Response: { "status": "ok" }
```

### 2. 인증 API

#### 로컬 로그인
```
POST /api/auth/login
Body: { "email": "string", "password": "string" }
Response: { "user": {...}, "token": "jwt-token", "refreshToken": "refresh-token", "expiresIn": number }
```

#### 로컬 회원가입
```
POST /api/auth/register
Body: { "email": "string", "password": "string", "name": "string" }
Response: { "user": {...}, "token": "jwt-token", "refreshToken": "refresh-token", "expiresIn": number }
```

#### 소셜 로그인 (카카오)
```
POST /api/auth/social/kakao
Body: { "code": "string", "redirectUri": "string" }
Response: { "user": {...}, "token": "jwt-token", "refreshToken": "refresh-token", "expiresIn": number }
```

#### 소셜 로그인 (구글)
```
POST /api/auth/social/google
Body: { "code": "string", "redirectUri": "string" }
Response: { "user": {...}, "token": "jwt-token", "refreshToken": "refresh-token", "expiresIn": number }
```

#### 토큰 갱신
```
POST /api/auth/refresh
Body: { "refreshToken": "string" }
Response: { "user": {...}, "token": "jwt-token", "refreshToken": "refresh-token", "expiresIn": number }
```

#### 로그아웃
```
POST /api/auth/logout
Headers: Authorization: Bearer {token}
Response: { "status": "success" }
```

#### 현재 사용자 정보
```
GET /api/auth/me
Headers: Authorization: Bearer {token}
Response: { "user": {...} }
```

#### 프로필 업데이트
```
PUT /api/auth/profile
Headers: Authorization: Bearer {token}
Body: { "name": "string", "profileImage": "string" }
Response: { "user": {...} }
```

### 3. OpenVidu 세션 관리

#### 세션 생성
```
POST /api/openvidu/sessions
Headers: Authorization: Bearer {token}
Body: { "sessionName": "string" }
Response: { "sessionId": "string" }
```

#### 세션 참가 (토큰 발급)
```
POST /api/openvidu/sessions/{sessionId}/connections
Headers: Authorization: Bearer {token}
Body: { "participantName": "string" }
Response: { "token": "openvidu-token" }
```

#### 세션 정보 조회
```
GET /api/openvidu/sessions/{sessionId}
Headers: Authorization: Bearer {token}
Response: { "sessionId": "string", "participants": [...], "activeConnections": number }
```

#### 세션 종료
```
DELETE /api/openvidu/sessions/{sessionId}/connections/{connectionId}
Headers: Authorization: Bearer {token}
Response: { "status": "success" }
```

### 4. 채팅
```
POST /api/openvidu/sessions/{sessionId}/messages
Headers: Authorization: Bearer {token}
Body: { "message": "string" }
Response: { "status": "success" }
```

### 5. 화면 공유
```
POST /api/openvidu/sessions/{sessionId}/screen-share
Headers: Authorization: Bearer {token}
Response: { "token": "screen-share-token" }
```

## 주요 클래스 구조

### 1. AuthController
```java
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        // 로컬 로그인 로직
    }
    
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        // 회원가입 로직
    }
    
    @PostMapping("/social/{provider}")
    public ResponseEntity<AuthResponse> socialLogin(
        @PathVariable String provider,
        @RequestBody SocialLoginRequest request
    ) {
        // 소셜 로그인 로직
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody RefreshTokenRequest request) {
        // 토큰 갱신 로직
    }
    
    @PostMapping("/logout")
    public ResponseEntity<LogoutResponse> logout(@AuthenticationPrincipal UserDetails userDetails) {
        // 로그아웃 로직
    }
    
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        // 현재 사용자 정보 조회
    }
    
    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestBody UpdateProfileRequest request
    ) {
        // 프로필 업데이트
    }
}
```

### 2. AuthService
```java
@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @Autowired
    private OAuth2UserService oAuth2UserService;
    
    public AuthResponse login(LoginRequest request) {
        // 로컬 로그인 처리
    }
    
    public AuthResponse register(RegisterRequest request) {
        // 회원가입 처리
    }
    
    public AuthResponse socialLogin(String provider, String code, String redirectUri) {
        // 소셜 로그인 처리
    }
    
    public AuthResponse refreshToken(String refreshToken) {
        // 토큰 갱신 처리
    }
    
    public void logout(String token) {
        // 로그아웃 처리
    }
}
```

### 3. OAuth2UserService
```java
@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // OAuth2 사용자 정보 처리
    }
    
    private OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oAuth2User) {
        // 소셜 로그인 사용자 처리
    }
}
```

### 4. SecurityConfig
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/health").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService)
                )
                .successHandler(oAuth2AuthenticationSuccessHandler)
                .failureHandler(oAuth2AuthenticationFailureHandler)
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

## 에러 처리
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(OAuth2AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleOAuth2Exception(OAuth2AuthenticationException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(new ErrorResponse("OAuth2 오류", e.getMessage()));
    }
    
    @ExceptionHandler(OpenViduException.class)
    public ResponseEntity<ErrorResponse> handleOpenViduException(OpenViduException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ErrorResponse("OpenVidu 오류", e.getMessage()));
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ErrorResponse("서버 오류", "내부 서버 오류가 발생했습니다."));
    }
}
```

## CORS 설정
```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList(corsAllowedOrigins.split(",")));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

## 환경 변수 설정
```bash
# .env 파일
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_SECRET=your-jwt-secret-key
OPENVIDU_SECRET=your-openvidu-secret
```

## 실행 방법
1. OpenVidu 서버 실행 (Docker 또는 로컬 설치)
2. Spring Boot 애플리케이션 실행
3. 프론트엔드에서 API 호출

## 보안 고려사항
- JWT 토큰 기반 인증
- OAuth2 소셜 로그인 보안
- CORS 설정으로 허용된 도메인만 접근 가능
- OpenVidu 시크릿 키 보안 관리
- HTTPS 사용 권장 