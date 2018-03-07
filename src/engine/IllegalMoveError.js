export default class IllegalMoveError extends Error {
    constructor(message, warningEntities = [], context = {}) {
        super(message);

        this.type = 'illegal_move';

        this.warningEntities = warningEntities;
        this.context = context;
    }
}
