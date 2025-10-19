# 🖼️ 이미지 관리 시스템 가이드

## 📁 폴더 구조

```
public/
├── images/
│   ├── characters/
│   │   ├── default/
│   │   │   ├── idle.png
│   │   │   ├── walk.png
│   │   │   ├── run.png
│   │   │   ├── jump.png
│   │   │   └── attack.png
│   │   ├── player/
│   │   │   ├── idle.png
│   │   │   ├── walk.png
│   │   │   ├── run.png
│   │   │   ├── jump.png
│   │   │   └── attack.png
│   │   ├── npc/
│   │   │   ├── shopkeeper.png
│   │   │   ├── guide.png
│   │   │   └── opponent.png
│   │   └── animations/
│   │       ├── idle-sprite.png
│   │       └── walk-sprite.png
│   ├── ui/
│   │   ├── buttons/
│   │   │   ├── primary.png
│   │   │   ├── secondary.png
│   │   │   └── danger.png
│   │   ├── icons/
│   │   │   ├── play.png
│   │   │   ├── pause.png
│   │   │   ├── settings.png
│   │   │   ├── kakao.png
│   │   │   └── google.png
│   │   └── backgrounds/
│   │       ├── modal-bg.png
│   │       └── card-bg.png
│   ├── backgrounds/
│   │   ├── main/
│   │   │   ├── landing.jpg
│   │   │   ├── lobby.jpg
│   │   │   └── game.jpg
│   │   ├── game/
│   │   │   ├── stage1.jpg
│   │   │   ├── stage2.jpg
│   │   │   └── boss.jpg
│   │   └── particles/
│   │       ├── sparkle.png
│   │       └── fire.png
│   ├── items/
│   │   ├── weapons/
│   │   │   ├── sword.png
│   │   │   ├── bow.png
│   │   │   └── staff.png
│   │   ├── armor/
│   │   │   ├── helmet.png
│   │   │   └── chestplate.png
│   │   └── consumables/
│   │       ├── health-potion.png
│   │       └── mana-potion.png
│   ├── achievements/
│   │   ├── combat/
│   │   │   ├── first-kill.png
│   │   │   └── boss-slayer.png
│   │   └── exploration/
│   │       ├── first-map.png
│   │       └── all-maps.png
│   └── fallback/
│       ├── character.png
│       ├── weapon.png
│       └── background.jpg
```

## 🚀 사용 방법

### 1. 기본 이미지 사용

```tsx
import { OptimizedImage } from './components/ui/OptimizedImage';
import { CHARACTER_IMAGES } from './assets/images';

<OptimizedImage
  src={CHARACTER_IMAGES.default.idle}
  alt="기본 캐릭터"
  className="w-32 h-32"
  fallbackSrc="/images/fallback/character.png"
/>
```

### 2. 배경 이미지 사용

```tsx
import { BackgroundImage } from './components/ui/OptimizedImage';
import { BACKGROUND_IMAGES } from './assets/images';

<BackgroundImage
  src={BACKGROUND_IMAGES.main.landing}
  className="h-screen"
>
  <div className="absolute inset-0 flex items-center justify-center">
    <h1 className="text-white text-4xl">게임 제목</h1>
  </div>
</BackgroundImage>
```

### 3. 스프라이트 애니메이션

```tsx
import { SpriteImage } from './components/ui/OptimizedImage';

<SpriteImage
  src="/images/characters/animations/idle-sprite.png"
  frameWidth={64}
  frameHeight={64}
  frameIndex={0}
  totalFrames={4}
  className="w-16 h-16"
  animationSpeed={200}
  loop={true}
/>
```

### 4. 이미지 프리로딩

```tsx
import { preloadImages } from './utils/imageOptimizer';
import { CHARACTER_IMAGES, BACKGROUND_IMAGES } from './assets/images';

useEffect(() => {
  const importantImages = [
    CHARACTER_IMAGES.default.idle,
    BACKGROUND_IMAGES.main.landing,
  ];
  
  preloadImages(importantImages);
}, []);
```

## ⚡ 최적화 팁

### 1. 이미지 포맷 선택
- **WebP**: 최신 브라우저에서 최고 압축률
- **AVIF**: 더 나은 압축률이지만 브라우저 지원 제한
- **JPEG**: 사진에 적합
- **PNG**: 투명도가 필요한 경우

### 2. 반응형 이미지
```tsx
<OptimizedImage
  src={CHARACTER_IMAGES.player.idle}
  alt="플레이어"
  optimizationOptions={{
    quality: 0.8,
    format: 'webp',
    width: 800,
    height: 600,
  }}
/>
```

### 3. 지연 로딩
```tsx
<OptimizedImage
  src={ITEM_IMAGES.weapons.sword}
  alt="검"
  optimizationOptions={{
    lazy: true,
  }}
/>
```

## 📊 성능 모니터링

### 1. 이미지 로딩 시간 측정
```tsx
const handleImageLoad = () => {
  console.log('이미지 로딩 완료');
};

<OptimizedImage
  src={CHARACTER_IMAGES.default.idle}
  alt="캐릭터"
  onLoad={handleImageLoad}
/>
```

### 2. 에러 처리
```tsx
const handleImageError = () => {
  console.error('이미지 로딩 실패');
};

<OptimizedImage
  src={CHARACTER_IMAGES.default.idle}
  alt="캐릭터"
  fallbackSrc="/images/fallback/character.png"
  onError={handleImageError}
/>
```

## 🔧 고급 설정

### 1. 커스텀 최적화 옵션
```tsx
const customOptimization = {
  quality: 0.9,
  format: 'webp',
  width: 1200,
  height: 800,
  lazy: false,
};

<OptimizedImage
  src={BACKGROUND_IMAGES.main.landing}
  alt="배경"
  optimizationOptions={customOptimization}
/>
```

### 2. 배치 프리로딩
```tsx
import { preloadImages } from './utils/imageOptimizer';

// 게임 시작 시 모든 캐릭터 이미지 프리로딩
const characterImages = [
  CHARACTER_IMAGES.default.idle,
  CHARACTER_IMAGES.default.walk,
  CHARACTER_IMAGES.default.run,
  CHARACTER_IMAGES.player.idle,
  CHARACTER_IMAGES.player.walk,
];

preloadImages(characterImages);
```

## 📝 베스트 프랙티스

1. **적절한 이미지 크기**: 용도에 맞는 크기로 최적화
2. **압축 품질**: 0.7-0.9 사이에서 설정
3. **지연 로딩**: 화면에 보이지 않는 이미지는 lazy loading 사용
4. **폴백 이미지**: 항상 fallback 이미지 제공
5. **WebP 우선**: 지원하는 브라우저에서는 WebP 사용
6. **스프라이트 활용**: 작은 아이콘들은 스프라이트로 관리

## 🛠️ 도구 추천

### 이미지 최적화 도구
- **TinyPNG**: 온라인 이미지 압축
- **ImageOptim**: macOS용 이미지 최적화
- **Squoosh**: Google의 이미지 최적화 도구
- **Sharp**: Node.js 이미지 처리 라이브러리

### 스프라이트 생성 도구
- **TexturePacker**: 스프라이트 시트 생성
- **ShoeBox**: Adobe Air 기반 스프라이트 도구
- **Piskel**: 온라인 픽셀 아트 에디터 