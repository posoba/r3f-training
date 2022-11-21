import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

import config from "../config";

function Light() {
  const lightRef = useRef<THREE.PointLight>(null);
  const rootRef = useRef<THREE.Group & { yoyo: boolean }>(null);

  useEffect(() => {
    lightRef.current?.shadow.mapSize.set(2048, 2048);
  }, []);

  useFrame(() => {
    const root = rootRef.current;
    if (root) {
      root.position.x += 0.005 * (root.yoyo ? 1 : -1);

      if (Math.abs(root.position.x) >= config.wallSize / 3) {
        root.yoyo = !root.yoyo;
      }
    }
  });

  return (
    <group ref={rootRef} position={new THREE.Vector3(0, 3, 2)}>
      <pointLight castShadow ref={lightRef} />
      <mesh>
        <sphereGeometry args={[0.05, 32, 32]} />
        <meshBasicMaterial color="yellow" />
      </mesh>
    </group>
  );
}

export default Light;
