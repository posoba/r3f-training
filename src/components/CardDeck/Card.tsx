import { Component } from "react";
import { createPortal, ThreeEvent } from "@react-three/fiber";
import { Mesh, Vector3, CubicBezierCurve3, Path, Euler, Quaternion, Group, Camera } from "three";
import { Tween } from "@tweenjs/tween.js";

import CardMesh from "./CardMesh";

import config from "../../config";
import { events, actions } from "../../events";

interface Props {
    id: number;
    colors: number[];
    handGroup: Group;
    tableGroup: Group;
    canPlay: boolean;
    camera: Camera;
    inHand: boolean;
}

class Card extends Component<Props> {
    meshRef!: Mesh;

    private prepareMeshRef = (ref: Mesh | null) => {
        if (!ref) return;
        this.meshRef = ref;
    };

    public getPositionAndRotationInDeck(index: number): { position: Vector3; rotation: Euler } {
        return {
            position: new Vector3(0, index * config.cardThickness, 0),
            rotation: new Euler(Math.PI / 2, 0, Math.PI),
        };
    }

    public setPositionAndRotationInDeck(index: number) {
        const { position, rotation } = this.getPositionAndRotationInDeck(index);
        this.meshRef.position.copy(position);
        this.meshRef.rotation.copy(rotation);
    }

    public updateInHandPosition(index: number, totalCardsInHand: number) {
        return new Promise((resolve) => {
            const { position, rotation } = this.getInHandPositionAndRotation(index, totalCardsInHand);

            const path = new Path();
            path.moveTo(this.meshRef.position.x, this.meshRef.position.y);
            path.lineTo(position.x, position.y);

            let lastProgress = 0;
            const onChange = ({ progress }: { progress: number }) => {
                const diff = progress - lastProgress;
                this.meshRef.quaternion.rotateTowards(rotation, Math.PI * diff);
                const position = path.getPoint(progress);
                this.meshRef.position.x = position.x;
                this.meshRef.position.y = position.y;
            };
            new Tween({ progress: 0 }).to({ progress: 1 }, 200).onUpdate(onChange).onComplete(resolve).start();
        });
    }

    private getInHandPositionAndRotation(
        index: number,
        totalCardsInHand: number,
    ): { position: Vector3; rotation: Quaternion } {
        const positionIndex = index - (totalCardsInHand - 1) / 2;

        const euler = new Euler(0, 0.001, -0.05 * positionIndex);
        const addVector = new Vector3(0, -Math.abs(positionIndex * 2) * 0.005, 0).applyEuler(euler);
        const position = new Vector3(positionIndex * 0.095, -0.21, 0);
        position.add(addVector);

        return { position, rotation: new Quaternion().setFromEuler(euler) };
    }

    public travelToCamera() {
        return new Promise<any>((resolve) => {
            if (!this.props.tableGroup) return;
            const targetQuaternion = this.props.camera.quaternion;
            const currentPosition = this.meshRef.position;
            const cardTargetPosition = this.props.camera.localToWorld(new Vector3(0, 0, -0.4));
            this.props.tableGroup.worldToLocal(cardTargetPosition);

            const controlPoint1 = new Vector3(
                (currentPosition.x + cardTargetPosition.x) * 0.25,
                currentPosition.y,
                (currentPosition.z + cardTargetPosition.z) * 0.25,
            );

            const controlPoint2 = new Vector3(
                (currentPosition.x + cardTargetPosition.x) * 0.75,
                cardTargetPosition.y,
                (currentPosition.z + cardTargetPosition.z) * 0.75,
            );

            const curve = new CubicBezierCurve3(currentPosition, controlPoint1, controlPoint2, cardTargetPosition);
            let lastProgress = 0;

            const onChange = ({ progress }: { progress: number }) => {
                const diff = progress - lastProgress;
                lastProgress = progress;
                if (lastProgress > 0.5) {
                    this.meshRef.quaternion.rotateTowards(targetQuaternion, Math.PI * diff * 2);
                }
                curve.getPoint(progress, this.meshRef.position);
            };

            new Tween({ progress: 0 }).to({ progress: 1 }, 400).onUpdate(onChange).onComplete(resolve).start();
        });
    }

    public travelToHand(cardIndex: number, cardsInHandQuantity: number) {
        return new Promise((resolve) => {
            const { position, rotation } = this.getInHandPositionAndRotation(cardIndex, cardsInHandQuantity);

            const path = new Path();
            path.moveTo(this.meshRef.position.x, this.meshRef.position.y);
            path.quadraticCurveTo(0, position.y / 2, position.x, position.y);

            this.meshRef.position.z += 0.01;

            let lastProgress = 0;
            const onChange = ({ progress }: { progress: number }) => {
                const diff = progress - lastProgress;
                this.meshRef.quaternion.rotateTowards(rotation, Math.PI * diff);
                const position = path.getPoint(progress);
                this.meshRef.position.x = position.x;
                this.meshRef.position.y = position.y;
            };

            new Tween({ progress: 0 })
                .to({ progress: 1 }, 200)
                .onUpdate(onChange)
                .onComplete(() => {
                    this.meshRef.position.z = position.z;
                    resolve(null);
                })
                .start();
        });
    }

