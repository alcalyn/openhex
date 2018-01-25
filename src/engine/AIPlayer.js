import Player from './Player';
import HexUtils from './HexUtils';

export default class AIPlayer extends Player {
    notifyTurn(arbiter) {
        console.log('AI is playing');

        try {
            arbiter.world.kingdoms
                .filter(kingdom => kingdom.player === this)
                .forEach(kingdom => {
                    arbiter.setCurrentKingdom(kingdom);
                    this.playKingdom(arbiter, kingdom);
                })
            ;
        } catch (e) {
            // If AI try to do an illegal move, just catch it and pass turn
            console.warn('AI illegal move', e);

            if (arbiter.selection) {
                arbiter.undoAll();
            }
        }

        arbiter.endTurn();
    }

    playKingdom(arbiter, kingdom) {
        const unprotectedHexs = {'none': [], 0: [], 1: [], 2: [], 3: [], 4: []};
        const adjacentHexs = HexUtils.getHexsAdjacentToKingdom(arbiter.world, kingdom);

        // Sort hexs to capture by difficulty
        adjacentHexs.forEach(adjacentHex => {
            const protectingUnits = HexUtils.getProtectingUnits(arbiter.world, adjacentHex);
            const maxLevel = protectingUnits.length > 0 ? protectingUnits[0].level : 'none';

            unprotectedHexs[maxLevel].push(adjacentHex);
        });

        // Buy new units
        kingdom.hexs.filter(hex => null === hex.entity).some(hex => {
            if (kingdom.money < 10) {
                return true;
            }

            arbiter.buyUnit();
            arbiter.placeAt(hex);
            return false;
        });

        const units = kingdom.getUnits().filter(unit => !unit.played);

        // Captures
        units.filter(unit => unit.level === 1).some(unit => {
            const hex = unprotectedHexs['none'].pop();

            if (!hex) {
                return true;
            }

            arbiter.takeUnitAt(unit.hex);
            arbiter.placeAt(hex);

            return false;
        });

        units.filter(unit => unit.level === 2).some(unit => {
            const hex = unprotectedHexs[0].pop();;

            if (!hex) {
                return true;
            }

            arbiter.takeUnitAt(unit.hex);
            arbiter.placeAt(hex);

            return false;
        });
    }
}
