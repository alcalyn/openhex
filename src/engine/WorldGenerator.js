import seedrandom from 'seedrandom';
import { GridGenerator } from 'react-hexgrid';
import AIPlayer from './AIPlayer';
import Hex from './Hex';
import HexUtils from './HexUtils';
import TreeUtils from './TreeUtils';
import Kingdom from './Kingdom';
import LocalPlayer from './LocalPlayer';
import World from './World';
import WorldConfig from './WorldConfig';
import diamondSquare from './diamondSquare';

export default class WorldGenerator {
    /**
     * @param {mixed} seed Seed used to generate the map and for game random events (trees...)
     * @param {int} size Size of the map, should be at least 4.
     *                   Examples: Small: 10   Medium: 14  Big: 18
     * @param {Object} An object generated with WorldConfig({defaults...}) function.
     *
     * @returns {World}
     */
    static generate(seed = null, size = 14, config = WorldConfig()) {
        config.random = seedrandom(seed);

        const worldHexsLength = Math.floor((size * 8) / config.players.length) * config.players.length;
        const depth = 8;
        const pixels = 2 ** depth + 1;
        const roughness = Math.log(size);
        const heights = diamondSquare(depth, true, roughness, config.random);
        const worldHexs = [];
        const hexs = [];
        const hexsMap = new Map();
        const byHeight = (hexA, hexB) => {
            return hexA._height < hexB._height ? 1 : -1;
        };

        for (let r = -size; r < size; r++) {
            let offset = r >> 1;
            let qIndex = 0;
            for (let q = -offset - size; q < size - offset; q++) {

                let { x, y } = { x: qIndex, y: r + size };
                let pixel = {
                    x: Math.floor(pixels * x / (size * 2)),
                    y: Math.floor(pixels * y / (size * 2)),
                };

                const hex = new Hex(q, r, -q-r);
                hex._height = heights[pixel.x][pixel.y];

                hexs.push(hex);

                qIndex++;
            }
        }

        hexs.forEach(hex => {
            hexsMap.set(HexUtils.getID(hex), hex);
        });

        hexs.sort(byHeight);

        worldHexs.push(hexs[0]);

        do {
            const adjacentHexs = HexUtils
                .getHexsAdjacentToHexs(worldHexs)
                .map(hex => hexsMap.get(HexUtils.getID(hex)))
                .filter(hex => undefined !== hex)
            ;

            adjacentHexs.sort(byHeight);

            worldHexs.push(adjacentHexs[0]);
        } while (worldHexs.length < worldHexsLength);

        const world = new World(worldHexs, config);

        this.setPlayerColors(config.players);
        this.setRandomHexColors(world);
        this.initKingdoms(world);
        this.createCapitals(world);
        this.spawnInitialTrees(world);

        return world;
    }

    static generateHexagon4NoInitialTree(players, seed) {
        if (!players) {
            players = [
                new LocalPlayer(),
                new AIPlayer(),
                new AIPlayer(),
                new AIPlayer(),
                new AIPlayer(),
                new AIPlayer(),
            ];
        }

        const hexs = this.hexagon(4);
        const world = new World(hexs, WorldConfig({ players, random: seedrandom(seed), treesInitialSpawn: false }));

        this.setPlayerColors(players);
        this.setRandomHexColors(world);
        this.initKingdoms(world);
        this.createCapitals(world);

        return world;
    }

    static generateHexagon4(players, seed) {
        const world = this.generateHexagon4NoInitialTree(players, seed);

        this.spawnInitialTrees(world);

        return world;
    }

    static setPlayerColors(players) {
        for (let i = 0; i < players.length; i++) {
            players[i].color = i;
        }
    }

    /**
     * Set random color to all hexs,
     * but make sure there is the same number of hexs with same color.
     *
     * @argument {World} world
     */
    static setRandomHexColors(world) {
        const hexs = world.hexs;
        const players = world.config.players;
        const array = [];

        for (let i = 0; i < hexs.length; i++) {
            array.push(i);
        }

        this._shuffle(array, world.config.random);

        for (let i = 0; i < hexs.length; i++) {
            hexs[array[i]].player = players[i % players.length];
        }
    }

    static initKingdoms(world) {
        world.hexs.forEach(hex => {
            if (hex.kingdom) {
                return;
            }

            const hexs = HexUtils.getAllAdjacentHexs(world, hex);

            if (hexs.length < 2) {
                return;
            }

            const kingdom = new Kingdom(hexs);

            world.kingdoms.push(kingdom);
            hexs.forEach(hex => hex.kingdom = kingdom);
        });
    }

    static createCapitals(world) {
        world.kingdoms.forEach(kingdom => {
            HexUtils.createKingdomCapital(world, kingdom);
        });
    }

    static hexagon(size) {
        const origin = new Hex(0, 0, 0);

        return GridGenerator.hexagon(size)
            .map(baseHex => Hex.fromBaseHex(baseHex))
            .filter(hex => !hex.isSameAs(origin))
        ;
    }

    static spawnInitialTrees(world) {
        TreeUtils.spawnInitialTrees(world);
    }

    static _shuffle(array, random) {
        let counter = array.length;

        while (counter > 0) {
            let index = Math.floor(random() * counter);

            counter--;

            let temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }

        return array;
    }
}
