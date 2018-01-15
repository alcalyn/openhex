import Entity from './Entity';

export default class Unit extends Entity {
    constructor(level) {
        super();

        this.level = undefined === level ? 1 : level;
        this.played = false;
    }
}
