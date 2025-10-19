# YOLO, Bring It!

## 프로젝트 소개

`YOLO, Bring It!`은 사용자들이 실시간으로 모여 다양한 미니게임을 즐길 수 있는 웹 기반 소셜 게이밍 플랫폼입니다. 이 프로젝트는 React와 TypeScript를 기반으로 구축되었으며, 역동적인 사용자 인터페이스와 원활한 게임 경험을 제공하는 데 중점을 두고 있습니다.

### ✔️ **프로젝트 개요**

-   **목표**: 익명성에서 벗어난 액티브한 게임
-   **배경**: 기존 온라인 게임 환경의 익명성은 사용자 간의 소통 단절과 수동적 참여를 유발하는 경향이 있습니다. `YOLO, Bring It!`은 이러한 한계를 극복하고, OpenVidu를 통한 실시간 화상 소통과 다양한 소셜 기능을 결합하여 사용자들이 더욱 몰입감 있고 활발하게 교류하는 새로운 소셜 게이밍 플랫폼을 제공하고자 합니다.
-   **주요 기능**:
    -   **실시간 화상 채팅 기반 미니게임**: OpenVidu를 활용하여 자신의 표정과 움직임으로 즐기는 인터랙티브 게임
    -   **다양한 3D 캐릭터 시스템**: 개성 넘치는 3D 캐릭터를 선택하고 꾸밀 수 있는 기능
    -   **소셜 커뮤니티**: 친구, 랭킹, 업적 시스템을 통해 다른 사용자와 함께 성장하고 경쟁
    -   **아이템 상점 및 보관함**: 게임 플레이로 얻은 재화로 아이템을 구매하고 관리

### ✔️ **사용 기술 및 선택 이유**

| 구분 | 기술 | 선택 이유 |
| --- | --- | --- |
| **Frontend** | `React`, `TypeScript`, `Vite` | 컴포넌트 기반 아키텍처, 타입 안정성, 빠른 개발 속도를 통해 생산성과 유지보수성을 극대화합니다. |
| **Styling** | `Tailwind CSS`, `shadcn/ui` | 유틸리티 우선 접근법과 완성도 높은 컴포넌트로 빠르고 일관된 UI를 구축합니다. |
| **Animation** | `Framer Motion` | 선언적 구문을 통해 복잡한 애니메이션을 직관적으로 구현하여 사용자 경험을 향상시킵니다. |
| **State** | `Zustand` | 가볍고 직관적인 API를 통해 복잡한 상태 로직을 간결하게 관리합니다. |
| **Real-time** | `LiveKit` (WebRTC), `StompJS` | 실시간 화상 통신과 웹소켓 기반 메시징을 구현하여 핵심적인 인터랙티브 경험을 제공합니다. |
| **3D** | `Three.js`, `@react-three/fiber` | 선언적인 방식으로 3D 그래픽을 구현하여 사용자에게 높은 시각적 몰입감을 제공합니다. |
| **Backend** | `Spring Boot`, `Spring Cloud` (MSA) | MSA 구조를 기반으로 각 서비스를 독립적으로 개발 및 배포하여 유연성과 확장성을 확보합니다. |
| **Database** | `JPA`, `QueryDSL`, `PostgreSQL`, `Redis` | 안정적인 데이터 관리와 빠른 캐싱을 통해 효율적인 데이터 처리를 지원합니다. |
| **Messaging** | `Kafka`, `RabbitMQ` | 비동기 메시지 큐를 활용하여 서비스 간 결합도를 낮추고 안정적인 데이터 흐름을 보장합니다. |
| **AI (gRPC)** | `Python`, `FastAPI`, `gRPC` | 고성능 AI 모델을 gRPC를 통해 효율적으로 연동하여 객체 인식, 얼굴 분석 등 핵심 게임 로직을 구현합니다. |
| **AI Models**| `YOLO`, `DeepFace`, `MediaPipe`| 최신 AI 모델을 활용하여 사용자의 움직임과 표정을 정교하게 분석하고 게임에 반영합니다. |

