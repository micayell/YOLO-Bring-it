import { useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";

interface ModelProps {
  url: string;
  targetHeight?: number;
}

export function Model({ url, targetHeight = 2.0 }: ModelProps) {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (scene) {
      // 바운딩 박스를 계산하여 높이에 맞춰 스케일 및 위치 정규화
      const box = new THREE.Box3().setFromObject(scene);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);

      if (size.y > 0) {
        const scale = targetHeight / size.y;
        scene.scale.set(scale, scale, scale);
        // 중심을 바닥/중앙으로 맞춤
        scene.position.x = -center.x * scale;
        scene.position.y = -box.min.y * scale;
        scene.position.z = -center.z * scale;
      }
    }
  }, [scene, targetHeight]);

  return <primitive ref={modelRef} object={scene} />;
}
