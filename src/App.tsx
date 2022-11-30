import { useEffect, useMemo } from "react";
import { useFrame, useThree, useLoader } from "@react-three/fiber";
import { update } from "@tweenjs/tween.js";
import { useTexture } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
import Room from "./components/Room";
import Light from "./components/Light";
import SlotMachine from "./SlotMachine";

import { events, actions } from "./events";
import config from "./config";

export interface SymbolMaterials {
    [key: string]: THREE.MeshStandardMaterial;
}

function App() {
    const threeState = useThree();

    useFrame((state, delta) => {
        update(state.clock.oldTime);
        events.emit(actions.UPDATE, delta, state);
    });

    useEffect(() => {
        threeState.scene.add(threeState.camera);
    }, [threeState]);

    const symbolTextures = useTexture(config.symbols.map((name) => config.symbolsPath + name + ".png"));
    const symbolMaterials = useMemo(() => {
        const materials: SymbolMaterials = {};
        config.symbols.forEach((name, index) => {
            const texture = symbolTextures[index];
            texture.center.set(0.5, 0.5);
            texture.rotation = -Math.PI / 4;
            texture.repeat.set(1.5, 1.5);
            texture.encoding = THREE.sRGBEncoding;
            const material = new THREE.MeshStandardMaterial({ map: texture });
            materials[name] = material;
        });
        return materials;
    }, [symbolTextures]);

    const coinModel = useLoader(GLTFLoader, "assets/coin.glb");

    return (
        <Room floorTextureUrl="assets/floor.jpg" wallTextureUrl="assets/wall.jpg">
            <Light />
            <SlotMachine threeState={threeState} symbolMaterials={symbolMaterials} coinModel={coinModel} />
        </Room>
    );
}

export default App;
