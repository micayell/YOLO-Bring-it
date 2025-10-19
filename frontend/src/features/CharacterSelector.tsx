import { useState } from 'react';
import { motion } from 'framer-motion';
import { CharacterViewer } from '@/entities/character/CharacterViewer';

interface Character {
  id: string;
  name: string;
  modelUrl: string;
  description: string;
}

const characters: Character[] = [
  {
    id: 'bear_shadow',
    name: '곰 (그림자)',
    modelUrl: '/models/bear_shadow/Pbr/base_basic_pbr.glb',
    description: '그림자가 있는 귀여운 곰 캐릭터'
  },
  {
    id: 'bear_male',
    name: '곰남',
    modelUrl: '/models/bear_male/Pbr/base_basic_pbr.glb',
    description: '남성 곰 캐릭터'
  },
  {
    id: 'bear_female',
    name: '곰여',
    modelUrl: '/models/bear_female/Pbr/base_basic_pbr.glb',
    description: '여성 곰 캐릭터'
  },
  {
    id: 'dolphin',
    name: '돌고래',
    modelUrl: '/models/dolphin/Pbr/base_basic_pbr.glb',
    description: '귀여운 돌고래 캐릭터'
  }
];

interface CharacterSelectorProps {
  onCharacterSelect?: (character: Character) => void;
  selectedCharacterId?: string;
}

export function CharacterSelector({ onCharacterSelect, selectedCharacterId }: CharacterSelectorProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    characters.find(c => c.id === selectedCharacterId) || characters[0]
  );

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
    onCharacterSelect?.(character);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2">캐릭터 선택</h3>
        <p className="text-muted-foreground">게임에서 사용할 캐릭터를 선택하세요</p>
      </div>

      {/* 캐릭터 목록 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {characters.map((character) => (
          <motion.div
            key={character.id}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedCharacter?.id === character.id
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => handleCharacterSelect(character)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="h-32 mb-3">
              <CharacterViewer 
                modelUrl={character.modelUrl} 
                height="100%"
              />
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-sm">{character.name}</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {character.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 선택된 캐릭터 상세 보기 */}
      {selectedCharacter && (
        <motion.div
          className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h4 className="text-lg font-bold mb-4 text-center">
            선택된 캐릭터: {selectedCharacter.name}
          </h4>
          <div className="h-64">
            <CharacterViewer 
              modelUrl={selectedCharacter.modelUrl} 
              height="100%"
            />
          </div>
          <p className="text-center text-muted-foreground mt-4">
            {selectedCharacter.description}
          </p>
        </motion.div>
      )}
    </div>
  );
} 