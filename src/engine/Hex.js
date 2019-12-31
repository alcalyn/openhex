import { Hex as HexBase, HexUtils } from 'react-hexgrid';
import Unit from './Unit';
import Tower from './Tower';
import Died from './Died';
import Tree from './Tree';
import Capital from './Capital';

export default class Hex extends HexBase {
    constructor(q, r, s, player = null) {
        super(q, r, s);

        this.hash = HexUtils.getID(this);
        this.player = player;
        this.kingdom = null;
        this.entity = null;
    }

    static fromBaseHex(baseHex) {
        return new Hex(baseHex.q, baseHex.r, baseHex.s);
    }

    setEntity(entity) {
        this.entity = entity;

        if (null !== entity) {
            entity.hex = this;
        }
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

    hasContinentalTree() {
        return this.hasTree() && this.entity.type === Tree.CONTINENTAL;
    }

    hasCoastalTree() {
        return this.hasTree() && this.entity.type === Tree.COASTAL;
    }

    hasDied() {
        return this.entity instanceof Died;
    }

    hasCapital() {
        return this.entity instanceof Capital;
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