## 주요 기능

### 🎯 게임 플로우

-   **랜딩 페이지**: 비로그인 사용자를 위한 소개 페이지
-   **로비**: 캐릭터 선택, 상점, 보관함, 친구, 업적 등 메인 기능
-   **게임 참가**: 매칭 vs 사용자 설정 선택
-   **대기방**: 게임 시작 전 플레이어 대기
-   **게임 플레이**: 실시간 미니게임 진행
-   **결과 화면**: 라운드별 결과 및 최종 순위

### 🎨 UI/UX 특징

-   **반응형 디자인**: 모바일부터 데스크탑까지 완벽 대응
-   **부드러운 애니메이션**: Framer Motion을 활용한 자연스러운 화면 전환
-   **캐릭터 시스템**: 곰, 돌고래 등 다양한 캐릭터 선택 가능
-   **테마 지원**: 라이트/다크 모드 지원

### 🎮 게임 기능

-   **실시간 멀티플레이어**: OpenVidu를 활용한 화상 통화
-   **다양한 미니게임**: 표정 맞추기, 색깔 찾기, 스피드 러너 등
-   **점수 시스템**: 라운드별 점수 및 최종 순위
-   **업적 시스템**: 다양한 업적 달성 및 보상

### 👥 소셜 기능

-   **친구 시스템**: 친구 추가, 관리, 상태 확인
-   **상점**: 캐릭터 스킨, 인장 등 아이템 구매
-   **보관함**: 획득한 아이템 관리
-   **업적**: 게임 플레이 기록 및 달성도

## 기술 스택

### Frontend

| 구분             | 기술                                     |
| ---------------- | ---------------------------------------- |
| **Core**         | `React 18`, `TypeScript`, `Vite`         |
| **Styling**      | `Tailwind CSS`, `shadcn/ui`              |
| **Animation**    | `Framer Motion`                          |
| **State**        | `Zustand`                                |
| **Real-time**    | `LiveKit` (WebRTC), `StompJS`, `Socket.io` |
| **3D**           | `Three.js`, `@react-three/fiber`, `@react-three/drei` |
| **UI**           | `Radix UI`, `Lucide React`               |

### Backend (MSA)

| 구분 | 기술 |
| --- | --- |
| **Core** | `Java 17`, `Spring Boot 3`, `Spring Cloud` |
| **Architecture**| `API Gateway`, `Service Discovery` (Eureka) |
| **Database**| `Spring Data JPA`, `QueryDSL`, `PostgreSQL`, `Redis`|
| **Messaging**| `Kafka`, `RabbitMQ` (Spring Bus) |
| **Auth** | `Spring Security`, `OAuth2`, `JWT` |
| **Real-time** | `WebSocket` (Stomp) |
| **DevOps** | `Docker`, `Jenkins`, `Zipkin`, `Prometheus`, `Grafana` |

### AI (gRPC Server)

| 구분 | 기술 |
| --- | --- |
| **Framework** | `Python`, `FastAPI`, `gRPC` |
| **AI Models** | `YOLO` (Object Detection), `DeepFace` (Emotion), `MediaPipe` (Face Mesh) |
| **Libraries** | `Ultralytics`, `TensorFlow`, `PyTorch`, `OpenCV` |

## 프로젝트 구조

이 프로젝트는 **FSD(Feature-Sliced Design)** 아키텍처를 기반으로 구성되었습니다.

```
src/
├── app/              # 앱 전반의 설정, 전역 상태, 라우팅 등
├── pages/            # 각 페이지를 구성하는 컴포넌트
├── widgets/          # 여러 페이지 또는 피처에서 재사용되는 독립적인 UI 블록
├── features/         # 특정 사용자 시나리오를 구현하는 기능 단위
├── entities/         # 핵심 비즈니스 엔티티와 관련된 컴포넌트 및 로직
├── hooks/            # 여러 컴포넌트에서 재사용되는 커스텀 훅
└── shared/           # 모든 레이어에서 재사용 가능한 공통 코드
```

