import LocalPlayer from './LocalPlayer';
import AIPlayer from './AIPlayer';

const defaults = {
    /**
     * Random number generator to use. Must generate numbers in [0; 1[
     * Used to provide a known seed random function.
     * By default Math.random.
     */
    random: Math.random,

    /**
     * Size of the map, should be at least 4.
     * Examples: Small=10 Medium=14 Big=18
     */
    size: 14,

    /**
     * Array of players.
     * By default generates a singleplayer VS 5 AI
     */
    players: [
        new LocalPlayer(),
        new AIPlayer(),
        new AIPlayer(),
        new AIPlayer(),
        new AIPlayer(),
        new AIPlayer(),
    ],

    /**
     * Whether trees has spawn before the game starts.
     */
    treesInitialSpawn: true,

    /**
     * Probability to spawn a tree on a hex
     * before the game starts.
     */
    treesInitialSpawnProba: 1 / 16,

    /**
     * False to prevent trees growing
     */
    treesGrowEnabled: true,

    /**
     * 100% means 63% at first turn,
     * and about 5 turns to reach max proba.
     *
     * MAX PROBA: the probability that
     * a tree grow on an adjacent empty hex.
     * It starts from zero
     * and is reached more and more while the game last.
     *
     * This proba is divided by the numbers of players
     * to limit trees over growing during others players turn.
     */
    treesGrowOverTime: 0.1,

    /**
     * Max probability for a continental tree to grow.
     */
    treesGrowMaxProbaContinental: 0.25,

    /**
     * Max probability for a coastal tree to grow.
     */
    treesGrowMaxProbaCoastal: 1.0,
};

export default config => {
    return {
        ...defaults,
        ...config,
    };
};
