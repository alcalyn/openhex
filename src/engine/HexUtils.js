import { HexUtils as HexUtilsBase } from 'react-hexgrid';
import TreeUtils from './TreeUtils';
import Unit from './Unit';
import Kingdom from './Kingdom';
import Capital from './Capital';

export default class HexUtils extends HexUtilsBase {
    static neighboursHexs(world, hex) {
        return this
            .neighbours(hex)
            .map(neighbourCoords => world.getHexAt(neighbourCoords))
            .filter(hex => hex !== undefined)
        ;
    }

    static neighboursHexsSamePlayer(world, hex, subHexs) {
        const neighboursHexsSamePlayer = this
            .neighboursHexs(world, hex)
            .filter(neighbourHex => neighbourHex.player === hex.player)
        ;

        if (undefined === subHexs) {
            return neighboursHexsSamePlayer;
        }

        return neighboursHexsSamePlayer
            .filter(hex => subHexs.includes(hex))
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

                if (hex.hasCapital()) {
                    const removedCapital = hex.entity;
                    hex.entity = null;

                    undoCallbacks.push(() => {
                        hex.entity = removedCapital;
                    });
                }
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

    static transformCapitalsOnSingleHexsToTrees(world) {
        const undoCallbacks = [];

        world.hexs
            .filter(hex => !hex.kingdom && hex.hasCapital())
            .forEach(hex => {
                const lastEntity = hex.entity;

                hex.setEntity(TreeUtils.createTreeForHex(world, hex));

                undoCallbacks.push(() => {
                    hex.setEntity(lastEntity);
                });
            })
        ;

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
                if (hex.hasUnit() || hex.hasTower() || hex.hasCapital()) {
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

    /**
     * Returns sorted hexs that is the most interior in a kingdom.
     * Used to find the best location for a kingdom capital: far away from frontier.
     *
     * @param {World} world
     * @param {Kingdom} kingdom
     *
     * @returns {Hex[]}
     */
    static getMostInteriorHexs(world, kingdom) {
        const mostInteriorHexs = [];
        let hexs = kingdom.hexs.slice();
        let lastLength;

        do {
            lastLength = hexs.length;

            // eslint-disable-next-line no-loop-func
            hexs.forEach(hex => {
                hex._neighboursCount = this.neighboursHexsSamePlayer(world, hex, hexs).length;
            });

            let maxNeighboursCount = hexs.reduce((prev, current) => {
                return prev._neighboursCount > current._neighboursCount ? prev : current;
            })._neighboursCount;

            hexs
                .filter(hex => hex._neighboursCount !== maxNeighboursCount)
                .forEach(hex => mostInteriorHexs.push(hex))
            ;

            hexs = hexs.filter(hex => hex._neighboursCount === maxNeighboursCount);
        } while (hexs.length < lastLength);

        hexs.forEach(hex => mostInteriorHexs.push(hex));

        kingdom.hexs.forEach(hex => {
            delete hex._neighboursCount;
        });

        return mostInteriorHexs.reverse();
    }

    static getMiddleHex(world, kingdom) {
        return this.getMostInteriorHexs(world, kingdom)[0];
    }

    /**
     * @param {World} world
     * @param {Kingdom} kingdom
     *
     * @returns {Hex} hex choosen to build the capital
     */
    static createKingdomCapital(world, kingdom) {
        let capitalHex = null;
        let rebuilt = false;

        const mostInteriorHexs = this.getMostInteriorHexs(world, kingdom);

        rebuilt = mostInteriorHexs.some(hex => {
            if (null === hex.entity) {
                world.setEntityAt(hex, new Capital());
                capitalHex = hex;
                return true;
            }

            return false;
        });

        if (rebuilt) {
            return capitalHex;
        }

        const treeInteriorsHexs = mostInteriorHexs.filter(hex => hex.hasTree());

        if (treeInteriorsHexs.length > 0) {
            capitalHex = treeInteriorsHexs[0];
        } else {
            capitalHex = mostInteriorHexs[0];
        }

        world.setEntityAt(capitalHex, new Capital());

        return capitalHex;
    }

    static kingdomHasCapital(kingdom) {
        return kingdom.hexs.some(hex => hex.hasCapital());
    }

    /**
     * Check all kingdoms that have lost their capital,
     * then rebuild it, and reset money.
     *
     * @param {World} world
     *
     * @returns {Callback} Callback to call to undo rebuild
     */
    static rebuildKingdomsCapitals(world) {
        const undoCallbacks = [];

        world.kingdoms.filter(kingdom => kingdom.hexs.length >= 2).forEach(kingdom => {
            if (!this.kingdomHasCapital(kingdom)) {
                const capitalHex = this.createKingdomCapital(world, kingdom);

                undoCallbacks.push(() => {
                    capitalHex.entity = null;
                });
            }
        });

        return () => {
            undoCallbacks
                .reverse()
                .forEach(callback => callback())
            ;
        };
    }
}
