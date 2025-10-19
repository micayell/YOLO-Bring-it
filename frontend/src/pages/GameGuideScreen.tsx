import { motion } from "framer-motion";
import { ArrowLeft, Users, Trophy, Gamepad2, Clock, Star, Zap } from "lucide-react";
import { useState, useEffect } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';

interface GameMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  timeLimit: string;
  difficulty: string;
  videoUrl: string;
}

interface GameGuideScreenProps {
  onBack: () => void;
}

export function GameGuideScreen({ onBack }: GameGuideScreenProps) {
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);
  const [keySequence, setKeySequence] = useState<string[]>([]);
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  const correctSequence = ['ArrowUp', 'ArrowDown', 'ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowRight', 'ArrowLeft'];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const newSequence = [...keySequence, event.key].slice(-7); // Keep only the last 7 keys
      setKeySequence(newSequence);

      if (newSequence.join('') === correctSequence.join('')) {
        setShowEasterEgg(true);
        setTimeout(() => setShowEasterEgg(false), 5000); // Hide after 5 seconds
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keySequence]);

  const gameModes: GameMode[] = [
    {
      id: "Color_Killer",
      name: "색깔 맞추기 - Color Killer",
      description: "제시된 색깔과 가장 유사한 색을 찾아보세요!",
      icon: "🎨",
      timeLimit: "30초",
      difficulty: "쉬움",
      videoUrl: "fT-xXCtYWCA"
    },
    {
      id: "Face_It",
      name: "표정 따라하기 - Face It",
      description: "제시 된 단어를 비슷하게 감정을 표현해보세요!",
      icon: "😊",
      timeLimit: "30초",
      difficulty: "쉬움",
      videoUrl: "1KxS4R0YDvA"
    },
    {
      id: "Bring_It",
      name: "물건 가져오기 - Bring It",
      description: "주어진 물건을 빠르게 찾아서 가져오세요!",
      icon: "📦",
      timeLimit: "30초",
      difficulty: "보통",
      videoUrl: "B7hRZ3oNXCc"
    },
    {
      id: "Draw_It",
      name: "그림 그리기 - Draw It",
      description: "제시 된 단어를 최대한 비슷하게 그려보세요!",
      icon: "🖌️",
      timeLimit: "30초",
      difficulty: "보통",
      videoUrl: "g8PFXJmw9xw"
    },
    {
      id: "Sound_It",
      name: "소리 따라하기 - Sound It",
      description: "명대사 또는 동물의 소리를 최대한 비슷하게 따라해보세요!",
      icon: "🎬",
      timeLimit: "30초",
      difficulty: "어려움",
      videoUrl: "c57h2Uh9Aho"
    }
  ];

  const gameFeatures = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "실시간 멀티플레이",
      description: "친구들과 함께 실시간으로 게임을 즐겨보세요"
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "업적 시스템",
      description: "게임을 통해 다양한 업적을 달성하고 보상을 받으세요"
    },
    {
      icon: <Gamepad2 className="w-6 h-6" />,
      title: "다양한 게임 모드",
      description: "색깔 맞추기, 물건 가져오기 등 다양한 미니게임을 즐기세요"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "시간 제한",
      description: "각 게임마다 다른 시간 제한으로 긴장감을 느껴보세요"
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "경험치 & 코인",
      description: "게임에서 승리하면 경험치와 코인을 획득할 수 있습니다"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "실시간 통신",
      description: "웹캠과 마이크를 통해 친구들과 실시간 소통하세요"
    }
  ];

  const onPlayerReady: YouTubeProps['onReady'] = () => {
    // 비디오 준비 완료 시 추가 설정 가능
  };

  const opts: YouTubeProps['opts'] = {
    height: '200',
    width: '300',
    playerVars: {
      autoplay: 1,
      mute: 0,
      controls: 0,
      modestbranding: 1,
    },
  };

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 p-6 overflow-y-auto relative">
      {/* Easter Egg Modal */}
      {showEasterEgg && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed inset-0 flex items-center justify-center z-50"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-yellow-200 text-center">
            <h2 className="text-3xl font-bold text-yellow-600 mb-4">🎉 이스터 에그 발견! 🎉</h2>
            <p className="text-gray-700 mb-4">축하합니다! 비밀 키보드 코드를 입력했어요!</p>
            <div className="flex justify-center gap-2">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-yellow-400 rounded-full"
                  animate={{
                    y: [0, -20, 0],
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <span className="text-4xl">🎮</span>
          게임 가이드
        </h1>
        <motion.button
          onClick={onBack}
          className="p-3 rounded-xl bg-white/80 hover:bg-white shadow-lg border border-gray-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </motion.button>
      </div>

      <div className="grid gap-8">
        {/* 게임 소개 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">🌟</span>
            게임 소개
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            YOLO Bring It은 친구들과 함께 즐기는 실시간 멀티플레이어 미니게임 플랫폼입니다. 
            웹캠과 마이크를 통해 실시간으로 소통하면서 다양한 게임을 즐기고, 
            승리를 통해 경험치와 코인을 획득하여 캐릭터를 성장시킬 수 있습니다.
          </p>
        </motion.section>

        {/* 게임 특징 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-3xl">✨</span>
            게임 특징
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gameFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-gray-800">{feature.title}</h3>
                </div>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 게임 모드 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 rounded-2xl p-8 shadow-lg border border-gray-200 relative z-30"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-3xl">🎯</span>
            게임 모드
          </h2>
          <div className="grid gap-6">
            {gameModes.map((mode, index) => (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 relative"
                onMouseEnter={() => setHoveredMode(mode.id)}
                onMouseLeave={() => setHoveredMode(null)}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{mode.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{mode.name}</h3>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                          ⏱️ {mode.timeLimit}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          mode.difficulty === '쉬움' ? 'bg-green-100 text-green-600' :
                          mode.difficulty === '보통' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {mode.difficulty}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600">{mode.description}</p>
                  </div>
                </div>
                {hoveredMode === mode.id && (
                  <div
                    className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50 bg-white rounded-lg shadow-lg border border-gray-200"
                  >
                    <YouTube
                      videoId={mode.videoUrl}
                      opts={opts}
                      onReady={onPlayerReady}
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 게임 규칙 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 rounded-2xl p-8 shadow-lg border border-gray-200 relative z-10"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-3xl">📋</span>
            게임 규칙
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-600">게임 시작 전 웹캠과 마이크 권한을 허용해주세요.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-600">각 게임마다 정해진 시간 내에 목표를 달성해야 합니다.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-600">게임에서 승리하면 경험치와 코인을 획득합니다.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-600">경험치를 쌓아 레벨업하고, 코인으로 상점에서 아이템을 구매할 수 있습니다.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-600">친구들과 함께 플레이하여 더 많은 재미를 느껴보세요!</p>
            </div>
          </div>
        </motion.section>

        {/* 팁 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 shadow-lg border border-yellow-200"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">💡</span>
            게임 팁
          </h2>
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <span className="text-yellow-600 font-bold">•</span>
              <p className="text-gray-700">웹캠과 마이크를 미리 테스트해보세요.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-yellow-600 font-bold">•</span>
              <p className="text-gray-700">게임 규칙을 미리 숙지하면 더 좋은 성적을 낼 수 있습니다.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-yellow-600 font-bold">•</span>
              <p className="text-gray-700">친구들과 팀워크를 발휘하여 승리 확률을 높여보세요.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-yellow-600 font-bold">•</span>
              <p className="text-gray-700">정기적으로 상점을 확인하여 새로운 아이템을 구매하세요.</p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}