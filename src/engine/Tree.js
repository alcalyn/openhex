import Entity from './Entity';

export default class Tree extends Entity {
    static CONTINENTAL = false;
    static COASTAL = true;

    constructor(type) {
        super();

        this.type = Tree.CONTINENTAL;

        if (undefined !== type) {
            this.type = type;
        }
    }
}
