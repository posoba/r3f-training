import { useEffect, useRef } from "react";
import * as THREE from "three";

function Light() {
    const lightRef = useRef<THREE.PointLight>(null);

    useEffect(() => {
        lightRef.current?.shadow.mapSize.set(2048, 2048);
    }, []);

    return (
        <>
            <ambientLight intensity={0.2} />
            <pointLight castShadow ref={lightRef} position={[0, 5, 6]} />;
        </>
    );
}

export default Light;
