import { Component } from "react";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { Tween } from "@tweenjs/tween.js";

import Coin from "./Coin";

const coinsData = new Array(50).fill(0).map((el, index) => index);

interface Props {
    coinModel: GLTF;
}

class Coins extends Component<Props> {
    coinsRefs: { [index: number]: Coin };

    constructor(props: Props) {
        super(props);
        this.coinsRefs = {};
    }

    public makeAnimation(): Promise<any> {
        return new Promise((resolve) => {
            const coinsArr = Object.values(this.coinsRefs);
            new Tween({ progress: 0 })
                .to({ progress: 4 }, 4000)
                .onUpdate(({ progress }) => {
                    coinsArr.forEach((coin) => coin.onUpdate(progress, 4));
                })
                .onComplete(resolve)
                .start();
        });
    }

    private addCoinRef(ref: Coin, index: number) {
        this.coinsRefs[index] = ref;
    }

    render() {
        return (
            <group position={[0.5, 5, 0.5]}>
                {coinsData.map((index) => (
                    <Coin
                        key={index}
                        coinsQuantity={coinsData.length}
                        coinModel={this.props.coinModel}
                        index={index}
                        ref={(ref) => ref && this.addCoinRef(ref, index)}
                    />
                ))}
            </group>
        );
    }
}

export default Coins;
