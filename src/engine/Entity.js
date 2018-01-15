export default class Entity {
    constructor() {
        this.hex = null;
        this.level = 0;

        this.id = Math.floor(Math.random() * 2 ** 16);
    }
}
