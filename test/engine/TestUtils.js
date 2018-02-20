import { Player, WorldGenerator } from '../../src/engine';

const createTestPlayers = () => {
    return Array.apply(null, Array(6)).map(p => new Player());
};

const generateTestWorld = (seed) => {
    return WorldGenerator.generateHexagon4NoInitialTree(createTestPlayers(), seed);
};

export {
    createTestPlayers,
    generateTestWorld,
};
