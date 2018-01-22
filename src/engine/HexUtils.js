import { HexUtils as HexUtilsBase } from 'react-hexgrid';
import Unit from './Unit';
import Kingdom from './Kingdom';
import Tree from './Tree';

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

    /**
     * Check if capturing lastCapturedHex can merge kingdoms into one.
     *
     * @param {World} world
     * @param {Hex} lastCapturedHex
     *
     * @returns {Callback} Callback to call to undo the merge operations
     */
    static mergeKingdomsOnCapture(world, lastCapturedHex) {
        const undoCallbacks = [];
        const capturingKingdom = lastCapturedHex.kingdom;
        const capturingPlayer = capturingKingdom.player;

        const singleHexs = [];
        const alliedKingdoms = [capturingKingdom];

        this.neighboursHexs(world, lastCapturedHex)
            .filter(hex => hex.player === capturingPlayer)
            .forEach(hex => {
                if (null === hex.kingdom) {
                    singleHexs.push(hex);
                } else {
                    if (hex.kingdom !== capturingKingdom) {
                        alliedKingdoms.push(hex.kingdom);
                    }
                }
            })
        ;

        alliedKingdoms.sort((kingdomA, kingdomB) => {
            return kingdomB.hexs.length > kingdomA.hexs.length;
        });

        const widestKingdom = alliedKingdoms[0];
        const removedKingdoms = alliedKingdoms.slice(1);

        removedKingdoms.forEach(alliedKingdom => {
            alliedKingdom.hexs.forEach(hex => {
                const lastHexKingdom = hex.kingdom;
                hex.kingdom = widestKingdom;
                widestKingdom.hexs.push(hex);

                undoCallbacks.push(() => {
                    hex.kingdom = lastHexKingdom;
                    widestKingdom.removeHex(hex);
                });
            });

            widestKingdom.money += alliedKingdom.money;
            world.removeKingdom(alliedKingdom);

            undoCallbacks.push(() => {
                widestKingdom.money -= alliedKingdom.money;
                world.kingdoms.push(alliedKingdom);
            });
        });

        singleHexs.forEach(hex => {
            const lastHexKingdom = hex.kingdom;
            hex.kingdom = widestKingdom;
            widestKingdom.hexs.push(hex);

            undoCallbacks.push(() => {
                hex.kingdom = lastHexKingdom;
                widestKingdom.removeHex(hex);
            });
        });

        return () => {
            undoCallbacks
                .reverse()
                .forEach(undoCallback => undoCallback())
            ;
        };
    }

    /**
     * @param {World} world
     * @param {Hex} lastCapturedHex
     *
     * @returns {Callback} Callback to call to undo kingdom split
     */
    static splitKingdomsOnCapture(world, lastCapturedHex) {
        let undoCallbacks = false;

        this.neighboursHexs(world, lastCapturedHex)
            .filter(neighboursHex => neighboursHex.kingdom !== null)
            .filter(neighboursHex => neighboursHex.kingdom !== lastCapturedHex.kingdom)
            .some(opponentHex => {
                undoCallbacks = this.splitKingdom(world, opponentHex.kingdom);

                return false !== undoCallbacks;
            })
        ;

        return undoCallbacks ? undoCallbacks : () => {};
    }

    /**
     * @param {World} world
     * @param {Kingdom} kingdom
     *
     * @returns {Callback} Callback to call to undo kingdom split
     */
    static splitKingdom(world, kingdom) {
        const undoCallbacks = [];

        if (this.getAllAdjacentHexs(world, kingdom.hexs[0]).length === kingdom.getSize()) {
            return false;
        }

        let kingdomHexs = kingdom.hexs.slice();

        const subKingdoms = [];
        const singleHexs = [];
        const splittedKingdoms = [];

        // Calculate all kingdom fragments
        while (kingdomHexs.length > 0) {
            let subKingdom = this.getAllAdjacentHexs(world, kingdomHexs[0]);

            if (1 === subKingdom.length) {
                singleHexs.push(subKingdom[0]);
            } else {
                subKingdoms.push(subKingdom);
            }

            kingdomHexs = kingdomHexs.filter(hex => -1 === subKingdom.indexOf(hex));
        }

        // Put the widest kingdom at first
        subKingdoms.sort((subKingdomA, subKingdomB) => {
            return subKingdomB.length > subKingdomA;
        });

        // Single hexs created by cutting have no longer kingdom
        singleHexs.forEach(singleHex => {
            const lastHexKingdom = singleHex.kingdom;
            singleHex.kingdom = null;

            undoCallbacks.push(() => {
                singleHex.kingdom = lastHexKingdom;
            });
        });

        // Create new kingdoms with a new economy
        subKingdoms.slice(1).forEach(subKingdom => {
            const splittedKingdom = new Kingdom(subKingdom);

            splittedKingdom.money = Math.round(kingdom.money * (subKingdom.length / kingdom.getSize()));
            splittedKingdoms.push(splittedKingdom);

            undoCallbacks.push(() => {
                splittedKingdom.hexs.forEach(hex => {
                    hex.kingdom = kingdom;
                });
            });
        });

        // Truncate cut hexs from main kingdom (if the main kingdom has not been slashed)
        if (subKingdoms.length > 0) {
            const truncatedHexs = kingdom.hexs.filter(hex => !subKingdoms[0].includes(hex));

            kingdom.hexs = kingdom.hexs.filter(hex => !truncatedHexs.includes(hex));

            undoCallbacks.push(() => {
                truncatedHexs.forEach(truncatedHex => kingdom.hexs.push(truncatedHex));
            });
        } else {
            world.removeKingdom(kingdom);

            undoCallbacks.push(() => {
                world.kingdoms.push(kingdom);
            });
        }

        // Add news kingdoms to world and remove extra money from main kingdom to fragmented ones
        splittedKingdoms.forEach(splittedKingdom => {
            kingdom.money -= splittedKingdom.money;
            world.kingdoms.push(splittedKingdom);

            undoCallbacks.push(() => {
                kingdom.money += splittedKingdom.money;
                world.removeKingdom(splittedKingdom);
            });
        });

        return () => {
            undoCallbacks
                .reverse()
                .forEach(callback => callback())
            ;
        };
    }

    static getKingdomIncome(kingdom) {
        return kingdom.hexs
            .filter(hex => !hex.hasTree())
            .filter(hex => !hex.hasDied())
            .length
        ;
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
     * @param {integer} level Optional, Level of unit who want to capture hex
     *
     * @returns {Entity[]} Protecting entitise (units or tower), from the strongest to the weakest.
     */
    static getProtectingUnits(world, hex, level) {
        const protectingUnits = [];

        this.neighboursHexsSamePlayer(world, hex)
            .concat([hex])
            .forEach(hex => {
                if (hex.hasUnit() || hex.hasTower()) {
                    protectingUnits.push(hex.entity);
                }
            })
        ;

        protectingUnits.sort((unitA, unitB) => {
            return unitA.level < unitB.level;
        });

        if (undefined === level) {
            level = -10;
        }

        return protectingUnits
            .filter(protectingUnit => protectingUnit.level >= level)
        ;
    }

    static getHexsAdjacentToKingdom(world, kingdom) {
        const adjacentHexs = [];

        kingdom.hexs.forEach(hex => {
            this
                .neighboursHexs(world, hex)
                .filter(hex => hex.kingdom !== kingdom)
                .forEach(neighboursHex => {
                    if (-1 === adjacentHexs.indexOf(neighboursHex)) {
                        adjacentHexs.push(neighboursHex);
                    }
                })
            ;
        });

        return adjacentHexs;
    }

    static isHexCoastal(world, hex) {
        return this
            .neighbours(hex)
            .map(neighbourCoords => world.getHexAt(neighbourCoords))
            .some(hex => hex === undefined)
        ;
    }

    static createTreeForHex(world, hex) {
        const treeType = this.isHexCoastal(world, hex) ? Tree.COASTAL : Tree.CONTINENTAL;
        const tree = new Tree(treeType);

        tree.hex = hex;

        return tree;
    }
}
