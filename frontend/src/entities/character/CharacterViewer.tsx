import { Suspense, useMemo, memo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import useMeasure from "react-use-measure";
import { Model } from "./LobbyCharacterModel";

interface CharacterViewerProps {
  modelUrl: string;
  width?: string;
  height?: string;
  /** Model의 표준 세로 높이(Y). 모든 GLB가 이 높이로 보정됨 */
  targetHeight?: number;
  /** 카메라 프레이밍 여유 배율(1.0이면 딱 맞춤, 1.2면 20% 여유) */
  framePadding?: number;
}

function CharacterViewerImpl({
  modelUrl,
  width = "100%",
  height = "300px",
  targetHeight = 2.0,
  framePadding = 1.15,
}: CharacterViewerProps) {
  const [ref, rect] = useMeasure();

  // 세로 높이를 덮는 카메라 거리 계산
  const fov = 45;
  const cameraDist = useMemo(() => {
    const halfH = (targetHeight * framePadding) / 2;
    const rad = (fov * Math.PI) / 180;
    return halfH / Math.tan(rad / 2);
  }, [targetHeight, framePadding]);

  // 카메라 타깃 (배꼽쯤)
  const targetY = useMemo(() => targetHeight * 0.45, [targetHeight]);

  return (
    <div
      ref={ref}
      style={{ width, height }}
      className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200"
    >
      {rect.width > 0 && rect.height > 0 && (
        <Canvas
          // ✅ 불필요한 재그리기 방지 → 깜빡임 감소
          frameloop="demand"
          camera={{ fov, position: [0, targetY, cameraDist] }}
          dpr={[1, 2]}
          style={{ width: rect.width, height: rect.height }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[2, 3, 4]} intensity={0.9} />

          <Suspense fallback={<Html center>Loading…</Html>}>
            {/* 모델 내부에서 중심/스케일 표준화 */}
            <Model url={modelUrl} targetHeight={targetHeight} />
          </Suspense>

          <OrbitControls
            makeDefault
            enablePan={false}
            enableDamping
            dampingFactor={0.08}
            target={[0, targetY, 0]}
            minDistance={cameraDist * 0.6}
            maxDistance={cameraDist * 1.8}
            minPolarAngle={Math.PI * 0.12}
            maxPolarAngle={Math.PI * 0.92}
          />
        </Canvas>
      )}
    </div>
  );
}

// ✅ modelUrl 바뀔 때만 리렌더
export const CharacterViewer = memo(CharacterViewerImpl, (prev, next) => {
  return (
    prev.modelUrl === next.modelUrl &&
    prev.width === next.width &&
    prev.height === next.height &&
    prev.targetHeight === next.targetHeight &&
    prev.framePadding === next.framePadding
  );
});
