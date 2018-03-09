import chai from 'chai';
import { Arbiter, Player, Hex, Unit, Tower, Died, Tree, World, WorldGenerator } from '../../src/engine';
import { generateTestWorld } from './TestUtils';

chai.should();
const expect = chai.expect;

describe('Arbiter', () => {
    describe('Tower', () => {
        describe('paceAt', () => {
            it('cannot place an unit on a tower', () => {
                const world = generateTestWorld('constant-seed-5');

                const arbiter = new Arbiter(world);
                const kingdom = world.getKingdomAt(new Hex(2, -1, -1));
                arbiter.setCurrentPlayer(kingdom.player);
                arbiter.setCurrentKingdom(kingdom);
                world.setEntityAt(new Hex(2, -1, -1), new Tower());
                arbiter.selection = new Unit();

                expect(() => { arbiter.placeAt(new Hex(2, -1, -1)); }).to.throw('cannot_place_unit.blocked_by_tower');
            });

            it('cannot capture a hex with a tower', () => {
                const world = generateTestWorld('constant-seed-5');

                const arbiter = new Arbiter(world);
                const kingdom = world.getKingdomAt(new Hex(2, -1, -1));
                arbiter.setCurrentPlayer(kingdom.player);
                arbiter.setCurrentKingdom(kingdom);
                arbiter.selection = new Tower();

                expect(() => { arbiter.placeAt(new Hex(2, 1, -3)); }).to.throw('cannot_place_tower.hex_outside_of_current_kingdom');
            });
        });

        describe('buyTower', () => {
            it('put a tower in selection', () => {
                const world = generateTestWorld('constant-seed-5');

                const arbiter = new Arbiter(world);
                const kingdom = world.getKingdomAt(new Hex(2, -1, -1));
                arbiter.setCurrentPlayer(kingdom.player);
                arbiter.setCurrentKingdom(kingdom);
                kingdom.money = 40;

                arbiter.buyTower();

                expect(arbiter.selection).to.be.an.instanceOf(Tower);
                kingdom.money.should.be.equal(25);
            });
        });
    });
});
