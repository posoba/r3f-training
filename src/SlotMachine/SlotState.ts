import reelsConfig from "../reelsConfig";
import getRandomSymbolName from "../utils/getRandomSymbolName";
import betlinesData from "./betlinesData";

interface ReelState {
    index: number;
    symbols: string[];
}

export default class SlotState {
    reels: ReelState[];
    winBetlines: number[][];
    isWin: boolean;

    constructor() {
        this.reels = reelsConfig.map(
            ({ index, startSymbols }): ReelState => ({
                index,
                symbols: startSymbols.slice(0, 3),
            }),
        );
        this.winBetlines = [];
        this.isWin = false;
    }

    public spin() {
        this.reels.forEach((reelState) => {
            reelState.symbols = [getRandomSymbolName(), getRandomSymbolName(), getRandomSymbolName()];
        });
        this.checkBetlines();
        this.isWin = this.winBetlines.length > 0;
    }

    private checkBetlines() {
        const winBetlines = betlinesData.reduce((red: number[][], betline) => {
            const winingSymbol = this.reels[0].symbols[betline[0]];
            const line: number[] = [];
            let checkNextSlot = true;
            betline.forEach((slotIndex, reelIndex) => {
                if (!checkNextSlot) return;
                const symbol = this.reels[reelIndex].symbols[slotIndex];
                if (symbol === winingSymbol) line.push(slotIndex);
                else checkNextSlot = false;
            });

            if (line.length > 2) {
                red.push(line);
            }
            return red;
        }, []);

        this.winBetlines = winBetlines;
    }
}
