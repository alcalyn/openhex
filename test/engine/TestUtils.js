import { Player } from '../../src/engine';

const createTestPlayers = () => {
    return Array.apply(null, Array(6)).map(p => new Player());
};

export {
    createTestPlayers,
};
