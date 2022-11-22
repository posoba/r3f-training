import EventEmitter from "eventemitter3";

export enum actions {
    UPDATE = "UPDATE",
}

export const events = new EventEmitter();
