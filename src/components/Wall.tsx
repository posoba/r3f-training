import { Euler, Vector3, PlaneGeometry, MeshStandardMaterial } from "three";

import config from "../config";

interface Props {
    rotation?: Euler;
    position?: Vector3;
    receiveShadow?: boolean;
    material?: MeshStandardMaterial;
}

const geometry = new PlaneGeometry(config.wallSize, config.wallSize);

function Wall({ rotation, position, receiveShadow, material }: Props) {
    return (
        <mesh
            receiveShadow={receiveShadow}
            position={position}
            rotation={rotation}
            geometry={geometry}
            material={material}
        />
    );
}

export default Wall;
