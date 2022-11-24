import { Vector3 } from "three";

const config = {
    startCameraPosition: new Vector3(0, 1.5, 2),
    wallSize: 20,
    cardsQuantity: 10,
    collectCardsPositionX: 0.2,
    cardColors: [
        [0x00ff00, 0xffff00],
        [0x00ff00, 0x00ffff],
        [0x00ff00, 0x0000ff],
        [0x00ff00, 0xff00ff],
        [0x00ff00, 0x0000ff],
        [0xff0000, 0xffff00],
        [0xff0000, 0x00ffff],
        [0xff0000, 0xff00ff],
        [0xff0000, 0x0000ff],
        [0xff0000, 0x00ff00],
    ],
    cardThickness: 0.005,
};

export default config;
