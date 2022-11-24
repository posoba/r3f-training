import { PropsWithChildren, useEffect, useMemo, forwardRef, Ref } from "react";
import { Vector3, Box3, Object3D, Group } from "three";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

function Table({ children }: PropsWithChildren, ref: Ref<Group>) {
    const model = useLoader(GLTFLoader, "assets/table.glb");

    useEffect(() => {
        model.scene.traverse((object: Object3D) => {
            object.castShadow = true;
        });
    }, [model.scene]);

    const { tableGroupPosition, tablePosition } = useMemo(() => {
        const box = new Box3();
        box.setFromObject(model.scene);
        const modelSize = box.getSize(new Vector3());
        const tableGroupPosition = new Vector3(-modelSize.x / 2 + 0.2, modelSize.y + 0.006, modelSize.z / 2 - 0.2);
        const tablePosition = new Vector3(0, modelSize.y / 2, 0);
        return { tableGroupPosition, tablePosition };
    }, [model.scene]);

    return (
        <group>
            <primitive object={model.scene} position={tablePosition} />
            <group ref={ref} position={tableGroupPosition}>
                {children}
            </group>
        </group>
    );
}

export default forwardRef(Table);
