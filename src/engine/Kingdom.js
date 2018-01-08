export default class Kingdom {
    constructor(hexs) {
        this.hexs = hexs;
        this.money = 0;
        this.player = hexs[0].player;

        this._initMoney();
    }

    _initMoney() {
        this.money = this.getSize() * 5;
    }

    getSize() {
        return this.hexs.length;
    }
}
