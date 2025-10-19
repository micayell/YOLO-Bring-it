import { useEffect, useRef } from "react";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Group, Box3, Vector3 } from "three";

type ModelProps = {
  url: string;
  /** 모든 캐릭터의 '세로 높이(Y)'를 이 값으로 표준화 */
  targetHeight?: number; // world units
};

export function Model({ url, targetHeight = 2.0 }: ModelProps) {
  const gltf = useLoader(GLTFLoader, url);
  const groupRef = useRef<Group>(null!);

  useEffect(() => {
    const group = groupRef.current;
    if (!group || !gltf?.scene) return;

    // 기존 자식 제거 후 새 씬 추가
    group.clear();
    const scene = gltf.scene.clone(true);
    group.add(scene);

    // 바운딩 계산
    scene.updateMatrixWorld(true);
    const box = new Box3().setFromObject(scene);
    const center = new Vector3();
    const size = new Vector3();
    box.getCenter(center);
    box.getSize(size);

    // 1) 중심을 (0,0,0)으로 이동
    scene.position.sub(center); // pivot 보정

    // 2) 세로(Y) 높이 기준으로 스케일 표준화
    const height = size.y || 1;
    const k = targetHeight / height;
    scene.scale.setScalar(k);

    // 보정 후 업데이트
    scene.updateMatrixWorld(true);
  }, [gltf, targetHeight]);

  return <group ref={groupRef} />;
}
