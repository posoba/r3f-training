import { useCallback, useRef } from "react";
import { ThreeEvent } from "@react-three/fiber";
import { Tween, Easing } from "@tweenjs/tween.js";
import * as THREE from "three";

interface Props {
    onClick: () => void;
    checkCanPlay: () => boolean;
    setCanPlay: (bool: boolean) => void;
}

const material = new THREE.MeshStandardMaterial({ color: 0x666666 });

function Leaver({ onClick, checkCanPlay, setCanPlay }: Props) {
    const ref = useRef<THREE.Group>(null);

    const onLeaverClick = useCallback(
        (evt: ThreeEvent<MouseEvent>) => {
            evt.stopPropagation();
            if (!ref.current || !checkCanPlay()) return;
            setCanPlay(false);

            new Tween(ref.current.rotation)
                .to({ x: Math.PI / 2 }, 500)
                .easing(Easing.Quartic.Out)
                .start()
                .onComplete(() => {
                    onClick();
                    ref.current && new Tween(ref.current.rotation).to({ x: 0 }, 2500).easing(Easing.Quartic.In).start();
                });
        },
        [onClick, checkCanPlay, setCanPlay],
    );

    return (
        <group
            onClick={onLeaverClick}
            ref={ref}
            position={[4, 5, 0]}
            onPointerEnter={() => (document.body.style.cursor = "pointer")}
            onPointerLeave={() => (document.body.style.cursor = "default")}
        >
            <mesh material={material} rotation={[0, 0, Math.PI / 2]} position={[-0.5, 0, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 2, 32]} />
            </mesh>
            <mesh material={material} position={[0.5, 0.65, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 1.5, 32]} />
            </mesh>
            <mesh material={material} position={[0.5, 1.3, 0]}>
                <sphereGeometry args={[0.25, 32, 32]} />
            </mesh>
        </group>
    );
}

export default Leaver;
