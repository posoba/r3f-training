import config from "./config";
import getRandomSymbolName from "./utils/getRandomSymbolName";

export interface ReelData {
    index: number;
    startSymbols: string[];
}

const reelsConfig: ReelData[] = new Array(config.reelsQuantity).fill(0).map((el, index) => ({
    index,
    startSymbols: new Array(config.slotsInReel).fill(0).map(getRandomSymbolName),
}));

export default reelsConfig;
