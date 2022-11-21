import { SpringValue, AnimationResult, SpringRef } from "react-spring";
import { Path, Vector2 } from "three";

import { Card } from "./CardMesh";
import config from "../../config";
import wait from "../../utils/wait";

class CardAnimationManager {
    private springApi: SpringRef;
    private cardShowPosition: Vector2;
    private showedCardPosition: Vector2;

    constructor(springApi: SpringRef) {
        this.springApi = springApi;
        this.cardShowPosition = new Vector2(0.18, 0.3);
        this.showedCardPosition = new Vector2(0.2, 0);
    }

    public showCard(card: Card) {
        return new Promise<void>(async (resolve) => {
            await this.rotateAndGoToShowPosition(card);
            await wait(200);
            await this.putCardOnTable(card);
            resolve();
        });
    }

    private rotateAndGoToShowPosition(card: Card) {
        return new Promise((resolve) => {
            const path = new Path();
            path.moveTo(card.position.x, card.position.y);
            path.quadraticCurveTo(
                (card.position.x + this.cardShowPosition.x) / 2,
                card.position.y,
                this.cardShowPosition.x,
                this.cardShowPosition.y,
            );

            const onChange = (result: AnimationResult<SpringValue>) => {
                const position = path.getPoint(result.value.progress);
                card.position.x = position.x;
                card.position.y = position.y;
                card.rotation.y = -Math.PI * result.value.progress;
            };

            this.springApi.start({
                from: { progress: 0 },
                to: { progress: 1 },
                config: { duration: 300 },
                onChange,
                onResolve: resolve,
            });
        });
    }

    putCardOnTable(card: Card) {
        return new Promise((resolve) => {
            card.rotation.y = -Math.PI * 1.005;
            const path = new Path();
            path.moveTo(this.cardShowPosition.x, this.cardShowPosition.y);
            path.quadraticCurveTo(
                this.cardShowPosition.x,
                0,
                this.showedCardPosition.x + (config.cardsQuantity - card.index) * 0.03,
                0,
            );

            const onChange = (result: AnimationResult<SpringValue>) => {
                const position = path.getPoint(result.value.progress);
                card.position.x = position.x;
                card.position.y = position.y;
            };

            this.springApi.start({
                from: { progress: 0 },
                to: { progress: 1 },
                config: { duration: 300 },
                onChange,
                onResolve: resolve,
            });
        });
    }

    public addCardsToDeck(cardsToHide: Card[]) {
        return new Promise<void>(async (resolve) => {
            const lastCard = cardsToHide[0];
            await this.collectCards(cardsToHide);
            cardsToHide.forEach((card) => (card.rotation.y = -Math.PI));
            await wait(200);
            await this.putCardsOnDeck(cardsToHide);

            lastCard.scale.z = 1;
            cardsToHide.forEach((card) => {
                card.visible = true;
                card.position.copy(card.startPosition);
                card.rotation.y = 0;
                card.showed = false;
            });

            resolve();
        });
    }

    private collectCards(cardsToHide: Card[]) {
        return new Promise((resolve) => {
            const lastCard = cardsToHide[0];
            const distance = lastCard.position.x - this.showedCardPosition.x;
            const onChange = (result: AnimationResult<SpringValue>) => {
                const positionX = this.showedCardPosition.x + (1 - result.value.progress) * distance;
                cardsToHide.forEach((card) => {
                    if (card.position.x >= positionX) {
                        card.position.x = positionX;
                        card.position.y =
                            (config.cardsQuantity - card.index) * config.cardThickness * result.value.progress;
                    }
                });
            };

            this.springApi.start({
                from: { progress: 0 },
                to: { progress: 1 },
                config: { duration: cardsToHide.length * 50 },
                onChange,
                onResolve: resolve,
            });
        });
    }

    private putCardsOnDeck(cardsToHide: Card[]) {
        return new Promise((resolve) => {
            const lastCard = cardsToHide[0];
            cardsToHide.forEach((card) => (card.visible = false));
            lastCard.visible = true;

            lastCard.scale.z = cardsToHide.length;
            const offset = (cardsToHide.length * config.cardThickness) / 2;
            lastCard.position.y += offset;

            const path = new Path();
            path.moveTo(lastCard.position.x, lastCard.position.y);
            path.quadraticCurveTo(
                lastCard.position.x - lastCard.startPosition.x,
                0.5,
                lastCard.startPosition.x,
                lastCard.startPosition.y + offset,
            );

            const onChange = (result: AnimationResult<SpringValue>) => {
                const position = path.getPoint(result.value.progress);

                lastCard.position.x = position.x;
                lastCard.position.y = position.y;
                lastCard.rotation.y = -Math.PI * (1 - result.value.progress);
            };

            this.springApi.start({
                from: { progress: 0 },
                to: { progress: 1 },
                config: { duration: 200 },
                onChange,
                onResolve: resolve,
            });
        });
    }
}

export default CardAnimationManager;
