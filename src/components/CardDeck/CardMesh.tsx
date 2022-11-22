import { forwardRef, Ref, useMemo } from "react";
import { BoxGeometry, MeshStandardMaterial, Mesh, Vector3 } from "three";
import { Html } from "@react-three/drei";

import config from "../../config";
import backShaderMaterial from "./backShaderMaterial";
import makeFrontShaderMaterial from "./makeFrontShaderMaterial";

export interface Card extends Mesh {
    index: number;
    startPosition: Vector3;
    showed: boolean;
}

interface Props {
    colors: number[];
    isTopCard: boolean;
    index: number;
}

const geometry = new BoxGeometry(0.15, 0.2, config.cardThickness);
const borderMaterial = new MeshStandardMaterial({
    color: 0xeeeeee,
});
const textPosition = new Vector3(0, 0, config.cardThickness / 2);

function CardMesh({ colors, isTopCard, index }: Props, ref: Ref<Mesh>) {
    const frontMaterial = useMemo(() => {
        return makeFrontShaderMaterial(colors);
    }, [colors]);

    return (
        <mesh
            ref={ref}
            geometry={geometry}
            material={[
                borderMaterial,
                borderMaterial,
                borderMaterial,
                borderMaterial,
                frontMaterial,
                backShaderMaterial,
            ]}
        >
            <Html
                transform
                position={textPosition}
                center
                style={{ fontWeight: "bold", userSelect: "none", color: "white" }}
                distanceFactor={4}
                occlude
            >
                {index}
            </Html>
        </mesh>
    );
}

export default forwardRef(CardMesh);
