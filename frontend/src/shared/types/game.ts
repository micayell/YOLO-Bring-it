export type Screen = "landing" | "login" | "register" | "forgot-password" | "lobby" | "game-join" | "waiting-room" | "game" | "round-result" | "final-result" | "user-settings";

// 게임 타입 정의 (AI 게임 모드들은 제거됨 - 각 게임에 통합됨)
export type GameType = 
  | "bring_object" 
  | "color_similar" 
  | "expression" 
  | "forbidden_word" 
  | "drawing" 
  | "timing_click" 
  | "famous_line" 
  | "quick_press" 
  | "blink" 
  | "headbanging";

// 게임별 특별한 UI 설정 타입
export interface GameSpecialUI {
  // 기존 UI 요소들
  showExpressionTarget?: boolean;
  showMirrorMode?: boolean;
  showEmojiGuide?: boolean;
  showBlinkCounter?: boolean;
  showEyeTracker?: boolean;
  showStaminaBar?: boolean;
  showColorTarget?: boolean;
  showColorPicker?: boolean;
  showFoundItems?: boolean;
  showItemTarget?: boolean;
  showTimer?: boolean;
  showSpeedMeter?: boolean;
  showScriptDisplay?: boolean;
  showAudioWaveform?: boolean;
  showVoiceRecorder?: boolean;
  
  // 새로운 UI 요소들
  showForbiddenWord?: boolean;
  showWordCounter?: boolean;
  showDrawingTarget?: boolean;
  showCanvas?: boolean;
  showScreenTimer?: boolean;
  showMemoryTest?: boolean;
  showCountdown?: boolean;
  showButtonTarget?: boolean;
  showReactionTimer?: boolean;
  showScore?: boolean;
  showMusicBeat?: boolean;
  showRhythmMeter?: boolean;
  showDanceGuide?: boolean;
}

// 게임 타입 배열
export const GAME_TYPES: GameType[] = [
  "bring_object",
  "color_similar",
  "expression",
  "forbidden_word",
  "drawing",
  "timing_click",
  "famous_line",
  "quick_press",
  "blink",
  "headbanging",
];

// 게임별 퍼포먼스 설정
export const PERFORMANCE_CONFIGS: Record<GameType, any> = {
  bring_object: { /* ... */ },
  color_similar: { /* ... */ },
  expression: { /* ... */ },
  forbidden_word: { /* ... */ },
  drawing: { /* ... */ },
  timing_click: { /* ... */ },
  famous_line: { /* ... */ },
  quick_press: { /* ... */ },
  blink: { /* ... */ },
  headbanging: { /* ... */ },
};

// 기본 게임 설정
export const GAME_CONFIG = {
  ROUND_SCORE_MULTIPLIER: 10,
  // 기타 필요한 설정 추가
};

// 게임별 상세 설정 타입
export interface GameConfig {
  title: string;
  description: string;
  instruction: string;
  timeLimit: number;
  timeLimitDisplay: string;
  icon: string;
  color: string;
  specialUI: GameSpecialUI;
  rules: string[];
}

