import { Hex as HexBase } from 'react-hexgrid';
import Unit from './Unit';

export default class Hex extends HexBase {
    constructor(q, r, s) {
        super(q, r, s);

        this.player = null;
        this.kingdom = null;
        this.entity = null;
    }

    static fromBaseHex(baseHex) {
        return new Hex(baseHex.q, baseHex.r, baseHex.s);
    }

    hasUnit() {
        return this.entity instanceof Unit;
    }

    getUnit() {
        if (!this.hasUnit()) {
            return null;
        }

        return this.entity;
    }

    isSameAs(hex) {
        return this.q === hex.q && this.r === hex.r && this.s === hex.s;
    }
}
