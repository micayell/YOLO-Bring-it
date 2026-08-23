# YOLO Bring it - 로컬 개발 환경 완벽 가이드 튜토리얼 🚀

이 문서는 프로젝트를 처음 받아 로컬(Windows) 환경에서 세팅하고 실행하는 **처음부터 끝까지의 과정을 A to Z로 매우 상세히 설명**합니다. 에러 없이 한 번에 구동하기 위해 아래 순서를 반드시 지켜서 진행해 주세요.

---

## 단계 1: 사전 준비 (Prerequisites)
프로젝트 실행 전에 개발 PC에 다음 프로그램들이 모두 설치되어 있고 켜져 있는지 확인합니다.
- **Docker Desktop**: 실행 중이어야 합니다. (작업 표시줄 우측 하단 고래 아이콘 확인)
- **Java 17 (JDK)**: 백엔드 스프링 부트 프로젝트 구동을 위해 필요합니다.
- **Node.js (18 이상 권장)**: 프론트엔드 React(Vite) 구동을 위해 필요합니다.
- **IntelliJ IDEA**: Java 및 Spring Boot 백엔드 코드를 실행할 에디터.
- **Git Bash, PowerShell 등 터미널 환경**

---

## 단계 2: 도커 인프라 설정 및 브로커 포트 맵핑 수정
데이터베이스(PostgreSQL), 캐시(Redis), 메시지 브로커(RabbitMQ)를 도커를 통해 하나로 띄웁니다.

### 2-1. docker-compose-single-broker.yml 파일 수정
채팅(STOMP)을 위한 RabbitMQ 플러그인과 포트(61613) 설정이 누락되어 있다면 통신이 불가능합니다.
경로: ackend-msa/docker-compose-single-broker.yml 파일을 열고 다음과 같이 수정합니다.

\\\yaml
  rabbitmq:
    image: rabbitmq:3-management-alpine
    container_name: yolo-rabbitmq
    ports:
      - "5672:5672"
      - "15672:15672"
      - "61613:61613" # ⬅️ STOMP 통신을 위한 필수 포트 추가
    command: sh -c "rabbitmq-plugins enable rabbitmq_stomp && rabbitmq-server" # ⬅️ STOMP 플러그인 자동 켜기
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest
    networks:
      - bringit-network
\\\

### 2-2. 도커 컴포즈 실행
터미널을 열고 다음 명령어를 순서대로 칩니다.
\\\ash
cd backend-msa
docker-compose -f docker-compose-single-broker.yml down  # (선택) 기존에 켜져 있었다면 완전히 끄기
docker-compose -f docker-compose-single-broker.yml up -d # 백그라운드 구동
\\\
> up -d 명령어를 쳤을 때 초록색으로 Started 혹은 Running이 뜨면 정상입니다.

---

## 단계 3: PostgreSQL 수동 데이터베이스 구축 (핵심 ⭐️)
스프링 부트는 각 마이크로서비스마다 독립적인 DB 공간을 요구합니다. 기본적으로 users DB만 만들어지므로, 치명적(FATAL)인 500 Internal Server Error를 방지하기 위해 컨테이너 내부로 접속해 나머지 DB를 뚫어주어야 합니다.

방금 띄운 도커가 돌아가고 있는 상태에서 터미널에 아래 명령어를 그대로 복사해서 한 줄씩 실행합니다.
\\\ash
# 1. 채팅 시스템이 쓸 공간 만들기
docker exec yolo-postgres psql -U postgres -c "CREATE DATABASE chats;"

# 2. 게임 시스템이 쓸 공간 만들기
docker exec yolo-postgres psql -U postgres -c "CREATE DATABASE games;"
\\\
> CREATE DATABASE라는 응답이 콘솔에 뜨면 완료된 것입니다. 이제 스프링이 켜지면서 알아서 이 텅 빈 공간에 테이블을 찍어냅니다!

---

## 단계 4: 백엔드 마이크로서비스(MSA) 구동 순서 (매우 중요 ⭐️)
MSA 프로젝트에서는 **반장 역할을 하는 서버(유레카)** 와 **문지기 역할을 하는 서버(게이트웨이)** 가 먼저 깨어나야 일반 서비스들이 정상적으로 작동합니다. 순서가 꼬일 경우 503 Service Unavailable 에러가 멈추지 않습니다.

IntelliJ IDEA를 열고 우측 상단 Run Configuration이나 Services 탭에서 **아래의 순서를 반드시 지켜서 켭니다.** 

1. **ConfigServiceApplication** (포트 8888)
   - 역할: Github나 로컬의 YML 설정 파일들을 읽어 다른 서버에게 제공합니다.
   - ➜ **가장 먼저 켜고** Started ConfigServiceApplication in ... seconds 로그가 뜰 때까지 기다립니다.
