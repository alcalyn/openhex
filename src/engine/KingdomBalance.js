export default class KingdomBalance {
    constructor() {
        this.lastCapital = 0;
        this.income = 0;
        this.maintenance = 0;
    }

    diff() {
        return this.income - this.maintenance;
    }
}
