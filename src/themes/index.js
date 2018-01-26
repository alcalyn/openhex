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
}
