import { useMemo } from "react";
import { Vector3 } from "three";
import { OrbitControls } from "@react-three/drei";

import config from "../config";

function CameraControl() {
    const targetPosition = useMemo(() => config.startCameraPosition.clone().sub(new Vector3(0, 0, 5)), []);
    return (
        <OrbitControls
            makeDefault
            enablePan={false}
            enabled
            target={targetPosition}
            minAzimuthAngle={-Math.PI / 3}
            maxAzimuthAngle={Math.PI / 3}
            minPolarAngle={Math.PI * 0.1}
            maxPolarAngle={Math.PI * 0.7}
            minDistance={0.8}
            maxDistance={5}
        />
    );
}

export default CameraControl;
