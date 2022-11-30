import * as THREE from "three";
import { events, actions } from "../events";

class ScreenShaker {
    startPoint: THREE.Vector3;
    endPoint: THREE.Vector3;
    camera: THREE.Camera;
    interval: number;

    constructor(camera: THREE.Camera) {
        this.camera = camera;
        this.interval = 0;
        this.startPoint = new THREE.Vector3();
        this.endPoint = new THREE.Vector3();
    }

    public start() {
        events.on(actions.UPDATE, this.update, this);

        this.startPoint.copy(this.camera.position);
        this.endPoint.copy(this.camera.position).add(new THREE.Vector3(0.1, 0.1, 0.1));
    }

    public stop() {
        events.off(actions.UPDATE, this.update, this);
        this.camera.position.copy(this.startPoint);
    }

    private update(delta: number) {
        this.interval = (this.interval + delta * 5) % 1;
        this.computePosition(this.interval);
    }

    private computePosition(interval: number) {
        const position = this.getCurrentPosition(interval);
        this.camera.position.lerpVectors(this.startPoint, this.endPoint, position);
    }

    private getCurrentPosition(interval: number) {
        if (interval < 0.4) {
            return this.getQuadra(interval / 0.4);
        } else if (interval < 0.7) {
            return this.getQuadra((interval - 0.4) / 0.3) * -0.6;
        } else if (interval < 0.9) {
            return this.getQuadra((interval - 0.7) / 0.2) * 0.3;
        } else {
            return this.getQuadra((interval - 0.9) / 0.1) * -0.1;
        }
    }

    private getQuadra(t: number) {
        return 9.436896e-16 + 4 * t - 4 * (t * t);
    }
}

export default ScreenShaker;
