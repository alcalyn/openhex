import { GridGenerator } from 'react-hexgrid';
import AIPlayer from './AIPlayer';
import Hex from './Hex';
import HexUtils from './HexUtils';
import TreeUtils from './TreeUtils';
import Kingdom from './Kingdom';
import LocalPlayer from './LocalPlayer';
import World from './World';

export default class WorldGenerator {
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
        const world = new World(players, hexs, { seed, treesInitialSpawn: false });

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
        const players = world.players;
        const array = [];

        for (let i = 0; i < hexs.length; i++) {
            array.push(i);
        }

        this._shuffle(array, world.random);

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
