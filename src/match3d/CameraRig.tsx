import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function CameraRig() {
  const camRef = useRef<THREE.PerspectiveCamera>(null);

  useFrame(({ clock }) => {
    if (!camRef.current) return;
    const t = clock.getElapsedTime();
    camRef.current.position.y = 6 + Math.sin(t * 0.3) * 0.05;
    camRef.current.lookAt(0, 1, 0);
  });

  return (
    <PerspectiveCamera
      ref={camRef}
      makeDefault
      position={[18, 6, 0]}
      fov={42}
      near={0.1}
      far={200}
    />
  );
}
