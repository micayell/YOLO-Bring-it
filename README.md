# YOLO-Bring-it

`YOLO-Bring-it`은 실시간 객체 탐지(YOLO) 기술과 웹캠을 활용하여 사용자가 직접 몸으로 참여하는 인터랙티브 웹 게임 플랫폼입니다. MSA(Microservice Architecture) 기반의 확장성 높은 백엔드와 React를 사용한 동적인 프론트엔드로 구성되어 있습니다.

## 📄 목차

- [아키텍처](#-아키텍처)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [시작하기](#-시작하기)
  - [사전 요구사항](#사전-요구사항)
  - [백엔드 실행](#백엔드-실행)
  - [프론트엔드 실행](#프론트엔드-실행)
  - [AI 서비스 실행](#ai-서비스-실행)

## 🏛️ 아키텍처

본 프로젝트는 최신 클라우드 네이티브 기술을 활용하여 확장성과 유지보수성을 극대화한 MSA(Microservice Architecture)를 채택하고 있습니다.

-   **프론트엔드 (Frontend)**
    -   React, TypeScript, Vite를 기반으로 구축된 싱글 페이지 애플리케이션(SPA)입니다.
    -   사용자 인터페이스, 실시간 게임 플레이, 화상 채팅 등 클라이언트 측 로직을 담당합니다.
    -   3D 캐릭터 모델을 표시하기 위해 `Three.js`와 `@react-three/fiber`를 사용합니다.

-   **백엔드 (Backend)**
    -   Java, Spring Boot 기반의 마이크로서비스들로 구성되어 있습니다.
    -   각 서비스는 독립적으로 개발 및 배포가 가능하며, API Gateway를 통해 외부 통신을 관리합니다.
    -   **주요 서비스**: `User-Service`, `Game-Service`, `Chat-Service` 등
    -   **인프라**:
        -   `Service Discovery (Eureka)`: 서비스들의 동적 검색 및 관리를 지원합니다.
        -   `API Gateway`: 모든 클라이언트 요청에 대한 단일 진입점을 제공하고 라우팅, 인증 등을 처리합니다.
        -   `Config Server`: 서비스들의 외부 구성 정보를 중앙에서 관리합니다.

-   **AI 서비스 (AI Service)**
    -   Python(FastAPI)으로 구현되었으며, 백엔드와 gRPC 통신을 통해 AI 기능을 제공합니다.
    -   **주요 기능**:
        -   YOLOv8을 이용한 실시간 객체 탐지
        -   `DeepFace`, `MediaPipe`를 활용한 얼굴 인식 및 신체 움직임 분석

-   **실시간 통신 (Real-time Communication)**
    -   `WebSocket (STOMP)`: 채팅, 게임 상태 등 실시간 양방향 데이터 통신에 사용됩니다.
    -   `Kafka`: 서비스 간 비동기 메시지 처리를 위한 메시지 큐로 사용됩니다.
    -   `LiveKit`: 게임 중 사용자 간의 실시간 음성/화상 채팅 기능을 제공합니다.

## ✨ 주요 기능

-   **실시간 멀티플레이어 게임**: 웹캠을 통해 사용자의 움직임을 인식하여 진행하는 다양한 미니게임
-   **AI 기반 객체 탐지**: YOLOv8 모델을 활용하여 게임 미션을 위한 특정 객체 탐지
-   **사용자 인증**: 로컬 회원가입 및 소셜 로그인(Google, Kakao) 지원 (OAuth2, JWT)
-   **소셜 기능**: 친구 추가, 실시간 채팅, 게임 초대 기능
-   **화상 채팅**: `LiveKit`을 활용한 게임 중 플레이어 간의 실시간 음성/화상 통신
-   **상점 및 인벤토리**: 게임 내 재화를 통해 아이템을 구매하고 관리하는 시스템
-   **업적 시스템**: 특정 미션 달성 시 배지를 부여하는 업적 및 보상 기능

## 🛠️ 기술 스택

### **Frontend**

-   **Core**: React, TypeScript, Vite
-   **State Management**: Zustand
-   **Styling**: Tailwind CSS
-   **Routing**: React Router
-   **3D Graphics**: Three.js, @react-three/fiber
-   **Real-time Communication**: LiveKit, Socket.IO, StompJS
-   **UI Components**: Radix UI, Shadcn/ui

### **Backend**

-   **Core**: Java 17, Spring Boot 3, Gradle
-   **Database**: PostgreSQL, Redis, Spring Data JPA, QueryDSL
-   **Architecture**: Microservices, Spring Cloud (Eureka, API Gateway, Config Server)
-   **Messaging**: Kafka, RabbitMQ (for Spring Cloud Bus)
-   **Authentication**: Spring Security, OAuth2, JWT
-   **Real-time Communication**: WebSocket, gRPC
-   **Video**: LiveKit Server SDK
-   **Others**: OpenFeign, Resilience4j, AWS S3

### **AI (Python)**

-   **Framework**: FastAPI, gRPC
-   **ML/DL**: PyTorch, TensorFlow, Ultralytics (YOLOv8)
-   **Computer Vision**: OpenCV, MediaPipe, DeepFace
-   **Audio Processing**: Librosa, Torchaudio

### **DevOps & Infrastructure**

-   **Containerization**: Docker, Docker Compose
-   **Proxy**: Nginx
-   **Monitoring**: Spring Boot Actuator, Micrometer, Zipkin

## 📁 프로젝트 구조
.
├── backend-msa/ # 백엔드 마이크로서비스 프로젝트
│ ├── apigateway-service/
│ ├── chat-service/
│ ├── config-service/
│ ├── game-service/
│ ├── gRPC-Python/ # Python AI gRPC 서비스
│ ├── service-discovery/
│ └── user-service/
└── frontend/ # 프론트엔드 React 프로젝트

-   **`backend-msa/`**: Spring Boot 기반의 백엔드 마이크로서비스들이 위치합니다.
    -   **`gRPC-Python/`**: 실시간 객체 탐지 및 AI 분석을 담당하는 Python 서비스입니다.
-   **`frontend/`**: Vite 기반의 React 프로젝트로, 사용자에게 보여지는 UI/UX를 담당합니다.

## 🚀 시작하기

### 사전 요구사항

-   Java 17+
-   Node.js 18+
-   Python 3.9+
-   Docker, Docker Compose

### 백엔드 실행

1.  인프라 컨테이너를 실행합니다.
    ```bash
    cd backend-msa
    docker-compose -f docker-compose-single-broker.yml up -d
    ```
2.  각 Spring Boot 마이크로서비스를 실행합니다. (e.g., `user-service`, `game-service` 등)

### 프론트엔드 실행

1.  `frontend` 디렉토리로 이동하여 의존성을 설치합니다.
    ```bash
    cd frontend
    npm install
    ```
2.  개발 서버를 시작합니다.
    ```bash
    npm run dev
    ```

### AI 서비스 실행

1.  `gRPC-Python/AI-gRPC` 디렉토리로 이동하여 의존성을 설치합니다.
    ```bash
    cd backend-msa/gRPC-Python/AI-gRPC
    pip install -r requirements_ai.txt
    pip install -r requirements_grpc.txt
    ```
2.  FastAPI 서버를 실행합니다. (실행 스크립트는 프로젝트 내부 확인 필요)
    ```bash
    # 예시: uvicorn main:app --reload
    ```
