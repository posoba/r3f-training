import { Component } from "react";
import * as THREE from "three";
import { Tween } from "@tweenjs/tween.js";
import { Line } from "@react-three/drei";
import { Line2 } from "three/examples/jsm/lines/Line2";

import wait from "../utils/wait";
import config from "../config";

interface Props {}

class Betlines extends Component<Props> {
    currentTween!: Tween<any>;
    ref!: Line2;

    setLineRef(ref: Line2) {
        this.ref = ref;
    }

    public async showLines(betlinesData: number[][]) {
        if (!betlinesData.length) return;
        const positions = betlinesData.map((betlineData) => this.getLinePositions(betlineData));

        for (let i = 0; i < positions.length; i++) {
            const line = positions[i];
            await this.animateLine(line);
            await wait(1000);
        }

        this.clearLine();
    }

    public clearLine() {
        this.currentTween?.stop();
        this.ref?.geometry.setPositions([0, 0, 0]);
        this.ref?.geometry.dispose();
    }

    private animateLine(positions: number[]): Promise<any> {
        return new Promise((resolve) => {
            if (!this.ref) return resolve(null);
            this.currentTween = new Tween({ progress: 0 })
                .to({ progress: 1 }, positions.length)
                .onUpdate(({ progress }) => {
                    const ratio = Math.round(progress * positions.length);
                    const length = Math.max(3, ratio + (3 - (ratio % 3)));
                    this.ref.geometry.setPositions(positions.slice(0, length));
                    this.ref.geometry.dispose();
                })
                .onComplete(resolve)
                .start();
        });
    }

    private getLinePositions(betlineData: number[]): number[] {
        const points = this.getLinePoints(betlineData);
        const spline = new THREE.CatmullRomCurve3(points);

        const divisions = points.length * 25;
        const point = new THREE.Vector3();
        const positions: number[] = [];

        for (let i = 0, l = divisions; i < l; i++) {
            const t = i / l;
            spline.getPoint(t, point);
            positions.push(point.x, point.y, point.z);
        }
        return positions;
    }

    private getSlotPosition(reelIndex: number, slotIndex: number) {
        const x = reelIndex * config.slotSize * config.gapBetweenSlotsMultiply;
        const y = -slotIndex * config.slotSize * config.gapBetweenSlotsMultiply;
        const z = slotIndex === 1 ? 0 : -0.22;

        return new THREE.Vector3(x, y, z);
    }

    private getLinePoints(slotIndexes: number[]): THREE.Vector3[] {
        const points: THREE.Vector3[] = [];

        let lastSlotIndex: number = slotIndexes[0];
        slotIndexes.forEach((slotIndex, reelIndex) => {
            if (lastSlotIndex !== slotIndex) {
                const cornerSlot = slotIndex === 1 ? lastSlotIndex : slotIndex;
                const x = (reelIndex - 1) * config.slotSize * config.gapBetweenSlotsMultiply + config.slotSize / 2;
                const y = cornerSlot === 0 ? -0.5 : -1.5;
                points.push(new THREE.Vector3(x, y, 0));
            }
            points.push(this.getSlotPosition(reelIndex, slotIndex));
            lastSlotIndex = slotIndex;
        });
        return points;
    }

    render() {
        return (
            <Line
                position={[-1.5, 6, 2.6]}
                ref={(ref) => ref && this.setLineRef(ref)}
                points={[0, 0, 0]}
                color="green"
                lineWidth={0.1}
                worldUnits
            />
        );
    }
}

export default Betlines;