    public travelToBoard(cardsOnTableQuantity: number) {
        return new Promise<any>((resolve) => {
            if (!this.props.tableGroup) return resolve(null);

            const targetQuaternion = new Quaternion().setFromEuler(new Euler(Math.PI / 2, -Math.PI * 1.01, Math.PI));
            const currentPosition = this.meshRef.position;
            const targetPosition = new Vector3(0.2 + cardsOnTableQuantity * 0.03, 0, 0);

            const controlPoint2 = new Vector3(
                (currentPosition.x + targetPosition.x) * 0.25,
                currentPosition.y,
                (currentPosition.z + targetPosition.z) * 0.25,
            );

            const controlPoint1 = new Vector3(
                (currentPosition.x + targetPosition.x) * 0.75,
                targetPosition.y,
                (currentPosition.z + targetPosition.z) * 0.75,
            );

            const curve = new CubicBezierCurve3(currentPosition, controlPoint1, controlPoint2, targetPosition);
            let lastProgress = 0;

            const onChange = ({ progress }: { progress: number }) => {
                const diff = progress - lastProgress;
                lastProgress = progress;
                if (lastProgress > 0.5) {
                    this.meshRef.quaternion.rotateTowards(targetQuaternion, Math.PI * diff * 2);
                }
                curve.getPoint(progress, this.meshRef.position);
            };

            new Tween({ progress: 0 }).to({ progress: 1 }, 400).onUpdate(onChange).onComplete(resolve).start();
        });
    }

    public putOnDeck(cardsOnTableQuantity: number) {
        return new Promise((resolve) => {
            this.meshRef.scale.z = cardsOnTableQuantity;
            const offset = (cardsOnTableQuantity * config.cardThickness) / 2;
            this.meshRef.position.y += offset;

            const { position: targetPosition, rotation: targetRotation } = this.getPositionAndRotationInDeck(
                config.cardsQuantity - cardsOnTableQuantity,
            );

            const path = new Path();
            path.moveTo(this.meshRef.position.x, this.meshRef.position.y);
            path.quadraticCurveTo(0, 0.3, targetPosition.x, targetPosition.y + offset);

            const targetQuaternion = new Quaternion().setFromEuler(targetRotation);
            let lastProgress = 0;

            const onChange = ({ progress }: { progress: number }) => {
                const diff = progress - lastProgress;
                lastProgress = progress;
                this.meshRef.quaternion.rotateTowards(targetQuaternion, Math.PI * diff);
                const position = path.getPoint(progress);
                this.meshRef.position.x = position.x;
                this.meshRef.position.y = position.y;
            };

            new Tween({ progress: 0 })
                .to({ progress: 1 }, 400)
                .onUpdate(onChange)
                .onComplete(() => {
                    this.meshRef.scale.z = 1;
                    resolve(null);
                })
                .start();
        });
    }

    public setPositionAdRotationAfterRemoveFromHand(startPosition: Vector3) {
        if (!this.props.tableGroup || !this.props.handGroup) return;
        const cardTargetPosition = this.props.handGroup.localToWorld(startPosition);
        this.props.tableGroup.worldToLocal(cardTargetPosition);
        this.meshRef.position.copy(cardTargetPosition);
        this.meshRef.quaternion.copy(this.props.camera.quaternion);
    }

    public onMouseEnter = (evt: ThreeEvent<MouseEvent>) => {
        evt.stopPropagation();
        document.body.style.cursor = "pointer";
        const addPosition = new Vector3(1.2, 1.2, 1.2);
        this.toggleCardInHand(addPosition);
    };

    public onMouseLeave = (evt: ThreeEvent<MouseEvent>) => {
        evt.stopPropagation();
        document.body.style.cursor = "default";
        const addPosition = new Vector3(1, 1, 1);
        this.toggleCardInHand(addPosition);
    };

    public onClick = (evt: ThreeEvent<MouseEvent>) => {
        evt.stopPropagation();
        events.emit(actions.CARD_CLICKED, this);
    };

    private toggleCardInHand(scale: Vector3) {
        if (!this.props.inHand || !this.props.canPlay) return;
        new Tween(this.meshRef.scale).to(scale, 50).start();
    }

    public render() {
        const { tableGroup, handGroup, inHand } = this.props;

        const parent = inHand ? handGroup : tableGroup;

        return createPortal(
            <CardMesh
                colors={this.props.colors}
                id={this.props.id}
                ref={this.prepareMeshRef}
                onMouseLeave={this.onMouseLeave}
                onMouseEnter={this.onMouseEnter}
                onClick={this.onClick}
            />,
            parent,
        );
    }
}

export default Card;
