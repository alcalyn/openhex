import chai from 'chai';
import { Arbiter, Player, Hex, LocalPlayer, Unit, World, WorldGenerator } from '../../src/engine';

chai.should();
const expect = chai.expect;

describe('Arbiter', () => {
    describe('takeUnitAt', () => {
        it('put unit in selection and remove it from hex', () => {
            const worldGenerator = new WorldGenerator('constant-seed-2');
            const world = worldGenerator.generate();

            world.setEntityAt(new Hex(-3, 0, 3), new Unit());

            const arbiter = new Arbiter(world);
            arbiter.setCurrentPlayer(world.getHexAt(new Hex(-4, 1, 3)).kingdom.player);
            arbiter.setCurrentKingdom(world.getHexAt(new Hex(-4, 1, 3)).kingdom);

            expect(arbiter.selection).to.be.null;
            world.getEntityAt(new Hex(-3, 0, 3)).should.be.an.instanceOf(Unit);

            arbiter.takeUnitAt(new Hex(-3, 0, 3));

            arbiter.selection.should.be.an.instanceOf(Unit);
            expect(world.getEntityAt(new Hex(-3, 0, 3))).to.be.null;
        });
    });

    describe('placeAt', () => {
        it('place an unit from selection to a hex of the same kingdom', () => {
            const worldGenerator = new WorldGenerator('constant-seed-2');
            const world = worldGenerator.generate();

            const arbiter = new Arbiter(world);
            const kingdom = world.getHexAt(new Hex(-4, 1, 3)).kingdom;
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);
            arbiter.selection = new Unit();

            arbiter.selection.should.be.an.instanceOf(Unit);
            expect(world.getEntityAt(new Hex(-3, 0, 3))).to.be.null;

            arbiter.placeAt(new Hex(-3, 0, 3));

            expect(arbiter.selection).to.be.null;
            world.getEntityAt(new Hex(-3, 0, 3)).should.be.an.instanceOf(Unit);
        });
    });

    describe('takeUnitAt and placeAt', () => {
        it('just moving an unit should still having a move', () => {
            const worldGenerator = new WorldGenerator('constant-seed-2');
            const world = worldGenerator.generate();

            world.setEntityAt(new Hex(-3, 0, 3), new Unit());

            const arbiter = new Arbiter(world);
            const kingdom = world.getHexAt(new Hex(-4, 1, 3)).kingdom;
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);

            world.getEntityAt(new Hex(-3, 0, 3)).should.have.property('played', false);

            arbiter.takeUnitAt(new Hex(-3, 0, 3));
            arbiter.placeAt(new Hex(-4, 1, 3));

            world.getEntityAt(new Hex(-4, 1, 3)).should.have.property('played', false);
        });
    });

    describe('buyUnit', () => {
        it('must decrease kingdom money', () => {
            const worldGenerator = new WorldGenerator('constant-seed-2');
            const world = worldGenerator.generate();

            const arbiter = new Arbiter(world);
            const kingdom = world.getHexAt(new Hex(-4, 1, 3)).kingdom;
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);

            arbiter.currentKingdom.money.should.be.equal(25);

            arbiter.buyUnit();

            arbiter.currentKingdom.money.should.be.equal(15);
            arbiter.selection.level.should.equal(1);
        });
    });

    describe('buyUnit', () => {
        it('upgrade selected unit', () => {
            const worldGenerator = new WorldGenerator('constant-seed-2');
            const world = worldGenerator.generate();

            const arbiter = new Arbiter(world);
            const kingdom = world.getHexAt(new Hex(-4, 1, 3)).kingdom;
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);

            arbiter.currentKingdom.money.should.be.equal(25);

            arbiter.buyUnit();

            arbiter.currentKingdom.money.should.be.equal(15);
            arbiter.selection.level.should.equal(1);

            arbiter.buyUnit();

            arbiter.currentKingdom.money.should.be.equal(5);
            arbiter.selection.level.should.equal(2);
        });
    });

    describe('buyUnit', () => {
        it('throw error when not enough money', () => {
            const worldGenerator = new WorldGenerator('constant-seed-2');
            const world = worldGenerator.generate();

            const arbiter = new Arbiter(world);
            const kingdom = world.getHexAt(new Hex(-4, 1, 3)).kingdom;
            kingdom.money = 7;
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);

            expect(() => arbiter.buyUnit()).to.throw('Not enough money');
        });
    });

    describe('buyUnit', () => {
        it('throw error when selection already have a max level unit', () => {
            const worldGenerator = new WorldGenerator('constant-seed-2');
            const world = worldGenerator.generate();

            const arbiter = new Arbiter(world);
            const kingdom = world.getHexAt(new Hex(-4, 1, 3)).kingdom;
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);

            arbiter.selection = new Unit();
            arbiter.selection.level = Arbiter.UNIT_MAX_LEVEL;

            expect(() => arbiter.buyUnit()).to.throw(/already max level/);
        });
    });

    describe('buyUnit and placeAt', () => {
        it('places a new upgraded unit', () => {
            const worldGenerator = new WorldGenerator('constant-seed-2');
            const world = worldGenerator.generate();

            const arbiter = new Arbiter(world);
            const kingdom = world.getHexAt(new Hex(-4, 1, 3)).kingdom;
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);

            arbiter.buyUnit();
            arbiter.buyUnit();

            arbiter.placeAt(new Hex(-3, 0, 3));

            world.getEntityAt(new Hex(-3, 0, 3)).should.be.an.instanceOf(Unit);
            world.getEntityAt(new Hex(-3, 0, 3)).should.have.property('level', 2);
            kingdom.should.have.property('money', 5);
            expect(arbiter.selection).to.be.null;
        });
    });

    describe('buyUnit and placeAt', () => {
        it('cannot move an unit to another owned kingdom', () => {
            const worldGenerator = new WorldGenerator('constant-seed-2');
            const world = worldGenerator.generate();

            const arbiter = new Arbiter(world);
            const kingdom0 = world.getHexAt(new Hex(-1, 3, -2)).kingdom;
            const kingdom1 = world.getHexAt(new Hex(2, -3, 1)).kingdom;
            arbiter.setCurrentPlayer(kingdom0.player);
            arbiter.setCurrentKingdom(kingdom0);

            world.setEntityAt(new Hex(-1, 3, -2), new Unit());

            arbiter.takeUnitAt(new Hex(-1, 3, -2));

            arbiter.selection.should.be.an.instanceOf(Unit);

            expect(() => arbiter.placeAt(new Hex(2, -3, 1))).to.throw('Cannot move unit to another owned kingdom');

            arbiter.selection.should.be.an.instanceOf(Unit);
        });
    });

    describe('takeUnitAt and buyUnit', () => {
        it('upgrades an existing unit', () => {
            const worldGenerator = new WorldGenerator('constant-seed-2');
            const world = worldGenerator.generate();

            const level1Unit = new Unit();
            level1Unit.level = 1;

            world.setEntityAt(new Hex(-3, 0, 3), level1Unit);

            const arbiter = new Arbiter(world);
            const kingdom = world.getHexAt(new Hex(-4, 1, 3)).kingdom;
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);

            arbiter.takeUnitAt(new Hex(-3, 0, 3));
            arbiter.buyUnit();

            expect(world.getEntityAt(new Hex(-3, 0, 3))).to.be.null;
            kingdom.should.have.property('money', 15);
            arbiter.selection.should.be.an.instanceOf(Unit);
            arbiter.selection.level.should.be.equal(2);
        });
    });

    /*
    describe('all', function() {
        it('all', function() {
            const me = new LocalPlayer();

            const players = [
                me,
                new AIPlayer(),
                new AIPlayer(),
                new AIPlayer(),
                new AIPlayer(),
                new AIPlayer(),
            ];

            const world = new World(players);
            const arbiter = new Arbiter(world);

            const myKingdoms = world.getPlayerKingdoms(me);

            arbiter.setCurrentPlayer(me);
            arbiter.setCurrentKingdom(myKingdoms[0]);

            // Move unit
            arbiter.takeUnitAt(new Hex(0, 2, 5));
            arbiter.placeAt(new Hex(0, 2, 6));

            // Buy and place unit
            arbiter.buyUnit();
            arbiter.placeAt(new Hex(0, 2, 6));

            // Buy and place tower
            arbiter.buyTower();
            arbiter.placeAt(new Hex(0, 2, 6));

            // Buy and place level 2 unit
            arbiter.buyUnit();
            arbiter.buyUnit();
            arbiter.placeAt(new Hex(0, 2, 6));

            // Upgrade and move unit
            arbiter.takeUnitAt(new Hex(0, 2, 5));
            arbiter.buyUnit();
            arbiter.placeAt(new Hex(0, 2, 6));

            // Get current selection
            arbiter.buyUnit();
            arbiter.getSelection();

            // Undo last action
            arbiter.undo();

            // Undo whole current turn
            arbiter.undoCurrentTurn();

            // Finish current turn
            arbiter.validateTurn();
        });
    });
    */
});
