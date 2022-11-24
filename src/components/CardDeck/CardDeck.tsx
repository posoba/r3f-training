import { Group } from "three";
import { Component } from "react";
import { RootState } from "@react-three/fiber";
import { Tween } from "@tweenjs/tween.js";

import Card from "./Card";

import config from "../../config";
import { events, actions } from "../../events";
import wait from "../../utils/wait";

interface State {
    cardsInHand: Card[];
    cardsInDeck: Card[];
    cardsOnTable: Card[];
    canPlay: boolean;
}

interface Props {
    threeState: RootState;
    handGroup: Group;
    tableGroup: Group;
}

interface CardData {
    id: number;
    colors: number[];
}

const cardsData = new Array(config.cardsQuantity).fill(0).map(
    (el, index): CardData => ({
        id: index,
        colors: config.cardColors[index],
    }),
);

class CardDeck extends Component<Props> {
    cardsRefs: { [id: number]: Card };
    state: State;

    constructor(props: Props) {
        super(props);
        this.cardsRefs = {};
        this.state = {
            cardsInHand: [],

            cardsInDeck: [],
            cardsOnTable: [],
            canPlay: true,
        };
    }

    public componentDidMount() {
        const cardsInDeck = Object.values(this.cardsRefs);
        cardsInDeck.forEach((card, index) => card.setPositionAndRotationInDeck(index));
        this.setState({ cardsInDeck });
        events.on(actions.DRAW_CARD_BUTTON_CLICKED, this.drawCard, this);
        events.on(actions.CARD_CLICKED, this.onCardClicked, this);
    }

    public componentWillUnmount() {
        events.off(actions.DRAW_CARD_BUTTON_CLICKED, this.drawCard, this);
        events.off(actions.CARD_CLICKED, this.onCardClicked, this);
    }

    private setStateAsync(updater: any) {
        return new Promise<void>((resolve) => {
            this.setState(updater, resolve);
        });
    }

    private setCanPlay(bool: boolean) {
        this.setState({ canPlay: bool });
    }

    private setCameraControlEnabled(bool: boolean) {
        events.emit(actions.SET_CAMERA_CONTROL_ENABLED, bool);
    }

    private updateInHandPositions(ignoreCard?: Card) {
        return new Promise((resolve) => {
            const waitPromises = this.state.cardsInHand.map((el, index) =>
                el === ignoreCard ? Promise.resolve() : el.updateInHandPosition(index, this.state.cardsInHand.length),
            );
            Promise.all(waitPromises).then(resolve);
        });
    }

    private onCardClicked(card: Card) {
        if (!this.state.canPlay) return;
        if (this.state.cardsInDeck.includes(card)) return this.drawCard();
        if (this.state.cardsInHand.includes(card)) return this.putCardOnTable(card);
        this.collectCards();
    }

    private async drawCard() {
        const card = this.state.cardsInDeck[this.state.cardsInDeck.length - 1];
        if (!card) return;
        this.setCanPlay(false);
        this.setCameraControlEnabled(false);
        await card.travelToCamera();
        await this.setStateAsync((state: State) => ({
            cardsInDeck: state.cardsInDeck.filter((el) => el !== card),
            cardsInHand: [...state.cardsInHand, card],
        }));
        this.setCameraControlEnabled(true);
        await wait(300);
        this.updateInHandPositions(card);
        await card.travelToHand(this.state.cardsInHand.length - 1, this.state.cardsInHand.length);
        this.setCanPlay(true);
    }

    private async putCardOnTable(card: Card) {
        if (!card) return;
        this.setCanPlay(false);
        this.setCameraControlEnabled(false);
        const startPosition = card.meshRef.position.clone();
        await this.setStateAsync((state: State) => ({
            cardsInHand: state.cardsInHand.filter((el) => el !== card),
            cardsOnTable: [...state.cardsOnTable, card],
        }));
        card.setPositionAdRotationAfterRemoveFromHand(startPosition);
        this.updateInHandPositions();
        await card.travelToBoard(this.state.cardsOnTable.length);
        this.setCameraControlEnabled(true);
        this.setCanPlay(true);
    }

    private async collectCards() {
        this.setCanPlay(false);
        await this.collectCardsAnimation();
        const lastCard = this.state.cardsOnTable[this.state.cardsOnTable.length - 1];
        this.state.cardsOnTable.forEach((card) => (card.meshRef.visible = false));
        lastCard.meshRef.visible = true;
        await lastCard.putOnDeck(this.state.cardsOnTable.length);
        await this.setStateAsync((state: State) => ({
            cardsInDeck: [...state.cardsInDeck, ...state.cardsOnTable.reverse()],
            cardsOnTable: [],
        }));
        this.state.cardsInDeck.forEach((card, index) => {
            card.setPositionAndRotationInDeck(index);
            card.meshRef.visible = true;
        });
        this.setCanPlay(true);
    }

    private collectCardsAnimation() {
        return new Promise((resolve) => {
            const lastCard = this.state.cardsOnTable[this.state.cardsOnTable.length - 1];
            const cardMesh = lastCard.meshRef;
            const distance = cardMesh.position.x - config.collectCardsPositionX;

            const onChange = ({ progress }: { progress: number }) => {
                const positionX = config.collectCardsPositionX + (1 - progress) * distance;
                this.state.cardsOnTable.forEach((card, index) => {
                    if (card.meshRef.position.x >= positionX) {
                        card.meshRef.position.x = positionX;
                        card.meshRef.position.y = index * config.cardThickness * progress;
                    }
                });
            };

            new Tween({ progress: 0 })
                .to({ progress: 1 }, this.state.cardsOnTable.length * 50)
                .onUpdate(onChange)
                .onComplete(() => {
                    this.state.cardsOnTable.forEach((card) => (card.meshRef.rotation.y = 0));
                    resolve(null);
                })
                .start();
        });
    }

    public render() {
        const { handGroup, tableGroup, threeState } = this.props;
        const { cardsInHand, canPlay } = this.state;

        return (
            <>
                {cardsData.map(({ colors, id }) => (
                    <Card
                        ref={(ref) => {
                            if (!ref) return;
                            this.cardsRefs[id] = ref;
                        }}
                        key={id}
                        id={id}
                        colors={colors}
                        camera={threeState.camera}
                        handGroup={handGroup}
                        tableGroup={tableGroup}
                        inHand={cardsInHand.includes(this.cardsRefs[id])}
                        canPlay={canPlay}
                    />
                ))}
            </>
        );
    }
}

export default CardDeck;
