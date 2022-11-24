import { useEffect, useMemo, useState } from "react";
import { Vector3 } from "three";
import { OrbitControls } from "@react-three/drei";

import { events, actions } from "../events";
import config from "../config";

function CameraControl() {
    const targetPosition = useMemo(() => config.startCameraPosition.clone().sub(new Vector3(0, 0.5, 1)), []);
    const [controlEnabled, setControlEnabled] = useState(true);

    useEffect(() => {
        events.on(actions.SET_CAMERA_CONTROL_ENABLED, setControlEnabled);
        return () => {
            events.off(actions.SET_CAMERA_CONTROL_ENABLED, setControlEnabled);
        };
    }, []);

    return (
        <OrbitControls
            makeDefault
            enablePan={false}
            enabled={controlEnabled}
            target={targetPosition}
            minAzimuthAngle={-Math.PI / 3}
            maxAzimuthAngle={Math.PI / 3}
            minPolarAngle={-Math.PI * 0.7}
            maxPolarAngle={Math.PI * 0.5}
            minDistance={0.8}
            maxDistance={5}
        />
    );
}

export default CameraControl;