2. **ServiceDiscoveryApplication (Eureka)** (포트 8761)
   - 역할: 모든 서비스들을 명단에 적고 묶어주는 반장 서버.
   - ➜ 두 번째로 켜고 부팅이 완료될 때까지 기다립니다.
3. **ApigatewayServiceApplication** (포트 8080)
   - 역할: 프론트엔드가 보내는 요청(포트 8080)을 받아 담당 서비스로 토스해 줍니다.
   - ➜ 제일 중요한 문지기이므로 꼭 3번째로 켜줍니다.
4. **일반 비즈니스 서비스들** (순서 무관, 동시 실행 가능)
   - UserServiceApplication (초기 구동 시 users 테이블 자동 생성)
   - GameServiceApplication (초기 구동 시 games 테이블 자동 생성)
   - ChatServiceApplication (초기 구동 시 chats 테이블 자동 생성)

### 💡 유레카 구동 및 인프라 확인법!
- 웹 브라우저 주소창에 **http://localhost:8761/** 접속.
- **Instances currently registered with Eureka** 항목 아래에 USER-SERVICE, GAME-SERVICE, CHAT-SERVICE, APIGATEWAY-SERVICE가 떴는지 확인! (서비스를 막 켰다면 약 1~2분 정도 늦게 뜰 수 있습니다)

---

## 단계 5: 프론트엔드 어플리케이션 실행
백엔드가 유레카에 모두 정상적으로 등재되었다면, 터미널을 열고 웹 프론트엔드를 기동합니다.

\\\ash
cd frontend
# 1. 의존성 다운로드 (처음 클론 받은 직후 1번만)
npm install

# 2. 서버 실행
npm run dev
\\\
정상적으로 구동되면 http://localhost:5173/ (혹은 안내된 주소)를 컨트롤+클릭 하여 웹 브라우저에서 띄웁니다!

---

## 🛠️ 발생 가능한 에러 총정리 (Troubleshooting)

1. **프론트 화면 상단이나 콘솔에 503 Service Unavailable 에러가 무한으로 날아와요!**
   - 백엔드는 켰으나 서버끼리 아직 악수를 못한 상태(Eureka 지연)입니다.
   - 해결책: 바로 새로고침 하지 말고 http://localhost:8761/ 에 들어가서 USER-SERVICE 등이 등록될 때까지 기다렸다가 다시 시도하세요.
2. **특정 서비스(Chat, Game)가 켜지다가 중간에 빨간 글씨(FATAL: database "..." does not exist)를 뿜고 죽어버려요.**
   - 해결책: 단계 3에서 수동 생성 명령어(docker exec...)를 빼먹었거나, 도커 컨테이너가 볼륨 마운트 없이 재시작되어 DB가 초기화된 것입니다. 다시 단계 3의 명령어를 쳐주면 됩니다.
3. **콘솔창에 Connection refused: getsockopt: localhost/127.0.0.1:61613 에러가 계속 떠요.**
   - 백엔드가 RabbitMQ의 STOMP 플러그인을 찾지 못했습니다. 
   - 해결책: 단계 2-1의 docker-compose-single-broker.yml 파일 수정을 진행하고 다시 docker-compose up -d를 진행하세요.
4. **DB 테이블을 내 눈으로 직접 보고 싶어요 (IntelliJ 기능 활용)**
   - IntelliJ 우측 Database 탭 클릭 ➔ + 버튼 ➔ Data Source ➔ PostgreSQL 클릭.
   - Host: localhost, Port: 5432, User: postgres, Password: 1234, Database: users 입력
   - 맨 밑 Test Connection 클릭 후 OK 저장.
   - Schemas ➔ 숫자로 된 버튼(1 of 5 등) 눌러서 chats, games 모두 체크.
   - 각 스키마의 public ➔ 	ables 에 테이블들이 모두 생성되었는지 확인!
---

## 단계 6: AI-gRPC 서버(Python) 실행하기 (게임 진행 시 필수 ⭐️)
YOLO-Bring-it의 핵심인 게임 AI 로직을 담당하는 파이썬 서버가 켜져 있어야 game-service가 정상적으로 게임 데이터를 주고받을 수 있습니다.

1. 새로운 터미널을 열고 파이썬 프로젝트 폴더로 이동합니다.
   \\\ash
   cd backend-msa/gRPC-Python/AI-gRPC
   \\\
2. 파이썬 가상환경(선택)을 세팅하고 필수 라이브러리를 설치합니다.
   \\\ash
   pip install -r requirements_ai.txt
   pip install -r requirements_grpc.txt
   \\\
3. AI 서비스 메인 파일을 실행하여 gRPC 서버(포트 50051)를 기동합니다.
   \\\ash
   # 위치 확인 (ai_services 폴더의 service.py 실행)
   python ai_services/service.py
   \\\
   > Server started, listening on :50051 이라는 메시지가 뜨면 성공입니다! 이제 백엔드 게임 서비스와 프론트엔드가 AI 서버를 사용할 수 있습니다.