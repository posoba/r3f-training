import { forwardRef, Ref } from "react";
import { BoxGeometry, MeshStandardMaterial, Mesh, Vector3 } from "three";

import config from "../../config";

export interface Card extends Mesh {
    index: number;
    startPosition: Vector3;
    showed: boolean;
}

interface Props {
    frontMaterial: MeshStandardMaterial;
}

const geometry = new BoxGeometry(0.15, 0.2, config.cardThickness);
const backMaterial = new MeshStandardMaterial({
    color: 0xff0000,
});

const borderMaterial = new MeshStandardMaterial({
    color: 0xeeeeee,
});

function CardMesh({ frontMaterial }: Props, ref: Ref<Mesh>) {
    return (
        <mesh
            ref={ref}
            geometry={geometry}
            material={[borderMaterial, borderMaterial, borderMaterial, borderMaterial, frontMaterial, backMaterial]}
        />
    );
}

export default forwardRef(CardMesh);
