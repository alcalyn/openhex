import chai from 'chai';
import { Arbiter, Player, Hex, Unit, Died, Tree, World, WorldGenerator } from '../../src/engine';
import { generateTestWorld } from './TestUtils';

chai.should();
const expect = chai.expect;

describe('Arbiter', () => {
    describe('undo', () => {
        it('undo unit buy when selection is empty', () => {
            const world = generateTestWorld('constant-seed-5');

            const arbiter = new Arbiter(world);
            const kingdom = world.getKingdomAt(new Hex(2, -1, -1));
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);

            arbiter.selection = null;
            kingdom.money = 15;

            arbiter.buyUnit();
            arbiter.undo();

            expect(arbiter.selection).to.be.null;
            kingdom.money.should.be.equal(15);
        });

        it('undo unit buy/upgrade', () => {
            const world = generateTestWorld('constant-seed-5');

            const arbiter = new Arbiter(world);
            const kingdom = world.getKingdomAt(new Hex(2, -1, -1));
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);

            arbiter.selection = new Unit(1);
            kingdom.money = 15;

            arbiter.buyUnit();
            arbiter.undo();

            expect(arbiter.selection).to.be.an.instanceOf(Unit);
            arbiter.selection.level.should.be.equal(1);
            kingdom.money.should.equal(15);
        });

        it('undo takeUnit', () => {
            const world = generateTestWorld('constant-seed-5');

            const arbiter = new Arbiter(world);
            const kingdom = world.getKingdomAt(new Hex(2, -1, -1));
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);
            world.setEntityAt(new Hex(2, -1, -1), new Unit());

            arbiter.takeUnitAt(new Hex(2, -1, -1));
            arbiter.undo();

            expect(arbiter.selection).to.be.null;
            expect(world.getEntityAt(new Hex(2, -1, -1))).to.be.an.instanceOf(Unit);
        });

        it('undo placeAt when placed in own kingdom', () => {
            const world = generateTestWorld('constant-seed-5');

            const arbiter = new Arbiter(world);
            const kingdom = world.getKingdomAt(new Hex(2, -1, -1));
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);
            arbiter.selection = new Unit();

            arbiter.placeAt(new Hex(2, -1, -1));
            arbiter.undo();

            expect(arbiter.selection).to.be.an.instanceOf(Unit);
            expect(world.getEntityAt(new Hex(2, -1, -1))).to.be.null;
        });

        it('undo placeAt and restore hex kingdom when I captured a hex of a 2-hex kingdom', () => {
            const world = generateTestWorld('constant-seed-5');

            const arbiter = new Arbiter(world);
            const kingdom = world.getKingdomAt(new Hex(-3, 2, 1));
            const opponentKingdom = world.getKingdomAt(new Hex(-1, 2, -1));
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);
            arbiter.selection = new Unit(2);

            expect(world.getKingdomAt(new Hex(-1, 2, -1))).to.be.equal(opponentKingdom);

            arbiter.placeAt(new Hex(-2, 3, -1));
            arbiter.undo();

            expect(world.getKingdomAt(new Hex(-1, 2, -1))).to.be.equal(opponentKingdom);
        });
    });

    describe('undoAll', () => {
        it('undo double unit buy when selection is empty', () => {
            const world = generateTestWorld('constant-seed-5');

            const arbiter = new Arbiter(world);
            const kingdom = world.getKingdomAt(new Hex(2, -1, -1));
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);

            arbiter.selection = null;
            kingdom.money = 42;

            arbiter.buyUnit();
            arbiter.buyUnit();
            arbiter.undoAll();

            expect(arbiter.selection).to.be.null;
            kingdom.money.should.be.equal(42);
        });
    });
});
