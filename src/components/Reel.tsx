import * as THREE from "three";
import { Component } from "react";
import { Tween, Easing } from "@tweenjs/tween.js";

import { events, actions } from "../events";
import config from "../config";

import { SymbolMaterials } from "../App";
import { ReelData } from "../reelsConfig";
import addLeadingZero from "../utils/addLeadingZero";
import getRandomSymbolName from "../utils/getRandomSymbolName";

interface Props {
    symbolMaterials: SymbolMaterials;
    reelData: ReelData;
}

interface Symbol {
    index: number;
    name: string;
    key: string;
}

interface SlotToUpdate {
    slotIndex: number;
    name: string;
}

interface State {
    symbols: Symbol[];
}

const conesRotationStep = (2 * Math.PI) / config.slotsInReel;
const height = (config.slotSize / 2 / Math.tan(conesRotationStep / 2)) * config.gapBetweenSlotsMultiply;
const coneGeometry = new THREE.ConeGeometry(config.slotSize / Math.SQRT2, height, 4, 1);
coneGeometry.translate(0, -height / 2, 0);
coneGeometry.rotateY(Math.PI / 4);

const defaultMaterial = new THREE.MeshBasicMaterial({ color: 0 });
const MATH_PI2 = 2 * Math.PI;

class Reel extends Component<Props, State> {
    ref!: THREE.Group;
    conesRefs: { [index: number]: THREE.Mesh };
    speed: number;
    lastChangeedSlotIndex: number;
    slotsToRandomizeAfterStart: SlotToUpdate[];

    constructor(props: Props) {
        super(props);

        this.speed = 0;
        this.conesRefs = {};
        this.slotsToRandomizeAfterStart = [];
        this.lastChangeedSlotIndex = -1;
        const symbols = props.reelData.startSymbols.map((symbolName, index) => ({
            name: symbolName,
            index,
            key: "symbol_" + addLeadingZero(index),
        }));

        this.state = {
            symbols,
        };
    }

    componentDidMount() {
        events.on(actions.UPDATE, this.onUpdate, this);
        this.ref.rotation.x = Math.floor(Math.random() * config.slotsInReel) * conesRotationStep;
    }

    componentWillUnmount() {
        events.off(actions.UPDATE, this.onUpdate, this);
    }

    private setReelRef(ref: THREE.Group) {
        this.ref = ref;
    }

    private addConeRef(ref: THREE.Mesh, index: number) {
        this.conesRefs[index] = ref;
    }

    private onUpdate(delta: number) {
        if (!this.speed) return;
        const { rotation } = this.ref;
        rotation.x += this.speed * delta;

        if (rotation.x >= MATH_PI2) {
            rotation.x -= MATH_PI2;
        }
    }

    private updateSlots(slotsToUpdate: SlotToUpdate[]) {
        this.setState((state) => {
            const symbols = [...state.symbols];
            slotsToUpdate.forEach(({ slotIndex, name }) => {
                symbols[slotIndex].name = name;
            });
            return { symbols };
        });
    }

    public startSpin() {
        const { rotation } = this.ref;
        new Tween(rotation)
            .to({ x: rotation.x + Math.PI / 2 }, 500)
            .easing(Easing.Quartic.In)
            .onComplete(() => {
                this.speed = 10;
                this.updateSlots(this.slotsToRandomizeAfterStart);
                this.slotsToRandomizeAfterStart = [];
            })
            .start();
    }

    public stopSpin(outcomeSymbols: string[], delay: number): Promise<null> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const { rotation } = this.ref;
                this.speed = 0;
                const outcomeSlotsStartIndex =
                    Math.floor((MATH_PI2 - rotation.x) / conesRotationStep) + Math.ceil(config.slotsInReel / 2) + 1;

                const slotsToUpdate = outcomeSymbols.map((symbol, index) => ({
                    slotIndex: (outcomeSlotsStartIndex + index) % config.slotsInReel,
                    name: symbol,
                }));
                this.updateSlots(slotsToUpdate);

                this.slotsToRandomizeAfterStart = slotsToUpdate.map(({ slotIndex }) => ({
                    slotIndex,
                    name: getRandomSymbolName(),
                }));

                new Tween(rotation)
                    .to({ x: (Math.floor(rotation.x / conesRotationStep) + 3) * conesRotationStep }, 500)
                    .easing(Easing.Quartic.Out)
                    .onComplete(() => {
                        if (rotation.x >= MATH_PI2) {
                            rotation.x -= MATH_PI2;
                        }
                        resolve(null);
                    })
                    .start();
            }, delay - 500);
        });
    }

    public toggleReel(open: boolean) {
        return new Promise((resolve) => {
            const bottomConeStartIndex =
                1 + Math.round((MATH_PI2 - (this.ref.rotation.x - Math.PI * 1.5)) / conesRotationStep);
            const topConeStartIndex = (bottomConeStartIndex + config.slotsInReel / 2) % config.slotsInReel;
            const topCones: THREE.Mesh[] = new Array(config.slotsInReel / 2).fill(0).map((el, index) => {
                const coneIndex = (topConeStartIndex + index) % config.slotsInReel;
                return this.conesRefs[coneIndex];
            });
            const bottomCones: THREE.Mesh[] = new Array(config.slotsInReel / 2).fill(0).map((el, index) => {
                const coneIndex = (bottomConeStartIndex + index) % config.slotsInReel;
                return this.conesRefs[coneIndex];
            });

            let angle = Math.PI / 16;
            const h = height / Math.cos(conesRotationStep / 2);
            const position = new THREE.Vector3(0, h * Math.sin(angle), h - h * Math.cos(angle));
            position.applyEuler(this.ref.rotation);

            let lastProgress = 0;
            new Tween({ progress: 0 })
                .to({ progress: 1 }, 1000)
                .onUpdate(({ progress }) => {
                    const angleDiff = (progress - lastProgress) * angle * (open ? 1 : -1);
                    lastProgress = progress;

                    const positionRatio = open ? progress : 1 - progress;
                    const yPositionProgress = positionRatio * position.y;
                    const zPositionProgress = positionRatio * position.z;

                    bottomCones.forEach((cone) => {
                        cone.position.y = -yPositionProgress;
                        cone.position.z = zPositionProgress;
                        cone.rotation.x += angleDiff;
                    });

                    topCones.forEach((cone) => {
                        cone.position.y = yPositionProgress;
                        cone.position.z = -zPositionProgress;
                        cone.rotation.x -= angleDiff;
                    });
                })
                .onComplete(() => resolve(null))
                .start();
        });
    }

    render() {
        const { reelData } = this.props;

        return (
            <group
                ref={(ref) => ref && this.setReelRef(ref)}
                position={[config.slotSize * config.gapBetweenSlotsMultiply * reelData.index, 0, 0]}
            >
                {this.state.symbols.map(({ index, key, name }) => (
                    <mesh
                        key={key}
                        ref={(ref) => ref && this.addConeRef(ref, index)}
                        rotation={[index * conesRotationStep, 0, 0]}
                        geometry={coneGeometry}
                        material={[
                            defaultMaterial,
                            defaultMaterial,
                            this.props.symbolMaterials[name] || defaultMaterial,
                        ]}
                    />
                ))}
            </group>
        );
    }
}

export default Reel;
