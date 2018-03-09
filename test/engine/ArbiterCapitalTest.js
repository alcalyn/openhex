import chai from 'chai';
import { Arbiter, Player, Hex, Unit, Tower, Capital, Died, Tree, World, WorldGenerator } from '../../src/engine';
import { generateTestWorld } from './TestUtils';

chai.should();
const expect = chai.expect;

describe('Arbiter', () => {
    describe('Capital', () => {
        describe('paceAt', () => {
            it('cannot place an unit on a capital', () => {
                const world = generateTestWorld('constant-seed-5');

                const arbiter = new Arbiter(world);
                const kingdom = world.getKingdomAt(new Hex(2, -1, -1));
                arbiter.setCurrentPlayer(kingdom.player);
                arbiter.setCurrentKingdom(kingdom);
                arbiter.selection = new Unit();

                expect(() => { arbiter.placeAt(new Hex(2, 0, -2)); }).to.throw('cannot_place_unit.blocked_by_capital');
            });

            it('cannot capture an ennemy capital with a level 1 unit', () => {
                const world = generateTestWorld('constant-seed-5');

                const arbiter = new Arbiter(world);
                const kingdom = world.getKingdomAt(new Hex(2, -1, -1));
                arbiter.setCurrentPlayer(kingdom.player);
                arbiter.setCurrentKingdom(kingdom);
                arbiter.selection = new Unit();

                expect(() => { arbiter.placeAt(new Hex(1, 1, -2)); }).to.throw('cannot_capture.hex_protected');
            });

            it('can capture an ennemy capital with a level 2 unit and rebuilt capital with 0 money', () => {
                const world = generateTestWorld('constant-seed-5');

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
                const world = generateTestWorld('constant-seed-5');

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
                const world = generateTestWorld('constant-seed-5');

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
                const world = generateTestWorld('constant-seed-5');

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
                const world = generateTestWorld('constant-seed-5');

                const arbiter = new Arbiter(world);
                const kingdom = world.getKingdomAt(new Hex(2, -1, -1));
                arbiter.setCurrentPlayer(kingdom.player);
                arbiter.setCurrentKingdom(kingdom);
                arbiter.selection = new Tower();

                expect(() => { arbiter.placeAt(new Hex(2, 0, -2)); }).to.throw('cannot_place_tower.hex_not_empty');
            });

            it('cannot buy unit if a tower is in selection', () => {
                const world = generateTestWorld('constant-seed-5');

                const arbiter = new Arbiter(world);
                const kingdom = world.getKingdomAt(new Hex(2, -1, -1));
                arbiter.setCurrentPlayer(kingdom.player);
                arbiter.setCurrentKingdom(kingdom);
                arbiter.selection = new Tower();

                expect(() => { arbiter.buyUnit(); }).to.throw('Cannot buy unit, place selected entity first');
            });

            it('removes the capital of the weakest kingdom when merged to a stronger one', () => {
                const world = generateTestWorld('constant-seed-5');

                const arbiter = new Arbiter(world);
                const kingdom = world.getKingdomAt(new Hex(-2, -2, 4));
                arbiter.setCurrentPlayer(kingdom.player);
                arbiter.setCurrentKingdom(kingdom);
                arbiter.selection = new Unit();

                world.getEntityAt(new Hex(-2, -1, 3)).should.be.an.instanceOf(Capital);
                world.getEntityAt(new Hex(1, -2, 1)).should.be.an.instanceOf(Capital);

                arbiter.placeAt(new Hex(-1, -2, 3));

                world.getEntityAt(new Hex(-2, -1, 3)).should.be.an.instanceOf(Capital);
                expect(world.getEntityAt(new Hex(1, -2, 1))).to.be.null;
            });

            it('replaces capital even if all over hexs have an entity', () => {
                const world = generateTestWorld('constant-seed-5');

                const arbiter = new Arbiter(world);
                const kingdom = world.getKingdomAt(new Hex(0, 1, -1));
                arbiter.setCurrentPlayer(kingdom.player);
                arbiter.setCurrentKingdom(kingdom);
                arbiter.selection = new Unit(2);

                const opponentKingdom = world.getKingdomAt(new Hex(1, 0, -1));
                world.setEntityAt(new Hex(1, 0, -1), new Tree());
                world.setEntityAt(new Hex(2, -1, -1), new Unit(1));
                world.setEntityAt(new Hex(3, -1, -2), new Tree());
                world.setEntityAt(new Hex(3, 0, -3), new Tree());

                world.getEntityAt(new Hex(2, 0, -2)).should.be.an.instanceOf(Capital);

                arbiter.placeAt(new Hex(2, 0, -2));

                opponentKingdom.hexs.filter(hex => hex.hasCapital()).should.have.lengthOf(1);
            });
        });
    });
});
