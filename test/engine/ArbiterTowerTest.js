import chai from 'chai';
import { Arbiter, Player, Hex, Unit, Tower, Died, Tree, World, WorldGenerator } from '../../src/engine';

chai.should();
const expect = chai.expect;

const createTestPlayers = () => {
    return Array.apply(null, Array(6)).map(p => new Player());
};

describe('Arbiter', () => {
    describe('Tower', () => {
        describe('paceAt', () => {
            it('cannot place an unit on a tower', () => {
                const worldGenerator = new WorldGenerator('constant-seed-5');
                const world = worldGenerator.generate(createTestPlayers());

                const arbiter = new Arbiter(world);
                const kingdom = world.getKingdomAt(new Hex(2, -1, -1));
                arbiter.setCurrentPlayer(kingdom.player);
                arbiter.setCurrentKingdom(kingdom);
                world.setEntityAt(new Hex(2, -1, -1), new Tower());
                arbiter.selection = new Unit();

                expect(() => { arbiter.placeAt(new Hex(2, -1, -1)); }).to.throw(/not place unit/);
            });

            it('cannot capture a hex with a tower', () => {
                const worldGenerator = new WorldGenerator('constant-seed-5');
                const world = worldGenerator.generate(createTestPlayers());

                const arbiter = new Arbiter(world);
                const kingdom = world.getKingdomAt(new Hex(2, -1, -1));
                arbiter.setCurrentPlayer(kingdom.player);
                arbiter.setCurrentKingdom(kingdom);
                arbiter.selection = new Tower();

                expect(() => { arbiter.placeAt(new Hex(2, 1, -3)); }).to.throw(/place tower inside current kingdom/);
            });
        });

        describe('buyTower', () => {
            it('put a tower in selection', () => {
                const worldGenerator = new WorldGenerator('constant-seed-5');
                const world = worldGenerator.generate(createTestPlayers());

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
