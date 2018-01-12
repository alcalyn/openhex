import seedrandom from 'seedrandom';
import { GridGenerator } from 'react-hexgrid';
import AIPlayer from './AIPlayer';
import Hex from './Hex';
import HexUtils from './HexUtils';
import Kingdom from './Kingdom';
import LocalPlayer from './LocalPlayer';
import World from './World';

export default class WorldGenerator {
    constructor(seed) {
        this._random = seed === undefined ? seedrandom() : seedrandom(seed);
    }

    generate(players) {
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
        const world = new World(players, hexs);

        this.setPlayerColors(players);
        this.setRandomHexColors(world);
        this.initKingdoms(world);

        return world;
    }

    setPlayerColors(players) {
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
    setRandomHexColors(world) {
        const hexs = world.hexs;
        const players = world.players;
        const random = [];

        for (let i = 0; i < hexs.length; i++) {
            random.push(i);
        }

        this._shuffle(random);

        for (let i = 0; i < hexs.length; i++) {
            hexs[random[i]].player = players[i % players.length];
        }
    }

    initKingdoms(world) {
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

    hexagon(size) {
        const origin = new Hex(0, 0, 0);

        return GridGenerator.hexagon(size)
            .map(baseHex => Hex.fromBaseHex(baseHex))
            .filter(hex => !hex.isSameAs(origin))
        ;
    }

    _shuffle(array) {
        let counter = array.length;

        while (counter > 0) {
            let index = Math.floor(this._random() * counter);

            counter--;

            let temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }

        return array;
    }
}
