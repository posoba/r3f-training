import { useCallback } from "react";
import { events, actions } from "../events";

function DrawCardButton() {
    const onClick = useCallback(() => {
        events.emit(actions.DRAW_CARD_BUTTON_CLICKED);
    }, []);

    return (
        <button
            style={{
                cursor: "pointer",
                fontSize: 50,
                position: "absolute",
                left: 50,
                top: 50,
            }}
            onClick={onClick}
        >
            DRAW CARD
        </button>
    );
}

export default DrawCardButton;
