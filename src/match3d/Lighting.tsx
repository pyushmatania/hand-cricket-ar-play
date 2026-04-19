import { Environment } from "@react-three/drei";

export default function Lighting() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 20, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-10, 15, -5]} intensity={0.5} color="#ffe9b8" />
      <hemisphereLight args={["#88ccff", "#3a5a3a", 0.4]} />
      <Environment preset="sunset" background={false} />
    </>
  );
}
