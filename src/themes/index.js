import { Unit, Tower, Died, Tree, Capital } from '../engine';
import unit1Img from './default/unit-1.png';
import unit2Img from './default/unit-2.png';
import unit3Img from './default/unit-3.png';
import unit4Img from './default/unit-4.png';
import tower from './default/tower.png';
import died from './default/died.png';
import wtf from './default/wtf.png';
import capital from './default/capital.png';
import treeCoastal0 from './default/trees/coastal/tree-0.png';
import treeCoastal1 from './default/trees/coastal/tree-1.png';
import treeCoastal2 from './default/trees/coastal/tree-2.png';
import treeCoastal3 from './default/trees/coastal/tree-3.png';
import treeCoastal4 from './default/trees/coastal/tree-4.png';
import treeCoastal5 from './default/trees/coastal/tree-5.png';
import treeContinental0 from './default/trees/continental/tree-0.png';
import treeContinental1 from './default/trees/continental/tree-1.png';
import treeContinental2 from './default/trees/continental/tree-2.png';
import gold1 from './default/gold/gold_pile_1.png';
import gold2 from './default/gold/gold_pile_2.png';
import gold3 from './default/gold/gold_pile_3.png';
import gold4 from './default/gold/gold_pile_4.png';
import gold5 from './default/gold/gold_pile_5.png';
import gold6 from './default/gold/gold_pile_6.png';
import gold7 from './default/gold/gold_pile_7.png';
import gold8 from './default/gold/gold_pile_8.png';
import gold9 from './default/gold/gold_pile_9.png';
import gold10 from './default/gold/gold_pile_10.png';
import gold16 from './default/gold/gold_pile_16.png';
import gold19 from './default/gold/gold_pile_19.png';
import gold23 from './default/gold/gold_pile_23.png';
import gold25 from './default/gold/gold_pile_25.png';

export default class Themes {
    static units = {
        1: unit1Img,
        2: unit2Img,
        3: unit3Img,
        4: unit4Img,
    };

    static trees = {
        coastal: [
            treeCoastal0,
            treeCoastal1,
            treeCoastal2,
            treeCoastal3,
            treeCoastal4,
            treeCoastal5,
        ],
        continental: [
            treeContinental0,
            treeContinental1,
            treeContinental2,
        ],
    };

    static getImageFor(entity) {
        if (entity instanceof Unit) {
            return this.units[entity.level];
        }

        if (entity instanceof Tower) {
            return tower;
        }

        if (entity instanceof Died) {
            return died;
        }

        if (entity instanceof Capital) {
            return capital;
        }

        if (entity instanceof Tree) {
            if (entity.type === Tree.COASTAL) {
                return this.trees.coastal[entity.id % 6];
            }

            if (entity.type === Tree.CONTINENTAL) {
                return this.trees.continental[entity.id % 3];
            }
        }

        return wtf;
    }

    static getImageForMoney(amount) {
        switch (true) {
            case 0 === amount: return gold1;

            case 1 === amount: return gold1;
            case 2 === amount: return gold2;
            case 3 === amount: return gold3;
            case 4 === amount: return gold4;
            case 5 === amount: return gold5;
            case 6 === amount: return gold6;
            case 7 === amount: return gold7;
            case 8 === amount: return gold8;
            case 9 === amount: return gold9;
            case 10 === amount: return gold10;

            case amount <= 16: return gold16;
            case amount <= 19: return gold19;
            case amount <= 23: return gold23;
            case amount <= 25: return gold25;

            case amount > 25: return gold25;

            default: return gold1;
        }
    }
}
