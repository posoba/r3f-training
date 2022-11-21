import { PropsWithChildren, useCallback, useMemo } from "react";
import { Euler, Vector3, MeshStandardMaterial, MirroredRepeatWrapping, Texture } from "three";
import { useTexture } from "@react-three/drei";
import Wall from "./Wall";

import config from "../config";

interface Props extends PropsWithChildren {
    floorTextureUrl: string;
    wallTextureUrl: string;
}

interface WallData {
    position: Vector3;
    rotation: Euler;
    key: string;
    isFloor?: boolean;
}

const wallsData: WallData[] = [
    {
        key: "floor",
        position: new Vector3(0, 0, 0),
        rotation: new Euler(-Math.PI / 2, 0, 0),
        isFloor: true,
    },
    {
        key: "leftWall",
        position: new Vector3(-config.wallSize / 2, 0, 0),
        rotation: new Euler(0, Math.PI / 2, 0),
    },
    {
        key: "rightWall",
        position: new Vector3(config.wallSize / 2, 0, 0),
        rotation: new Euler(0, -Math.PI / 2, 0),
    },
    {
        key: "frontWall",
        position: new Vector3(0, 0, -config.wallSize / 2),
        rotation: new Euler(0, 0, 0),
    },
];

function Room({ children, floorTextureUrl, wallTextureUrl }: Props) {
    const [floorTexture, wallTexture] = useTexture([floorTextureUrl, wallTextureUrl]);

    const makeMaterial = useCallback((texture: Texture): MeshStandardMaterial => {
        const material = new MeshStandardMaterial({ map: texture });
        texture.repeat.set(5, 5);
        texture.wrapS = MirroredRepeatWrapping;
        texture.wrapT = MirroredRepeatWrapping;
        return material;
    }, []);

    const floorMaterial = useMemo(() => makeMaterial(floorTexture), [floorTexture, makeMaterial]);
    const wallMaterial = useMemo(() => makeMaterial(wallTexture), [wallTexture, makeMaterial]);

    return (
        <group>
            {wallsData.map(({ key, position, rotation, isFloor }) => (
                <Wall
                    key={key}
                    position={position}
                    rotation={rotation}
                    receiveShadow={isFloor}
                    material={isFloor ? floorMaterial : wallMaterial}
                />
            ))}
            {children}
        </group>
    );
}

export default Room;
