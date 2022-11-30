import { Component } from "react";
import { RootState } from "@react-three/fiber";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { SymbolMaterials } from "../App";

import Reel from "../components/Reel";
import SlotState from "./SlotState";
import Betlines from "../components/Betlines";
import Coins from "../components/Coins";
import Leaver from "../components/Leaver";
import ScreenShaker from "../utils/ScreenShaker";

import reelsConfig from "../reelsConfig";
import config from "../config";

interface Props {
    symbolMaterials: SymbolMaterials;
    threeState: RootState;
    coinModel: GLTF;
}

class SlotMachine extends Component<Props> {
    reelsRefs: { [id: number]: Reel };
    slotState: SlotState;
    threeState: RootState;
    screenShaker: ScreenShaker;
    betlines: Betlines | null;
    coins: Coins | null;
    canPlay: boolean;

    constructor(props: Props) {
        super(props);
        this.reelsRefs = {};
        this.slotState = new SlotState();
        this.threeState = props.threeState;
        this.screenShaker = new ScreenShaker(this.threeState.camera);
        this.canPlay = true;
        this.coins = null;
        this.betlines = null;
    }

    private addReelRef(reel: Reel, id: number) {
        this.reelsRefs[id] = reel;
    }

    private async startSpin() {
        this.slotState.spin();
        const promises = this.slotState.reels.map((reelState) => {
            const reel = this.reelsRefs[reelState.index];
            reel.startSpin();
            return reel.stopSpin(reelState.symbols, 2500 + reelState.index * 750);
        });
        await Promise.all(promises);
        await this.winPresentation();
        this.setCanPlay(true);
    }

    private async winPresentation() {
        if (!this.slotState.isWin) return;
        await this.betlines?.showLines(this.slotState.winBetlines);
        const showDropMone = this.slotState.winBetlines.find((betlines) => betlines.length > 3);
        if (!showDropMone) return;
        await this.dropMoney();
    }

    private async dropMoney() {
        const openPromises = Object.values(this.reelsRefs).map((reel) => reel.toggleReel(true));
        await Promise.all(openPromises);
        this.screenShaker.start();
        await this.coins?.makeAnimation();
        this.screenShaker.stop();
        const closePromises = Object.values(this.reelsRefs).map((reel) => reel.toggleReel(false));
        await Promise.all(closePromises);
    }

    private setCanPlay = (bool: boolean) => (this.canPlay = bool);

    private checkCanPlay = (): boolean => this.canPlay;

    private onClickLeaver = () => this.startSpin();

    render() {
        return (
            <group>
                <Betlines ref={(ref) => (this.betlines = ref)} />
                <Coins coinModel={this.props.coinModel} ref={(ref) => (this.coins = ref)} />

                <mesh position={[0.5, 5, 0]}>
                    <boxGeometry
                        args={[(config.reelsQuantity - 1) * config.slotSize, config.slotSize * 4, config.slotSize]}
                    />
                    <meshBasicMaterial color="black" />
                </mesh>
                <group position={[-1.5, 5, 0]}>
                    {reelsConfig.map((reelData) => (
                        <Reel
                            ref={(ref) => ref && this.addReelRef(ref, reelData.index)}
                            key={reelData.index}
                            symbolMaterials={this.props.symbolMaterials}
                            reelData={reelData}
                        />
                    ))}
                </group>

                <Leaver onClick={this.onClickLeaver} setCanPlay={this.setCanPlay} checkCanPlay={this.checkCanPlay} />
            </group>
        );
    }
}

export default SlotMachine;
