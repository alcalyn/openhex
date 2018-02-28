import HexUtils from './HexUtils';
import Tree from './Tree';

export default class TreeUtils {
    static createTreeForHex(world, hex) {
        const treeType = HexUtils.isHexCoastal(world, hex) ? Tree.COASTAL : Tree.CONTINENTAL;
        const tree = new Tree(treeType);

        tree.hex = hex;

        return tree;
    }

    /**
     * Create some trees at the beginning of the  world
     *
     * @param {World} world
     */
    static spawnInitialTrees(world) {
        world.hexs
            .filter(hex => null === hex.entity)
            .filter(() => world.config.random() < world.config.treesInitialSpawnProba)
            .forEach(hex => {
                hex.entity = this.createTreeForHex(world, hex);
            })
        ;
    }

    static spawnTrees(world) {
        this.spawnCoastalTrees(world);
        this.spawnContinentalTrees(world);
    }

    static spawnCoastalTrees(world) {
        const potentialGrowHexs = [];

        world.hexs
            .filter(hex => hex.hasCoastalTree())
            .forEach(hex => {
                HexUtils.neighboursHexs(world, hex)
                    .filter(neighboursHex => HexUtils.isHexCoastal(world, neighboursHex))
                    .filter(neighboursHex => null === neighboursHex.entity)
                    .forEach(neighboursHex => potentialGrowHexs.push(neighboursHex))
                ;
            })
        ;

        potentialGrowHexs
            .filter(() => this.getProbabilityCoastalTreeSpawns(world))
            .forEach(hex => hex.entity = new Tree(Tree.COASTAL))
        ;
    }

    static spawnContinentalTrees(world) {
        const potentialGrowHexs = [];

        world.hexs
            .filter(hex => hex.hasContinentalTree())
            .forEach(hex => {
                HexUtils.neighboursHexs(world, hex)
                    .filter(neighboursHex => !HexUtils.isHexCoastal(world, neighboursHex))
                    .filter(neighboursHex => null === neighboursHex.entity)
                    .forEach(neighboursHex => potentialGrowHexs.push(neighboursHex))
                ;
            })
        ;

        potentialGrowHexs
            .filter(() => this.getProbabilityContinentalTreeSpawns(world))
            .forEach(hex => hex.entity = new Tree(Tree.CONTINENTAL))
        ;
    }

    static getProbabilityCoastalTreeSpawns(world) {
        const proba = this.proba(world, world.config.treesGrowMaxProbaCoastal);

        return world.config.random() < proba;
    }

    static getProbabilityContinentalTreeSpawns(world) {
        const proba = this.proba(world, world.config.treesGrowMaxProbaContinental);

        return world.config.random() < proba;
    }

    static proba(world, maxProba) {
        return (1 - Math.E ** (-world.turn * world.config.treesGrowOverTime)) * maxProba / world.config.players.length;
    }
}
