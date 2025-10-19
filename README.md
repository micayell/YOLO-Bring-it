# YOLO-Bring-it

YOLO-Bring-it은 실시간 객체 탐지(YOLO) 기술과 웹캠을 활용하여 사용자가 직접 몸으로 참여하는 인터랙티브 웹 게임 플랫폼입니다. MSA(Microservice Architecture) 기반의 확장성 높은 백엔드와 React를 사용한 동적인 프론트엔드로 구성되어 있습니다.

## 목차

1.  [프로젝트 소개](#프로젝트-소개)
2.  [주요 기능](#주요-기능)
3.  [프로젝트 아키텍처](#프로젝트-아키텍처)
4.  [기술 스택](#기술-스택)
5.  [프로젝트 구조](#프로젝트-구조)
6.  [설치 및 실행 방법](#설치-및-실행-방법)
7.  [개발자 정보](#개발자-정보)
8.  [라이선스](#라이선스)

## 프로젝트 소개

본 프로젝트는 사용자가 웹캠 앞에서 특정 물건을 찾거나, 몸을 움직여 미션을 수행하는 등 새로운 방식의 인터랙티브 경험을 제공하는 웹 기반 게임 플랫폼입니다. 최신 AI 기술과 웹 기술을 접목하여 사용자가 능동적으로 참여하고 즐길 수 있는 콘텐츠를 만드는 것을 목표로 합니다.

## 주요 기능

-   **실시간 멀티플레이어 게임**: 웹캠을 통해 사용자의 움직임을 인식하여 진행하는 다양한 미니게임
-   **AI 기반 객체 탐지**: YOLOv8 모델을 활용하여 게임 미션을 위한 특정 객체 탐지
-   **사용자 인증**: 로컬 회원가입 및 소셜 로그인(Google, Kakao) 지원 (OAuth2, JWT)
-   **소셜 기능**: 친구 추가, 실시간 채팅, 게임 초대 기능
-   **화상 채팅**: `LiveKit`을 활용한 게임 중 플레이어 간의 실시간 음성/화상 통신
-   **상점 및 인벤토리**: 게임 내 재화를 통해 아이템을 구매하고 관리하는 시스템
-   **업적 시스템**: 특정 미션 달성 시 배지를 부여하는 업적 및 보상 기능

## 프로젝트 아키텍처

본 프로젝트는 확장성과 유지보수성을 고려하여 마이크로서비스 아키텍처(MSA)를 채택하고 있습니다.

-   **프론트엔드 (Frontend)**: React, TypeScript, Vite 기반의 SPA로, 사용자 인터페이스와 게임 로직을 담당합니다. `Three.js`를 이용해 3D 캐릭터를 렌더링하고, `LiveKit`과 `WebSocket`으로 실시간 통신을 구현합니다.

-   **백엔드 (Backend)**: Java, Spring Boot 기반의 마이크로서비스로 구성됩니다. `API Gateway`를 통해 요청을 처리하고, `Service Discovery`로 서비스 간 통신을 관리하며, `Config Server`로 설정을 중앙 관리합니다.

-   **AI 서비스 (AI Service)**: Python(FastAPI)으로 구현된 AI 서버가 `gRPC` 통신을 통해 실시간 객체 탐지 및 사용자 움직임 분석 기능을 백엔드에 제공합니다.

-   **실시간 통신**: `WebSocket(STOMP)`을 통해 채팅 및 게임 상태를 동기화하고, `Kafka`를 메시지 큐로 사용하여 서비스 간 비동기 데이터를 안정적으로 처리합니다.

## 기술 스택

### **Frontend**

-   **Core**: React, TypeScript, Vite
-   **State Management**: Zustand
-   **Styling**: Tailwind CSS
-   **3D Graphics**: Three.js, @react-three/fiber
-   **Real-time Communication**: LiveKit, Socket.IO, StompJS

### **Backend**

-   **Core**: Java 17, Spring Boot 3, Gradle
-   **Database**: PostgreSQL, Redis, Spring Data JPA, QueryDSL
-   **Architecture**: Microservices, Spring Cloud (Eureka, API Gateway, Config)
-   **Messaging**: Kafka, RabbitMQ
-   **Authentication**: Spring Security, OAuth2, JWT
-   **Real-time Communication**: WebSocket, gRPC

### **AI (Python)**

-   **Framework**: FastAPI, gRPC
-   **ML/DL**: PyTorch, TensorFlow, Ultralytics (YOLOv8)
-   **Computer Vision**: OpenCV, MediaPipe, DeepFace

### **DevOps & Infrastructure**

-   **Containerization**: Docker, Docker Compose
-   **Proxy**: Nginx
-   **Monitoring**: Spring Boot Actuator, Micrometer, Zipkin

## 프로젝트 구조

```text
.
├── backend-msa/        # 백엔드 마이크로서비스 프로젝트
│   ├── apigateway-service/
│   ├── chat-service/
│   ├── config-service/
│   ├── game-service/
│   ├── gRPC-Python/      # Python AI gRPC 서비스
│   ├── service-discovery/
│   └── user-service/
└── frontend/           # 프론트엔드 React 프로젝트
    ├── public/         # 정적 에셋 (이미지, 3D 모델 등)
    └── src/            # 소스 코드
        ├── app/        # 애플리케이션 설정, 전역 상태(stores)
        ├── components/ # 재사용 가능한 UI 컴포넌트
        ├── pages/      # 라우트별 페이지 컴포넌트
        ├── shared/     # 공용 훅, 서비스, 타입 등
        └── widgets/    # 여러 컴포...


## 설치 및 실행 방법

### 사전 요구사항

-   Java 17+
-   Node.js 18+
-   Python 3.9+
-   Docker, Docker Compose

### 1. 백엔드 실행

```bash
# 1. backend-msa 디렉토리로 이동
cd backend-msa

# 2. 인프라 컨테이너 실행 (Kafka, Zookeeper)
docker-compose -f docker-compose-single-broker.yml up -d

# 3. 각 Spring Boot 마이크로서비스 실행
# (각 서비스 디렉토리에서 ./gradlew bootRun 또는 IDE를 통해 실행)
```

### 2. 프론트엔드 실행

```bash
# 1. frontend 디렉토리로 이동
cd frontend

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev
```

### 3. AI 서비스 실행

```bash
# 1. AI 서비스 디렉토리로 이동
cd backend-msa/gRPC-Python/AI-gRPC

# 2. 의존성 설치
pip install -r requirements_ai.txt
pip install -r requirements_grpc.txt

# 3. FastAPI 서버 실행 (예시)
uvicorn main:app --reload
```

## 개발자 정보

| 이름 | 역할 |
| :--: | :--: |
| 임채진 | 팀장/백엔드 |
| 김아현 | 백엔드 |
| 이유희 | 백엔드 |
| 김창주 | 프론트엔드 |
| 문승현 | 프론트엔드 |
| 윤경호 | AI |


## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 `LICENSE` 파일을 참고하세요.