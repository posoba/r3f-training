import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { update } from "@tweenjs/tween.js";
import { Group } from "three";

import Room from "./components/Room";
import Table from "./components/Table";
import Light from "./components/Light";
import Hand from "./components/Hand";
import CardDeck from "./components/CardDeck";

import { events, actions } from "./events";

function App() {
    const threeState = useThree();
    const handGroupRef = useRef<Group>(null);
    const tableGroupRef = useRef<Group>(null);

    useFrame((state, delta) => {
        update(state.clock.oldTime);
        events.emit(actions.UPDATE, delta, state);
    });

    useEffect(() => {
        threeState.scene.add(threeState.camera);
    }, [threeState]);

    return (
        <Room floorTextureUrl="assets/floor.jpg" wallTextureUrl="assets/wall.jpg">
            <Light />
            <Table ref={tableGroupRef} />
            <Hand ref={handGroupRef} />
            {handGroupRef.current && tableGroupRef.current && (
                <CardDeck threeState={threeState} handGroup={handGroupRef.current} tableGroup={tableGroupRef.current} />
            )}
        </Room>
    );
}

export default App;
