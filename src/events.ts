import EventEmitter from "eventemitter3";

export enum actions {
    UPDATE = "UPDATE",
    SET_CAMERA_CONTROL_ENABLED = "SET_CAMERA_CONTROL_ENABLED",
    DRAW_CARD_BUTTON_CLICKED = "DRAW_CARD_BUTTON_CLICKED",
    CARD_CLICKED = "CARD_CLICKED",
}

export const events = new EventEmitter();
