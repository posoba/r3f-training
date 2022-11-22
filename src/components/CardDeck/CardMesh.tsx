import { forwardRef, Ref, useMemo } from "react";
import { BoxGeometry, MeshStandardMaterial, Mesh, Vector3, ShaderMaterial, Vector4 } from "three";
import { useFrame } from "@react-three/fiber";

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
}

const geometry = new BoxGeometry(0.15, 0.2, config.cardThickness);
const borderMaterial = new MeshStandardMaterial({
    color: 0xeeeeee,
});

function CardMesh({ colors }: Props, ref: Ref<Mesh>) {
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
        />
    );
}

export default forwardRef(CardMesh);
