import config from "../config";
import addLeadingZero from "./addLeadingZero";

export default function getRandomSymbolName(): string {
    return "SYM" + addLeadingZero(Math.ceil(Math.random() * config.symbols.length));
}
