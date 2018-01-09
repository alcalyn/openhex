import Unit from './Unit';

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

        if (null === hex.kingdom) {
            return;
        }

        if (null !== this.selection && hex.kingdom !== this.currentKingdom) {
            throw new Error('Cannot change kingdom while having a selected entity');
        }

        this.setCurrentKingdom(hex.kingdom);

        if (this.selection) {
            this.placeAt(hex);
        } else {
            if (hex.hasUnit()) {
                this.takeUnitAt(hex);
            }
        }
    }

    _placeUnitAt(hexCoords) {
        const hex = this.world.getHexAt(hexCoords);

        if (hex.kingdom !== this.currentKingdom) {
            throw new Error('Cannot move unit to another owned kingdom');
        }

        if (hex.hasUnit()) {
            if ((hex.entity.level + this.selection.level) > Arbiter.UNIT_MAX_LEVEL) {
                throw new Error('Cannot merge units as the sum of levels is too high');
            }

            hex.entity.level += this.selection.level;
            this.selection = null;
        } else {
            this.world.setEntityAt(hex, this.selection);
            this.selection = null;
        }
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
