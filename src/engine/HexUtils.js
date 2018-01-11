import { HexUtils as HexUtilsBase } from 'react-hexgrid';
import Unit from './Unit';

export default class HexUtils extends HexUtilsBase {
    static neighboursHexs(world, hex) {
        return this
            .neighbours(hex)
            .map(neighbourCoords => world.getHexAt(neighbourCoords))
            .filter(hex => hex !== undefined)
        ;
    }

    static neighboursHexsSamePlayer(world, hex) {
        return this
            .neighboursHexs(world, hex)
            .filter(neighbourHex => neighbourHex.player === hex.player)
        ;
    }

    static getAllAdjacentHexs(world, originHex) {
        world.hexs.forEach(hex => hex._adjacent = false);

        const flagAdjacents = hex => {
            hex._adjacent = true;

            this.neighboursHexsSamePlayer(world, hex)
                .forEach(hex => {
                    if (hex._adjacent) {
                        return;
                    }

                    hex._adjacent = true;
                    flagAdjacents(hex);
                })
            ;
        }

        flagAdjacents(originHex);

        const adjacentHexs = world.hexs.filter(hex => hex._adjacent);

        world.hexs.forEach(hex => delete hex._adjacent);

        return adjacentHexs;
    }

    static isHexAdjacentKingdom(world, hex, kingdom) {
        if (null !== hex.kingdom && hex.kingdom === kingdom) {
            return false;
        }

        return this.neighboursHexs(world, hex).some(hex => hex.kingdom === kingdom);
    }

    static mergeKingdomsOnCapture(world, lastCapturedHex) {
        const capturingKingdom = lastCapturedHex.kingdom;
        const capturingPlayer = capturingKingdom.player;

        const singleHexs = [];
        const alliedKingdoms = [capturingKingdom];

        this.neighboursHexs(world, lastCapturedHex).forEach(hex => {
            if (null === hex.kingdom) {
                if (hex.player === capturingPlayer) {
                    singleHexs.push(hex);
                }
            } else {
                if (hex.kingdom !== capturingKingdom) {
                    if (hex.kingdom.player === capturingPlayer) {
                        alliedKingdoms.push(hex.kingdom);
                    }
                }
            }
        });

        let widestKingdom = alliedKingdoms[0];

        if (alliedKingdoms.length > 1) {
            alliedKingdoms.forEach(kingdom => {
                if (kingdom.hexs.length > widestKingdom.hexs.length) {
                    widestKingdom = kingdom;
                }
            });

            alliedKingdoms.forEach(alliedKingdom => {
                if (alliedKingdom === widestKingdom) {
                    return;
                }

                alliedKingdom.hexs.forEach(hex => {
                    hex.kingdom = widestKingdom;
                    widestKingdom.hexs.push(hex);
                });

                widestKingdom.money += alliedKingdom.money;
                alliedKingdom.money = 0;
                world.kingdoms = world.kingdoms.filter(worldKingdom => worldKingdom !== alliedKingdom);
            });
        }

        singleHexs.forEach(hex => {
            hex.kingdom = widestKingdom;
            widestKingdom.hexs.push(hex);
        });
    }

    static getKingdomIncome(kingdom) {
        return kingdom.hexs.length;
    }

    static getKingdomMaintenanceCost(kingdom) {
        let cost = 0;

        kingdom.hexs.forEach(hex => {
            if (hex.entity instanceof Unit) {
                cost += this.getUnitMaintenanceCost(hex.entity);
            }
        });

        return cost;
    }

    static getUnitMaintenanceCost(unit) {
        return 2 * (3 ** (unit.level - 1));
    }

    /**
     * Returns all units that can be an obstacle
     * when capturing a hex.
     *
     * @param {World} world
     * @param {Hex} hex
     *
     * @returns {Unit[]} Protecting units, from the strongest to the weakest.
     */
    static getProtectingUnits(world, hex) {
        const protectingUnits = [];

        this.neighboursHexsSamePlayer(world, hex)
            .concat([hex])
            .forEach(hex => {
                if (hex.hasUnit()) {
                    protectingUnits.push(hex.entity);
                }
            })
        ;

        protectingUnits.sort((unitA, unitB) => {
            return unitA.level < unitB.level;
        });

        return protectingUnits;
    }
}
