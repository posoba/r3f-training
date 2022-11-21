import { PropsWithChildren, useMemo } from "react";
import {
  Euler,
  Vector3,
  MeshStandardMaterial,
  MirroredRepeatWrapping,
} from "three";
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
  const [floorTexture, wallTexture] = useTexture([
    floorTextureUrl,
    wallTextureUrl,
  ]);

  const floorMaterial = useMemo(() => {
    const floorMaterial = new MeshStandardMaterial({ map: floorTexture });
    floorTexture.repeat.set(5, 5);
    floorTexture.wrapS = MirroredRepeatWrapping;
    floorTexture.wrapT = MirroredRepeatWrapping;
    return floorMaterial;
  }, [floorTexture]);

  const wallMaterial = useMemo(() => {
    const wallMaterial = new MeshStandardMaterial({ map: wallTexture });
    wallTexture.repeat.set(5, 5);
    wallTexture.wrapS = MirroredRepeatWrapping;
    wallTexture.wrapT = MirroredRepeatWrapping;
    return wallMaterial;
  }, [wallTexture]);

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
