import Room from "./components/Room";
import Table from "./components/Table";
import CardDeck from "./components/CardDeck";
import Light from "./components/Light";

function App() {
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