### 레이어 설명

-   **app**: 애플리케이션의 가장 상위 레이어로, 전역 설정(라우터, 스토어, 스타일)과 진입점(`main.tsx`, `App.tsx`)을 포함합니다.
-   **pages**: 사용자가 방문하는 각 페이지를 나타냅니다. `widgets`, `features`, `entities` 레이어의 컴포넌트를 조합하여 페이지를 구성합니다.
-   **widgets**: 여러 페이지나 기능에 걸쳐 사용되는 독립적인 UI 블록입니다. (예: `VideoCall`, `ChatWindow`)
-   **features**: 사용자에게 가치를 제공하는 특정 기능 단위입니다. (예: `CharacterSelector`)
-   **entities**: 핵심 비즈니스 모델을 나타냅니다. (예: `character`, `achievement`)
-   **hooks**: 여러 컴포넌트에서 재사용되는 커스텀 훅을 관리합니다. FSD에서는 보통 `shared` 레이어에 포함되지만, 이 프로젝트에서는 별도 디렉토리로 분리하여 관리합니다.
-   **shared**: 프로젝트 전반에서 재사용되는 범용 코드(UI Kit, API 클라이언트, 헬퍼 함수 등)를 포함합니다.

## 주요 컴포넌트

### 인증 관련

-   `LoginForm.tsx`: 로그인 폼
-   `RegisterForm.tsx`: 회원가입 폼
-   `ForgotPasswordForm.tsx`: 비밀번호 찾기
-   `SocialLogin.tsx`: 소셜 로그인

### 게임 플레이

-   `GameJoinScreen.tsx`: 매칭/사용자 설정 선택
-   `GameWaitingRoom.tsx`: 플레이어 대기방
-   `GameScreen.tsx`: 실시간 게임 진행
-   `RoundResultScreen.tsx`: 라운드 결과
-   `FinalResultScreen.tsx`: 최종 결과 및 순위

### 캐릭터 시스템

-   `CharacterSelector.tsx`: 캐릭터 선택 인터페이스
-   `CharacterViewer.tsx`: 캐릭터 3D 뷰어 (현재 이모지로 대체)

### 소셜 기능

-   `FriendsScreen.tsx`: 친구 관리
-   `ShopScreen.tsx`: 아이템 구매
-   `InventoryScreen.tsx`: 보관함
-   `AchievementsScreen.tsx`: 업적 시스템

### 설정

-   `SettingsScreen.tsx`: 앱 설정
-   `ThemeContext.tsx`: 테마 관리

## 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

### 빌드

```bash
npm run build
```

## 디자인 시스템

### 색상 팔레트

-   **Primary**: `#6dc4e8` (파란색)
-   **Success**: `#6bcf7f` (초록색)
-   **Warning**: `#ffd93d` (노란색)
-   **Error**: `#ff6b6b` (빨간색)

### 폰트

-   **한글**: `BM_HANNA_TTF:Regular` (한나체)
-   **영문**: 시스템 폰트

### 반응형 브레이크포인트

-   **Mobile**: `< 768px`
-   **Tablet**: `768px - 1024px`
-   **Desktop**: `> 1024px`

## 개발 환경

### 필수 요구사항

-   Node.js 18+
-   npm 또는 yarn

### 권장 개발 도구

-   VS Code
-   TypeScript 확장
-   Tailwind CSS IntelliSense

## 개발 노트

### 현재 구현 상태

-   ✅ 기본 UI/UX 완성
-   ✅ 반응형 디자인 적용
-   ✅ 게임 플로우 구현
-   ✅ 캐릭터 시스템 (이모지 버전)
-   🔄 3D 모델 통합 (진행 중)
-   🔄 실시간 멀티플레이어 (준비 중)

### 향후 계획

-   3D 캐릭터 모델 실제 적용
-   실시간 멀티플레이어 완성
-   추가 미니게임 구현
-   성능 최적화

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

**YOLO Bring It!** - 함께 즐기는 소셜 게이밍 플랫폼
