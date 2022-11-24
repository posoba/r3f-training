import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import config from "../config";

function Light() {
    const lightRef = useRef<THREE.PointLight>(null);
    const rootRef = useRef<THREE.Group & { yoyo: boolean }>(null);

    const position = useMemo(() => new THREE.Vector3(0, 3, 2), []);

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
        <group ref={rootRef} position={position}>
            <pointLight castShadow ref={lightRef} />
            <mesh>
                <sphereGeometry args={[0.05, 32, 32]} />
                <meshBasicMaterial color="yellow" />
            </mesh>
        </group>
    );
}

export default Light;
