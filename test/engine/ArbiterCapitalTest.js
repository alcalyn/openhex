import chai from 'chai';
import { Arbiter, Player, Hex, Unit, Tower, Capital, Died, Tree, World, WorldGenerator } from '../../src/engine';
import { createTestPlayers } from './TestUtils';

chai.should();
const expect = chai.expect;

describe('Arbiter', () => {
    describe('Capital', () => {
        describe('paceAt', () => {
            it('cannot place an unit on a capital', () => {
                const worldGenerator = new WorldGenerator('constant-seed-5');
                const world = worldGenerator.generate(createTestPlayers());

                const arbiter = new Arbiter(world);
                const kingdom = world.getKingdomAt(new Hex(2, -1, -1));
                arbiter.setCurrentPlayer(kingdom.player);
                arbiter.setCurrentKingdom(kingdom);
                arbiter.selection = new Unit();

                expect(() => { arbiter.placeAt(new Hex(2, 0, -2)); }).to.throw(/not place unit/);
            });

            it('cannot capture an ennemy capital with a level 1 unit', () => {
                const worldGenerator = new WorldGenerator('constant-seed-5');
                const world = worldGenerator.generate(createTestPlayers());

                const arbiter = new Arbiter(world);
                const kingdom = world.getKingdomAt(new Hex(2, -1, -1));
                arbiter.setCurrentPlayer(kingdom.player);
                arbiter.setCurrentKingdom(kingdom);
                arbiter.selection = new Unit();

                expect(() => { arbiter.placeAt(new Hex(1, 1, -2)); }).to.throw(/not capture/);
            });

            it('can capture an ennemy capital with a level 2 unit and rebuilt capital with 0 money', () => {
                const worldGenerator = new WorldGenerator('constant-seed-5');
                const world = worldGenerator.generate(createTestPlayers());

                const arbiter = new Arbiter(world);
                const kingdom = world.getKingdomAt(new Hex(2, -1, -1));
                const opponentKingdom = world.getKingdomAt(new Hex(0, 1, -1));
                arbiter.setCurrentPlayer(kingdom.player);
                arbiter.setCurrentKingdom(kingdom);
                const level2Unit = new Unit(2);
                arbiter.selection = level2Unit;

                arbiter.placeAt(new Hex(1, 1, -2));

                expect(world.getEntityAt(new Hex(1, 1, -2))).to.be.equal(level2Unit);
                opponentKingdom.money.should.be.equal(0);
                opponentKingdom.hexs.some(hex => hex.hasCapital()).should.be.true;
            });

            it('does not rebuild capital if 2-hex kingdom lost a hex and now has only one', () => {
                const worldGenerator = new WorldGenerator('constant-seed-5');
                const world = worldGenerator.generate(createTestPlayers());

                const arbiter = new Arbiter(world);
                const kingdom = world.getKingdomAt(new Hex(-2, 2, 0));
                const opponentKingdom = world.getKingdomAt(new Hex(-2, 3, -1));
                arbiter.setCurrentPlayer(kingdom.player);
                arbiter.setCurrentKingdom(kingdom);
                const level2Unit = new Unit(2);
                arbiter.selection = level2Unit;

                // take capital
                arbiter.placeAt(new Hex(-1, 2, -1));

                expect(world.getEntityAt(new Hex(-1, 2, -1))).to.be.equal(level2Unit);
                expect(world.getEntityAt(new Hex(-2, 3, -1))).to.be.null;
                expect(world.getKingdomAt(new Hex(-2, 3, -1))).to.be.null;
            });

            it('transforms capital to a tree on a 2-hex kingdom if the capital is the only hex', () => {
                const worldGenerator = new WorldGenerator('constant-seed-5');
                const world = worldGenerator.generate(createTestPlayers());

                const arbiter = new Arbiter(world);
                const kingdom = world.getKingdomAt(new Hex(-2, 2, 0));
                const opponentKingdom = world.getKingdomAt(new Hex(-2, 3, -1));
                arbiter.setCurrentPlayer(kingdom.player);
                arbiter.setCurrentKingdom(kingdom);
                const level2Unit = new Unit(2);
                arbiter.selection = level2Unit;

                arbiter.placeAt(new Hex(-2, 3, -1));

                expect(world.getEntityAt(new Hex(-2, 3, -1))).to.be.equal(level2Unit);
                expect(world.getEntityAt(new Hex(-1, 2, -1))).to.be.an.instanceOf(Tree);
                expect(world.getKingdomAt(new Hex(-1, 2, -1))).to.be.null;
            });

            it('transforms capital to a tree on a 3-hex kingdom when cut in the middle', () => {
                const worldGenerator = new WorldGenerator('constant-seed-5');
                const world = worldGenerator.generate(createTestPlayers());

                world.setEntityAt(new Hex(-2, -1, 3), null);
                world.setEntityAt(new Hex(-2, -2, 4), new Capital());

                const arbiter = new Arbiter(world);
                const kingdom = world.getKingdomAt(new Hex(-1, 0, 1));
                arbiter.setCurrentPlayer(kingdom.player);
                arbiter.setCurrentKingdom(kingdom);
                arbiter.selection = new Unit(2);

                arbiter.placeAt(new Hex(-2, -1, 3));

                expect(world.getKingdomAt(new Hex(-2, -2, 4))).to.be.null;
                expect(world.getEntityAt(new Hex(-2, -2, 4))).to.be.an.instanceOf(Tree);
                expect(world.getKingdomAt(new Hex(-3, 0, 3))).to.be.null;
                expect(world.getEntityAt(new Hex(-3, 0, 3))).to.be.null;
            });

            it('cannot place a tower on a capital', () => {
                const worldGenerator = new WorldGenerator('constant-seed-5');
                const world = worldGenerator.generate(createTestPlayers());

                const arbiter = new Arbiter(world);
                const kingdom = world.getKingdomAt(new Hex(2, -1, -1));
                arbiter.setCurrentPlayer(kingdom.player);
                arbiter.setCurrentKingdom(kingdom);
                arbiter.selection = new Tower();

                expect(() => { arbiter.placeAt(new Hex(2, 0, -2)); }).to.throw('Must place tower on empty hex');
            });
        });
    });
});
