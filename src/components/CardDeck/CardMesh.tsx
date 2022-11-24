import { forwardRef, Ref, useMemo } from "react";
import { BoxGeometry, MeshStandardMaterial, Mesh, Vector3, MeshBasicMaterial } from "three";
import { ThreeEvent, useLoader } from "@react-three/fiber";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";

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
    id: number;
    onMouseEnter?: (evt: ThreeEvent<MouseEvent>) => void;
    onMouseLeave?: (evt: ThreeEvent<MouseEvent>) => void;
    onClick?: (evt: ThreeEvent<MouseEvent>) => void;
}

const geometry = new BoxGeometry(0.15, 0.2, config.cardThickness);
const borderMaterial = new MeshStandardMaterial({
    color: 0xeeeeee,
});

const textMaterial = new MeshBasicMaterial({
    color: 0xffffff,
});

const textPosition = new Vector3(0, 0, 0.00001);

function CardMesh({ colors, id, onMouseEnter, onMouseLeave, onClick }: Props, ref: Ref<Mesh>) {
    const font = useLoader(FontLoader, "assets/droid_sans_bold.typeface.json");

    const textGeometry = useMemo(() => {
        const geometry = new TextGeometry(id.toString(), { font, size: 0.15, height: config.cardThickness / 2 });
        geometry.computeBoundingBox();
        if (geometry.boundingBox) {
            geometry.translate(-geometry.boundingBox.max.x / 2, -geometry.boundingBox.max.y / 2, 0);
        }
        return geometry;
    }, [font, id]);

    const frontMaterial = useMemo(() => {
        return makeFrontShaderMaterial(colors);
    }, [colors]);

    return (
        <group>
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
                onClick={onClick}
                onPointerEnter={onMouseEnter}
                onPointerLeave={onMouseLeave}
            >
                <mesh
                    position={textPosition}
                    geometry={textGeometry}
                    material={textMaterial}
                    onClick={onClick}
                    onPointerEnter={onMouseEnter}
                    onPointerLeave={onMouseLeave}
                />
            </mesh>
        </group>
    );
}

export default forwardRef(CardMesh);
