import { forwardRef, Ref, PropsWithChildren } from "react";
import { Group, Vector3 } from "three";
import { createPortal, useThree } from "@react-three/fiber";

const position = new Vector3(0, 0, -0.4);

function Hand(props: PropsWithChildren, ref: Ref<Group>) {
    const { camera } = useThree();

    return createPortal(<group ref={ref} position={position} />, camera);
}

export default forwardRef(Hand);
