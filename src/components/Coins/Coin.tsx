import { Component } from "react";
import * as THREE from "three";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";

interface Props {
    coinModel: GLTF;
    index: number;
    coinsQuantity: number;
}

class Coin extends Component<Props> {
    model: THREE.Group;
    index: number;
    endPosition: THREE.Vector3;
    startRotation: THREE.Euler;
    ownProgressDiff: number;

    constructor(props: Props) {
        super(props);
        this.index = props.index;
        this.ownProgressDiff = props.index / props.coinsQuantity;
        this.model = this.props.coinModel.scene.clone();

        this.endPosition = new THREE.Vector3(Math.random() * 20 - 10, Math.random() * 6 - 3, 10);
        this.startRotation = new THREE.Euler(Math.random() * 2 * Math.PI, 0, 0);
        this.model.position.copy(this.endPosition);
        this.model.rotation.copy(this.startRotation);
        this.model.scale.set(0.4, 0.4, 0.4);
        this.model.visible = false;
    }

    onUpdate(progress: number, endProgress: number) {
        const ownTotalProgress = progress + this.ownProgressDiff;
        const ownProgress = ownTotalProgress % 1;

        if (ownProgress < 0.05) this.model.visible = true;
        if (ownTotalProgress >= endProgress) this.model.visible = false;

        this.model.position.x = this.endPosition.x * ownProgress;
        this.model.position.y = this.endPosition.y * ownProgress;
        this.model.position.z = this.endPosition.z * ownProgress;
        this.model.rotation.x = this.startRotation.x + ownProgress * 10;
    }

    render() {
        return <primitive object={this.model} />;
    }
}

export default Coin;
