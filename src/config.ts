import * as THREE from "three";

const config = {
    startCameraPosition: new THREE.Vector3(0, 5, 8),
    wallSize: 100,
    reels: 5,
    slotSize: 1,
    slotsInReel: 16, // must be even
    symbols: ["SYM01", "SYM02", "SYM03", "SYM04", "SYM05", "SYM06"],
    symbolsPath: "/assets/symbols/",
    reelsQuantity: 5,
    gapBetweenSlotsMultiply: 1.01,
};

export default config;
