import { PropsWithChildren, useEffect, useMemo } from "react";
import { Vector3, Box3, Object3D } from "three";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

function Table({ children }: PropsWithChildren) {
  const model = useLoader(GLTFLoader, "assets/table.glb");

  useEffect(() => {
    model.scene.traverse((object: Object3D) => {
      object.castShadow = true;
    });
  }, [model.scene]);

  const modelSize = useMemo(() => {
    const box = new Box3();
    box.setFromObject(model.scene);
    return box.getSize(new Vector3());
  }, [model.scene]);

  return (
    <group>
      <primitive
        object={model.scene}
        position={new Vector3(0, modelSize.y / 2, 0)}
      />

      <group
        position={new Vector3(-modelSize.x / 2, modelSize.y, modelSize.z / 2)}
      >
        {children}
      </group>
    </group>
  );
}

export default Table;
