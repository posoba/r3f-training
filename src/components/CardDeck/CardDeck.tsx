import { Vector3, MeshStandardMaterial } from "three";
import { useCallback, useMemo, useState } from "react";
import { useSpring } from "react-spring";
import CardMesh, { Card } from "./CardMesh";
import config from "../../config";
import CardAnimationManager from "./CardAnimationManager";

interface CardData {
  index: number;
  frontMaterial: MeshStandardMaterial;
}

interface CardRefs {
  [id: number]: Card;
}
const cardsData: CardData[] = new Array(config.cardsQuantity)
  .fill(0)
  .map((el, index) => {
    return {
      index,
      frontMaterial: new MeshStandardMaterial({
        color: config.cardColors[index],
      }),
    };
  });

function CardDeck() {
  const cardRefs: CardRefs = useMemo(() => ({}), []);
  const springApi = useSpring({}, [])[1];
  const cardAnimationManager = useMemo(
    () => new CardAnimationManager(springApi),
    [springApi]
  );
  const [deckTopCardIndex, setDeckTopCardIndex] = useState(
    cardsData.length - 1
  );
  const [canPlay, setCanPlay] = useState(true);

  const showCard = useCallback(
    async (card: Card) => {
      await cardAnimationManager.showCard(card);
      card.showed = true;
      setCanPlay(true);
      setDeckTopCardIndex((index) => index - 1);
    },
    [cardAnimationManager]
  );

  const hideDeck = useCallback(async () => {
    const cardsToHide = Object.values(cardRefs).filter((card) => card.showed);
    await cardAnimationManager.addCardsToDeck(cardsToHide);
    setCanPlay(true);
    setDeckTopCardIndex(cardsData.length - 1);
  }, [cardRefs, cardAnimationManager]);

  return (
    <group
      position={new Vector3(0.2, 0.006, -0.2)}
      onClick={(evt) => {
        evt.stopPropagation();
        if (!canPlay) return;
        setCanPlay(false);
        const isCardShowed = (evt.object as Card).showed;
        isCardShowed ? hideDeck() : showCard(cardRefs[deckTopCardIndex]);
      }}
    >
      {cardsData.map(({ index, frontMaterial }) => (
        <CardMesh
          key={index}
          frontMaterial={frontMaterial}
          ref={(card: Card) => {
            if (!card || cardRefs[index]) return;
            card.index = index;
            card.position.y = index * config.cardThickness;
            card.startPosition = card.position.clone();
            card.rotation.x = Math.PI / 2;
            card.showed = false;
            cardRefs[index] = card;
          }}
        />
      ))}
    </group>
  );
}

export default CardDeck;
