import { useFrame } from "@react-three/fiber";

import Room from "./components/Room";
import Table from "./components/Table";
import CardDeck from "./components/CardDeck";
import Light from "./components/Light";

import { events, actions } from "./events";

function App() {
    useFrame((state, delta) => {
        events.emit(actions.UPDATE, delta, state);
    });

    return (
        <Room floorTextureUrl="assets/floor.jpg" wallTextureUrl="assets/wall.jpg">
            <Light />
            <Table>
                <CardDeck />
            </Table>
        </Room>
    );
}

export default App;
