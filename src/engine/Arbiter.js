import Unit from './Unit';
import HexUtils from './HexUtils';
import Died from './Died';

export default class Arbiter {
    static UNIT_PRICE = 10;
    static TOWER_PRICE = 15;
    static UNIT_MAX_LEVEL = 4;

    constructor(world) {
        this.world = world;

        this.selection = null;
        this.currentPlayer = null;
        this.currentKingdom = null;
    }

    setCurrentPlayer(player) {
        this.currentPlayer = player;
        this.currentKingdom = null;

        player.notifyTurn(this);
    }

    setCurrentKingdom(kingdom) {
        this._checkPlayerSelected();

        if (kingdom.player !== this.currentPlayer) {
            console.log(kingdom.player, this.currentPlayer);
            throw new Error('Cannot select opponent kingdom');
        }

        this.currentKingdom = kingdom;
    }

    takeUnitAt(hexCoords) {
        this._checkKingdomSelected();

        const hex = this.world.getHexAt(hexCoords);

        if (hex.kingdom !== this.currentKingdom) {
            throw new Error('Cannot take unit from another kingdom');
        }

        if (!hex.hasUnit()) {
            throw new Error('There is no unit at theses coords');
        }

        if (hex.getUnit().played) {
            throw new Error('This unit can no longer move this turn');
        }

        if (null !== this.selection) {
            throw new Error('There is already something selected');
        }

        this.selection = this.world.removeUnitAt(hexCoords);
    }

    placeAt(hexCoords) {
        if (this.selection instanceof Unit) {
            this._placeUnitAt(hexCoords);
        }
    }

    buyUnit() {
        if (this.currentKingdom.money < Arbiter.UNIT_PRICE) {
            throw new Error('Not enough money');
        }

        if (this.selection instanceof Unit && this.selection.level >= Arbiter.UNIT_MAX_LEVEL) {
            throw new Error('Cannot upgrade selectionned unit, already max level');
        }

        if (this.selection instanceof Unit) {
            this.selection.level++;
        } else {
            this.selection = new Unit();
        }

        this.currentKingdom.money -= Arbiter.UNIT_PRICE;
    }

    smartAction(coords) {
        const hex = this.world.getHexAt(coords);

        if (null === this.selection) {
            if (hex.kingdom) {
                if (hex.kingdom === this.currentKingdom) {
                    if (hex.hasUnit()) {
                        this.takeUnitAt(hex);
                    }
                } else {
                    if (hex.kingdom.player === this.currentPlayer) {
                        this.setCurrentKingdom(hex.kingdom);

                        if (hex.hasUnit()) {
                            this.takeUnitAt(hex);
                        }
                    }
                }
            }
        } else {
            if (hex.kingdom) {
                if (hex.kingdom === this.currentKingdom) {
                    this.placeAt(hex);
                } else {
                    if (hex.kingdom.player === this.currentPlayer) {
                        throw new Error('Cannot change kingdom while having a selected entity');
                    } else {
                        this.placeAt(hex);
                    }
                }
            } else {
                this.placeAt(hex);
            }
        }
    }

    endTurn() {
        if (this.selection) {
            throw new Error('Cannot end turn while having selected an entity');
        }

        this._resetUnitsMove(this.currentPlayer);

        let nextIndex = this.world.players.indexOf(this.currentPlayer) + 1;

        if (nextIndex > this.world.players.length - 1) {
            nextIndex = 0;
            this.world.turn++;
        }

        console.log('nextindex', nextIndex, 'turn', this.world.turn);

        const nextPlayer = this.world.players[nextIndex];

        if (this.world.turn > 0) {
            this._payKingdomsIncome(nextPlayer);
        }

        this.setCurrentPlayer(nextPlayer);
    }