export const GAME_DETAILED_CONFIG: Record<GameType, GameConfig> = {
  bring_object: {
    title: "물건 가져오기",
    description: "화면에 제시된 물건을 찾아서 카메라에 보여주세요!",
    instruction: "제시된 물건을 비춰주세요",
    timeLimit: 30,
    timeLimitDisplay: "30초",
    icon: "📦",
    color: "#6dc4e8",
    specialUI: { showItemTarget: true },
    rules: ["주변에서 제시된 물건을 찾으세요.", "카메라에 물건이 잘 보이도록 비춰주세요.", "빠르게 인식될수록 높은 점수를 얻습니다."]
  },
  color_similar: {
    title: "비슷한 색 가져오기",
    description: "제시된 색상과 가장 비슷한 색의 물건을 카메라에 비춰주세요!",
    instruction: "비슷한 색상의 물건을 비춰주세요",
    timeLimit: 30,
    timeLimitDisplay: "30초",
    icon: "🎨",
    color: "#ff6b6b",
    specialUI: { showColorTarget: true },
    rules: ["제시된 색상과 유사한 색의 물건을 찾으세요.", "카메라에 물건을 비춰 색상을 인식시키세요.", "정확도가 높을수록 높은 점수를 얻습니다."]
  },
  expression: {
    title: "표정 따라하기",
    description: "화면에 나오는 표정을 카메라를 보고 따라해보세요!",
    instruction: "화면의 표정을 똑같이 따라해보세요",
    timeLimit: 20,
    timeLimitDisplay: "20초",
    icon: "😄",
    color: "#ffd93d",
    specialUI: { showExpressionTarget: true },
    rules: ["제시된 감정/표정을 확인하세요.", "카메라를 정면으로 바라보고 표정을 지으세요.", "정확하게 표현할수록 높은 점수를 얻습니다."]
  },
  forbidden_word: {
    title: "금지어 게임",
    description: "금지된 단어를 말하지 않고 대화를 이어가세요!",
    instruction: "금지어를 말하지 마세요",
    timeLimit: 60,
    timeLimitDisplay: "60초",
    icon: "🚫",
    color: "#e84118",
    specialUI: { showForbiddenWord: true },
    rules: ["자신에게 배정된 금지어를 확인하세요.", "상대방이 금지어를 말하도록 유도하세요.", "금지어를 말하면 감점됩니다."]
  },
  drawing: {
    title: "그림 그리기",
    description: "제시어를 보고 멋지게 그림을 그려보세요!",
    instruction: "주제에 맞는 그림을 그려주세요",
    timeLimit: 45,
    timeLimitDisplay: "45초",
    icon: "✏️",
    color: "#4cd137",
    specialUI: { showCanvas: true },
    rules: ["제시된 단어를 확인하세요.", "캔버스에 그림을 정성껏 그리세요.", "AI가 제시어와 일치도를 판별합니다."]
  },
  timing_click: {
    title: "타이밍 맞추기",
    description: "정확한 타이밍에 맞춰 버튼을 누르세요!",
    instruction: "정확한 순간에 클릭하세요",
    timeLimit: 15,
    timeLimitDisplay: "15초",
    icon: "⏱️",
    color: "#9c88ff",
    specialUI: { showScreenTimer: true },
    rules: ["목표 타이밍을 주시하세요.", "정확한 순간에 클릭 버튼을 누르세요.", "오차가 적을수록 높은 점수를 얻습니다."]
  },
  famous_line: {
    title: "명대사 따라하기",
    description: "유명한 명대사를 음성과 감정을 담아 외쳐보세요!",
    instruction: "명대사를 따라 말하세요",
    timeLimit: 30,
    timeLimitDisplay: "30초",
    icon: "🎬",
    color: "#fbc531",
    specialUI: { showScriptDisplay: true },
    rules: ["화면에 나오는 대사를 읽으세요.", "마이크에 대고 정확한 발음으로 외치세요.", "유사도에 따라 점수가 부여됩니다."]
  },
  quick_press: {
    title: "반응속도 테스트",
    description: "신호가 바뀌는 순간 가장 빠르게 클릭하세요!",
    instruction: "신호가 바뀌면 즉시 클릭하세요",
    timeLimit: 10,
    timeLimitDisplay: "10초",
    icon: "⚡",
    color: "#00a8ff",
    specialUI: { showReactionTimer: true },
    rules: ["화면의 신호 변화를 집중해서 기다리세요.", "신호가 바뀌는 즉시 클릭하세요.", "빠른 반응속도일수록 높은 점수를 얻습니다."]
  },
  blink: {
    title: "눈싸움 배틀",
    description: "카메라를 바라보고 눈을 깜빡이지 마세요!",
    instruction: "눈을 감지 말고 버티세요",
    timeLimit: 30,
    timeLimitDisplay: "30초",
    icon: "👀",
    color: "#487eb0",
    specialUI: { showEyeTracker: true },
    rules: ["카메라를 정면으로 바라보세요.", "눈을 깜빡이지 않고 최대한 오래 버티세요.", "눈을 깜빡이면 탈락합니다."]
  },
  headbanging: {
    title: "헤드뱅잉 리듬",
    description: "리듬에 맞춰 신나게 머리를 흔들어보세요!",
    instruction: "리듬에 맞춰 머리를 움직이세요",
    timeLimit: 30,
    timeLimitDisplay: "30초",
    icon: "🎸",
    color: "#8c7ae6",
    specialUI: { showRhythmMeter: true },
    rules: ["화면의 비트를 확인하세요.", "박자에 맞춰 머리를 위아래로 움직이세요.", "콤보를 달성할수록 점수가 높아집니다."]
  }
};

export interface GameData {
  currentRound: number;
  totalRounds: number;
  players: Player[];
  roundResults: RoundResult[];
  gameType: GameType;
  gameName: string; // gameTitle -> gameName 으로 변경
  gameDescription: string;
  roomId: number;
  gamePhase?: 'waiting' | 'playing' | 'finished';
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  totalScore: number;
  roundScores: number[];
  isCurrentUser?: boolean;
  isReady?: boolean;
}

export type FriendStatus = 'online' | 'offline' | 'in-game';

export interface Friend {
    id: string;
    name: string;
    status: FriendStatus;
}

export interface RoundResult {
  round: number;
  gameType: GameType;
  rankings: PlayerRanking[];
}

export interface PlayerRanking {
  playerId: string;
  rank: number;
  score: number;
  performance?: string;
  globalScore?: number;
}

export interface ChatMessage {
  id: number;
  user: string;
  message: string;
  timestamp: string;
  type: "system" | "user";
}
