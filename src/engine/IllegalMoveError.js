export default class IllegalMoveError extends Error {
    constructor(message, warningEntities = []) {
        super(message);

        this.type = 'illegal_move';

        this.warningEntities = warningEntities;
    }
}
