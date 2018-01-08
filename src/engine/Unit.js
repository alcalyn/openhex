import Entity from './Entity';

export default class Unit extends Entity {
    constructor() {
        super();

        this.level = 0;
        this.played = false;
    }
}