    _resetUnitsMove(player) {
        this.world.kingdoms
            .filter(kingdom => kingdom.player === player)
            .forEach(kingdom => {
                kingdom.hexs.forEach(hex => {
                    if (hex.entity instanceof Unit) {
                        hex.entity.played = false;
                    }
                });
            })
        ;
    }

    _payKingdomsIncome(player) {
        console.log('_payKingdomsIncome', player);

        this.world.kingdoms
            .filter(kingdom => kingdom.player === player)
            .forEach(kingdom => {
                // Reset kingdom economy if bankrupt last turn
                if (kingdom.money < 0) {
                    kingdom.money = 0;
                }

                console.log('+', HexUtils.getKingdomIncome(kingdom));
                console.log('-', HexUtils.getKingdomMaintenanceCost(kingdom));

                // Get income and pay units maintenance
                kingdom.money += HexUtils.getKingdomIncome(kingdom);
                kingdom.money -= HexUtils.getKingdomMaintenanceCost(kingdom);

                // Replace dieds with trees
                kingdom.hexs.filter(hex => hex.hasDied()).forEach(hex => {
                    hex.entity = HexUtils.createTreeForHex(this.world, hex);
                });

                // Kill unpaid units
                if (kingdom.money < 0) {
                    kingdom.hexs.filter(hex => hex.hasUnit()).forEach(hex => {
                        hex.entity = new Died();
                    });
                }
            })
        ;

        // On single hexs...
        const singleHexs = this.world.hexs
            .filter(hex => hex.player === player)
            .filter(hex => !hex.kingdom)
        ;

        // Replace dieds with trees
        singleHexs
            .filter(hex => hex.hasDied())
            .forEach(hex => hex.entity = HexUtils.createTreeForHex(this.world, hex))
        ;

        // Kill units on a single hex kingdom
        singleHexs
            .filter(hex => hex.hasUnit())
            .forEach(hex => hex.entity = new Died())
        ;
    }

    _placeUnitAt(hexCoords) {
        const hex = this.world.getHexAt(hexCoords);

        if (hex.kingdom !== this.currentKingdom) {
            if (!HexUtils.isHexAdjacentKingdom(this.world, hex, this.currentKingdom)) {
                throw new Error('Cannot capture this hex, too far of kingdom');
            }

            const protectingUnits = HexUtils
                .getProtectingUnits(this.world, hex, this.selection.level)
            ;

            if (protectingUnits.length > 0) {
                console.warn(protectingUnits);
                throw new Error('Cannot capture this hex, units protecting it');
            }

            this.world.setEntityAt(hex, this.selection);
            this.selection.played = true;
            this.selection = null;

            if (hex.kingdom) {
                hex.kingdom.removeHex(hex);
                if (hex.kingdom.hexs.length < 2) {
                    hex.kingdom.hexs.forEach(hex => hex.kingdom = null);
                    this.world.removeKingdom(hex.kingdom);
                }
            }

            hex.kingdom = this.currentKingdom;
            hex.player = this.currentKingdom.player;
            this.currentKingdom.hexs.push(hex);
        } else {
            if (hex.hasUnit()) {
                if ((hex.entity.level + this.selection.level) > Arbiter.UNIT_MAX_LEVEL) {
                    throw new Error('Cannot merge units as the sum of levels is too high');
                }

                hex.entity.level += this.selection.level;
                this.selection = null;
            } else {
                if (hex.hasDied() || hex.hasTree()) {
                    this.selection.played = true;
                }

                this.world.setEntityAt(hex, this.selection);
                this.selection = null;
            }
        }

        HexUtils.mergeKingdomsOnCapture(this.world, hex);
        HexUtils.splitKingdomsOnCapture(this.world, hex);
    }

    _checkPlayerSelected() {
        if (null === this.currentPlayer) {
            throw new Error('A player must be selected');
        }
    }

    _checkKingdomSelected() {
        this._checkPlayerSelected();

        if (null === this.currentKingdom) {
            throw new Error('A kingdom must be selected');
        }
    }
}
