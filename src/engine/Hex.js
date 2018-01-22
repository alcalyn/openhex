import { Hex as HexBase } from 'react-hexgrid';
import Unit from './Unit';
import Tower from './Tower';
import Died from './Died';
import Tree from './Tree';

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

    hasTower() {
        return this.entity instanceof Tower;
    }

    hasTree() {
        return this.entity instanceof Tree;
    }

    hasDied() {
        return this.entity instanceof Died;
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
