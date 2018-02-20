import seedrandom from 'seedrandom';
import HexUtils from './HexUtils';
import Unit from './Unit';
import WorldConfig from './WorldConfig';

export default class World {
    static defaultConfig = WorldConfig;

    constructor(players, hexs, config = { ...World.defaultConfig }) {
        this.players = players;
        this.hexs = hexs;
        this.config = {
            ...World.defaultConfig,
            ...config,
        };

        this.kingdoms = [];
        this.turn = 0;
        this.random = seedrandom(this.config.seed);

        this._initHexMap();
    }

    _initHexMap() {
        this._hexMap = new Map();

        this.hexs.forEach(hex => {
            this._hexMap.set(HexUtils.getID(hex), hex);
        });
    }

    getHexAt(hex) {
        return this._hexMap.get(HexUtils.getID(hex));
    }

    getKingdomAt(hex) {
        return this.getHexAt(hex).kingdom;
    }

    removeUnitAt(coords) {
        const hex = this.getHexAt(coords);
        const entity = hex.entity;

        if (!entity instanceof Unit) {
            throw new Error('No unit on this hex');
        }

        entity.hex = null;
        hex.entity = null;

        return entity;
    }

    getEntityAt(coords) {
        return this.getHexAt(coords).entity;
    }

    setEntityAt(coords, entity) {
        this.getHexAt(coords).setEntity(entity);
    }

    removeKingdom(kingdom) {
        this.kingdoms = this.kingdoms.filter(k => k !== kingdom);
    }
}
