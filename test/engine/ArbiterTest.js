import chai from 'chai';
import { Arbiter, Player, Hex, Unit, Died, Tree, World, WorldGenerator } from '../../src/engine';
import { createTestPlayers } from './TestUtils';

chai.should();
const expect = chai.expect;

describe('Arbiter', () => {
    describe('takeUnitAt', () => {
        it('put unit in selection and remove it from hex', () => {
            const worldGenerator = new WorldGenerator('constant-seed-2');
            const world = worldGenerator.generate(createTestPlayers());

            world.setEntityAt(new Hex(-3, 0, 3), new Unit());

            const arbiter = new Arbiter(world);
            arbiter.setCurrentPlayer(world.getKingdomAt(new Hex(-4, 1, 3)).player);
            arbiter.setCurrentKingdom(world.getKingdomAt(new Hex(-4, 1, 3)));

            expect(arbiter.selection).to.be.null;
            world.getEntityAt(new Hex(-3, 0, 3)).should.be.an.instanceOf(Unit);

            arbiter.takeUnitAt(new Hex(-3, 0, 3));

            arbiter.selection.should.be.an.instanceOf(Unit);
            expect(world.getEntityAt(new Hex(-3, 0, 3))).to.be.null;
        });

        it('breaks when no kingdom selected', () => {
            const worldGenerator = new WorldGenerator('constant-seed-2');
            const world = worldGenerator.generate(createTestPlayers());

            world.setEntityAt(new Hex(-3, 0, 3), new Unit());

            const arbiter = new Arbiter(world);
            arbiter.setCurrentPlayer(world.getKingdomAt(new Hex(-4, 1, 3)).player);

            expect(() => {arbiter.takeUnitAt(new Hex(-3, 0, 3))}).to.throw(/kingdom must be selected/);
        });
    });

    describe('placeAt', () => {
        it('place an unit from selection to a hex of the same kingdom', () => {
            const worldGenerator = new WorldGenerator('constant-seed-2');
            const world = worldGenerator.generate(createTestPlayers());

            const arbiter = new Arbiter(world);
            const kingdom = world.getKingdomAt(new Hex(-4, 1, 3));
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);
            arbiter.selection = new Unit();

            arbiter.selection.should.be.an.instanceOf(Unit);
            expect(world.getEntityAt(new Hex(-2, 0, 2))).to.be.null;

            arbiter.placeAt(new Hex(-2, 0, 2));

            expect(arbiter.selection).to.be.null;
            world.getEntityAt(new Hex(-2, 0, 2)).should.be.an.instanceOf(Unit);
        });

        it('can no longer move when upgrading an unit that already played a move', () => {
            const worldGenerator = new WorldGenerator('constant-seed-2');
            const world = worldGenerator.generate(createTestPlayers());

            const unitMove = new Unit(1);
            const unitCannotMove = new Unit(1);
            unitMove.played = false;
            unitCannotMove.played = true;

            const arbiter = new Arbiter(world);
            const kingdom = world.getKingdomAt(new Hex(2, -3, 1));
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);
            arbiter.selection = unitMove;
            world.setEntityAt(new Hex(4, -4, 0), unitCannotMove);

            arbiter.placeAt(unitCannotMove.hex);

            world.getEntityAt(new Hex(4, -4, 0)).should.have.property('played', true);
            world.getEntityAt(new Hex(4, -4, 0)).should.have.property('level', 2);
        });

        it('makes the unit played his turn after cutting a tree', () => {
            const worldGenerator = new WorldGenerator('constant-seed-5');
            const world = worldGenerator.generate(createTestPlayers());

            const arbiter = new Arbiter(world);
            const kingdom = world.getKingdomAt(new Hex(2, -1, -1));
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);
            const lumberjack = new Unit();
            lumberjack.played = false;
            arbiter.selection = lumberjack;
            world.setEntityAt(new Hex(3, -1, -2), new Tree(Tree.CONTINENTAL));

            arbiter.placeAt(new Hex(3, -1, -2));

            lumberjack.should.have.property('played', true);
            world.getEntityAt(new Hex(3, -1, -2)).should.be.equal(lumberjack);
        });

        it('Can capture a single new hex and unit cannot move again', () => {
            const worldGenerator = new WorldGenerator('constant-seed-2');
            const world = worldGenerator.generate(createTestPlayers());

            const arbiter = new Arbiter(world);
            const kingdom = world.getKingdomAt(new Hex(2, -3, 1));
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);
            arbiter.selection = new Unit();

            expect(world.getKingdomAt(new Hex(4, -3, -1))).to.be.null;
            kingdom.hexs.should.have.lengthOf(5);

            arbiter.placeAt(new Hex(4, -3, -1));

            expect(world.getKingdomAt(new Hex(4, -3, -1))).to.not.be.null;
            world.getKingdomAt(new Hex(4, -3, -1)).should.be.equal(kingdom);
            world.getHexAt(new Hex(4, -3, -1)).entity.should.be.an.instanceOf(Unit);
            kingdom.hexs.should.have.lengthOf(6);
        });

        it('Can not capture an hex not neighbour to kingdom', () => {
            const worldGenerator = new WorldGenerator('constant-seed-2');
            const world = worldGenerator.generate(createTestPlayers());

            const arbiter = new Arbiter(world);
            const kingdom = world.getKingdomAt(new Hex(2, -3, 1));
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);
            arbiter.selection = new Unit();

            expect(world.getKingdomAt(new Hex(4, -1, -3))).to.be.null;
            kingdom.hexs.should.have.lengthOf(5);

            expect(() => { arbiter.placeAt(new Hex(4, -1, -3)); }).to.throw(/not capture/);

            expect(world.getKingdomAt(new Hex(4, -1, -3))).to.be.null;
            kingdom.hexs.should.have.lengthOf(5);
        });

        it('can link a single owned hex to our kingdom', () => {
            const worldGenerator = new WorldGenerator('constant-seed-2');
            const world = worldGenerator.generate(createTestPlayers());

            const arbiter = new Arbiter(world);
            const kingdom = world.getKingdomAt(new Hex(2, -3, 1));
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);
            arbiter.selection = new Unit();

            expect(world.getKingdomAt(new Hex(2, 0, -2))).to.be.null;
            world.getHexAt(new Hex(2, 0, -2)).player.should.be.equal(kingdom.player);
            kingdom.hexs.should.have.lengthOf(5);

            arbiter.placeAt(new Hex(2, -1, -1));

            world.getKingdomAt(new Hex(2, 0, -2)).should.be.equal(kingdom);
            kingdom.hexs.should.have.lengthOf(7);
        });

        it('can merge two kingdoms to a single one, with money of these two kingdoms', () => {
            const worldGenerator = new WorldGenerator('constant-seed-2');
            const world = worldGenerator.generate(createTestPlayers());

            const arbiter = new Arbiter(world);

            const hexInKingdom = world.getHexAt(new Hex(2, -2, 0));
            const hexInOtherKingdom = world.getHexAt(new Hex(3, -1, -2));

            const kingdomMoney = hexInKingdom.kingdom.money;
            const otherKingdomMoney = hexInOtherKingdom.kingdom.money;

            arbiter.setCurrentPlayer(hexInKingdom.player);
            arbiter.setCurrentKingdom(hexInKingdom.kingdom);
            arbiter.selection = new Unit();

            expect(world.getKingdomAt(new Hex(2, -1, -1))).to.be.null;
            hexInKingdom.kingdom.should.not.be.equal(hexInOtherKingdom.kingdom);
            hexInKingdom.kingdom.hexs.should.have.lengthOf(3);

            arbiter.placeAt(new Hex(2, -1, -1));

            expect(world.getKingdomAt(new Hex(2, -1, -1))).to.be.equal(hexInKingdom.kingdom);
            hexInKingdom.kingdom.should.be.equal(hexInOtherKingdom.kingdom);
            hexInKingdom.kingdom.hexs.should.have.lengthOf(6);
            hexInKingdom.kingdom.money.should.be.equal(kingdomMoney + otherKingdomMoney);
        });

        it('can capture a hex from an opponent kingdom', () => {
            const worldGenerator = new WorldGenerator('constant-seed-5');
            const world = worldGenerator.generate(createTestPlayers());

            const arbiter = new Arbiter(world);
            const kingdom = world.getKingdomAt(new Hex(3, -1, -2));
            const opponentKingdom = world.getKingdomAt(new Hex(-1, 0, 1));
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);
            arbiter.selection = new Unit();

            expect(world.getKingdomAt(new Hex(2, -2, 0))).to.be.equal(opponentKingdom);
            kingdom.hexs.should.have.lengthOf(5);
            opponentKingdom.hexs.should.have.lengthOf(9);

            arbiter.placeAt(new Hex(2, -2, 0));

            expect(world.getKingdomAt(new Hex(2, -2, 0))).to.be.equal(kingdom);
            kingdom.hexs.should.have.lengthOf(6);
            opponentKingdom.hexs.should.have.lengthOf(8);
        });

        it('Cannot capture a hex protected by opponent', () => {
            const worldGenerator = new WorldGenerator('constant-seed-5');
            const world = worldGenerator.generate(createTestPlayers());

            const arbiter = new Arbiter(world);
            const kingdom = world.getKingdomAt(new Hex(-1, 0, 1));
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);
            world.setEntityAt(new Hex(2, 0, -2), new Unit());
            arbiter.selection = new Unit();

            expect(() => { arbiter.placeAt(new Hex(2, -1, -1)); }).to.throw(/protect/);
        });

        it('Cannot kill an opponent unit if same level', () => {
            const worldGenerator = new WorldGenerator('constant-seed-5');
            const world = worldGenerator.generate(createTestPlayers());

            const arbiter = new Arbiter(world);
            const kingdom = world.getKingdomAt(new Hex(-1, 0, 1));
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);
            world.setEntityAt(new Hex(2, -1, -1), new Unit());
            arbiter.selection = new Unit();

            expect(() => { arbiter.placeAt(new Hex(2, -1, -1)); }).to.throw(/protect/);
        });

        it('Cannot capture a single opponent hex if there is still an unit on it', () => {
            const worldGenerator = new WorldGenerator('constant-seed-5');
            const world = worldGenerator.generate(createTestPlayers());

            const arbiter = new Arbiter(world);
            const kingdom = world.getKingdomAt(new Hex(1, -2, 1));
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);
            arbiter.selection = new Unit();
            world.setEntityAt(new Hex(1, -3, 2), new Unit());

            expect(() => { arbiter.placeAt(new Hex(1, -3, 2)); }).to.throw(/protect/);
        });

        it('split opponent kingdom in two little kingdoms when cutting', () => {
            const worldGenerator = new WorldGenerator('constant-seed-5');
            const world = worldGenerator.generate(createTestPlayers());

            const arbiter = new Arbiter(world);
            const kingdom = world.getKingdomAt(new Hex(0, -2, 2));
            const opponentKingdom = world.getKingdomAt(new Hex(-3, 1, 2));
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);
            arbiter.selection = new Unit();

            world.getKingdomAt(new Hex(0, -1, 1)).should.be.equal(opponentKingdom);
            world.getKingdomAt(new Hex(-2, 0, 2)).should.be.equal(opponentKingdom);
            world.getKingdomAt(new Hex(2, -2, 0)).should.be.equal(opponentKingdom);
            opponentKingdom.hexs.should.have.lengthOf(9);
            kingdom.hexs.should.have.lengthOf(2);

            arbiter.placeAt(new Hex(0, -1, 1));

            world.getKingdomAt(new Hex(0, -1, 1)).should.be.equal(kingdom);
            kingdom.hexs.should.have.lengthOf(3);
            world.getKingdomAt(new Hex(-2, 0, 2)).should.not.be.equal(world.getKingdomAt(new Hex(2, -2, 0)));
            world.getKingdomAt(new Hex(-2, 0, 2)).player.should.be.equal(world.getKingdomAt(new Hex(2, -2, 0)).player);
            expect(world.getKingdomAt(new Hex(-2, 0, 2)).getSize() + world.getKingdomAt(new Hex(2, -2, 0)).getSize()).to.be.equal(9 - 1);
        });

        it('split opponent kingdom in two single hexs and kill main kingdom if kingdom has only 3 hexs', () => {
            const worldGenerator = new WorldGenerator('constant-seed-5');
            const world = worldGenerator.generate(createTestPlayers());

            const arbiter = new Arbiter(world);
            const kingdom = world.getKingdomAt(new Hex(-2, 0, 2));
            const opponentKingdom = world.getKingdomAt(new Hex(-4, 1, 3));
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);
            arbiter.selection = new Unit(3);

            arbiter.placeAt(new Hex(-4, 2, 2));

            expect(world.getKingdomAt(new Hex(-4, 1, 3))).to.be.null;
            expect(world.getKingdomAt(new Hex(-4, 3, 1))).to.be.null;
            expect(world.getKingdomAt(new Hex(-4, 2, 2))).to.be.equal(kingdom);
        });

        it('kill opponent 2-hex kingdom if I capture one of them', () => {
            const worldGenerator = new WorldGenerator('constant-seed-5');
            const world = worldGenerator.generate(createTestPlayers());

            const arbiter = new Arbiter(world);
            const kingdom = world.getKingdomAt(new Hex(-3, 1, 2));
            const opponentKingdom = world.getKingdomAt(new Hex(-2, 3, -1));
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);
            arbiter.selection = new Unit(3);

            expect(world.getKingdomAt(new Hex(-2, 3, -1))).to.be.equal(opponentKingdom);
            expect(world.getKingdomAt(new Hex(-1, 2, -1))).to.be.equal(opponentKingdom);

            arbiter.placeAt(new Hex(-1, 2, -1));

            expect(world.getKingdomAt(new Hex(-2, 3, -1))).to.be.null;
            expect(world.getKingdomAt(new Hex(-1, 2, -1))).to.be.equal(kingdom);
        });
    });

    describe('takeUnitAt and placeAt', () => {
        it('just moving an unit should still having a move', () => {
            const worldGenerator = new WorldGenerator('constant-seed-2');
            const world = worldGenerator.generate(createTestPlayers());

            world.setEntityAt(new Hex(-3, 0, 3), new Unit());

            const arbiter = new Arbiter(world);
            const kingdom = world.getKingdomAt(new Hex(-4, 1, 3));
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
            const world = worldGenerator.generate(createTestPlayers());

            const arbiter = new Arbiter(world);
            const kingdom = world.getKingdomAt(new Hex(-4, 1, 3));
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);

            arbiter.currentKingdom.money.should.be.equal(25);

            arbiter.buyUnit();

            arbiter.currentKingdom.money.should.be.equal(15);
            arbiter.selection.level.should.equal(1);
        });

        it('upgrade selected unit', () => {
            const worldGenerator = new WorldGenerator('constant-seed-2');
            const world = worldGenerator.generate(createTestPlayers());

            const arbiter = new Arbiter(world);
            const kingdom = world.getKingdomAt(new Hex(-4, 1, 3));
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

        it('throw error when not enough money', () => {
            const worldGenerator = new WorldGenerator('constant-seed-2');
            const world = worldGenerator.generate(createTestPlayers());

            const arbiter = new Arbiter(world);
            const kingdom = world.getKingdomAt(new Hex(-4, 1, 3));
            kingdom.money = 7;
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);

            expect(() => arbiter.buyUnit()).to.throw('Not enough money');
        });

        it('throw error when selection already have a max level unit', () => {
            const worldGenerator = new WorldGenerator('constant-seed-2');
            const world = worldGenerator.generate(createTestPlayers());

            const arbiter = new Arbiter(world);
            const kingdom = world.getKingdomAt(new Hex(-4, 1, 3));
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);

            arbiter.selection = new Unit(Arbiter.UNIT_MAX_LEVEL);

            expect(() => arbiter.buyUnit()).to.throw(/already max level/);
        });
    });

    describe('buyUnit and placeAt', () => {
        it('places a new upgraded unit', () => {
            const worldGenerator = new WorldGenerator('constant-seed-2');
            const world = worldGenerator.generate(createTestPlayers());

            const arbiter = new Arbiter(world);
            const kingdom = world.getKingdomAt(new Hex(-4, 1, 3));
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);

            arbiter.buyUnit();
            arbiter.buyUnit();

            arbiter.placeAt(new Hex(-3, 1, 2));

            world.getEntityAt(new Hex(-3, 1, 2)).should.be.an.instanceOf(Unit);
            world.getEntityAt(new Hex(-3, 1, 2)).should.have.property('level', 2);
            kingdom.should.have.property('money', 5);
            expect(arbiter.selection).to.be.null;
        });

        it('cannot move an unit to another owned kingdom', () => {
            const worldGenerator = new WorldGenerator('constant-seed-2');
            const world = worldGenerator.generate(createTestPlayers());

            const arbiter = new Arbiter(world);
            const kingdom0 = world.getKingdomAt(new Hex(-1, 3, -2));
            const kingdom1 = world.getKingdomAt(new Hex(2, -3, 1));
            arbiter.setCurrentPlayer(kingdom0.player);
            arbiter.setCurrentKingdom(kingdom0);

            world.setEntityAt(new Hex(-1, 3, -2), new Unit());

            arbiter.takeUnitAt(new Hex(-1, 3, -2));

            arbiter.selection.should.be.an.instanceOf(Unit);

            expect(() => arbiter.placeAt(new Hex(2, -3, 1))).to.throw('Cannot capture this hex, too far of kingdom');

            arbiter.selection.should.be.an.instanceOf(Unit);
        });
    });

    describe('takeUnitAt and buyUnit', () => {
        it('upgrades an existing unit', () => {
            const worldGenerator = new WorldGenerator('constant-seed-2');
            const world = worldGenerator.generate(createTestPlayers());

            const level1Unit = new Unit(1);

            world.setEntityAt(new Hex(-3, 0, 3), level1Unit);

            const arbiter = new Arbiter(world);
            const kingdom = world.getKingdomAt(new Hex(-4, 1, 3));
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

    describe('smartAction', () => {
        it('selects kingdom AND takes unit when clicking on a unit in another kingdom, and not only selects kingdom', () => {
            const worldGenerator = new WorldGenerator('constant-seed-2');
            const world = worldGenerator.generate(createTestPlayers());

            world.setEntityAt(new Hex(3, -3, 0), new Unit());

            const arbiter = new Arbiter(world);
            const kingdom = world.getKingdomAt(new Hex(-2, 3, -1));
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);

            arbiter.currentKingdom.should.be.equal(kingdom);
            expect(arbiter.selection).to.be.null;

            arbiter.smartAction(new Hex(3, -3, 0));

            arbiter.currentKingdom.should.not.be.equal(kingdom);
            arbiter.currentKingdom.should.be.equal(world.getKingdomAt(new Hex(3, -3, 0)));
            expect(arbiter.selection).to.not.be.null;
        });

        it('Move an unit in kingdom', () => {
            const worldGenerator = new WorldGenerator('constant-seed-2');
            const world = worldGenerator.generate(createTestPlayers());

            world.setEntityAt(new Hex(-3, 0, 3), new Unit());

            const arbiter = new Arbiter(world);
            const kingdom = world.getKingdomAt(new Hex(-4, 1, 3));
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);

            world.getEntityAt(new Hex(-3, 0, 3)).should.have.property('played', false);

            arbiter.smartAction(new Hex(-3, 0, 3));
            arbiter.smartAction(new Hex(-4, 1, 3));

            world.getEntityAt(new Hex(-4, 1, 3)).should.have.property('played', false);
        });

        it('Captures a hex', () => {
            const worldGenerator = new WorldGenerator('constant-seed-2');
            const world = worldGenerator.generate(createTestPlayers());

            world.setEntityAt(new Hex(-3, 0, 3), new Unit());

            const arbiter = new Arbiter(world);
            const kingdom = world.getKingdomAt(new Hex(-4, 1, 3));
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);

            world.getEntityAt(new Hex(-3, 0, 3)).should.have.property('played', false);
            expect(world.getKingdomAt(new Hex(-2, -1, 3))).to.be.null;
            world.getKingdomAt(new Hex(-3, 0, 3)).hexs.should.have.lengthOf(5);

            arbiter.smartAction(new Hex(-3, 0, 3));
            arbiter.smartAction(new Hex(-2, -1, 3));

            expect(world.getEntityAt(new Hex(-2, -1, 3))).to.not.be.null;
            world.getEntityAt(new Hex(-2, -1, 3)).should.have.property('played', true);
            expect(world.getKingdomAt(new Hex(-2, -1, 3))).to.not.be.null;
            world.getKingdomAt(new Hex(-2, -1, 3)).should.be.equal(kingdom);
            world.getKingdomAt(new Hex(-2, -1, 3)).hexs.should.have.lengthOf(6);
        });

        it('can capture a hex from an opponent kingdom', () => {
            const worldGenerator = new WorldGenerator('constant-seed-2');
            const world = worldGenerator.generate(createTestPlayers());

            const arbiter = new Arbiter(world);
            const kingdom = world.getKingdomAt(new Hex(2, -3, 1));
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);
            arbiter.selection = new Unit(3);

            expect(world.getKingdomAt(new Hex(2, -2, 0))).to.not.be.null;
            expect(world.getKingdomAt(new Hex(2, -2, 0))).to.not.be.equal(kingdom);
            kingdom.hexs.should.have.lengthOf(5);

            arbiter.smartAction(new Hex(2, -2, 0));

            expect(world.getKingdomAt(new Hex(2, -2, 0))).to.be.equal(kingdom);
            kingdom.hexs.should.have.lengthOf(6);
        });
    });

    describe('endTurn', () => {
        it('kills units if not enough money to pay them', () => {
            const worldGenerator = new WorldGenerator('constant-seed-5');
            const world = worldGenerator.generate(createTestPlayers());

            const arbiter = new Arbiter(world);
            const kingdom = world.getKingdomAt(new Hex(2, -1, -1));
            kingdom.money = 25;
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);
            world.setEntityAt(new Hex(2, -1, -1), new Unit(2));
            world.setEntityAt(new Hex(1, 0, -1), new Unit(3));
            world.setEntityAt(new Hex(3, 0, -3), new Unit(4));

            for (let i = 0; i < 6; i++) {
                arbiter.endTurn();
            }

            expect(world.getEntityAt(new Hex(2, -1, -1))).to.be.an.instanceOf(Died);
            expect(world.getEntityAt(new Hex(1, 0, -1))).to.be.an.instanceOf(Died);
            expect(world.getEntityAt(new Hex(3, 0, -3))).to.be.an.instanceOf(Died);
            kingdom.money.should.be.equal(0);
        });

        it('transforms dieds to trees', () => {
            const worldGenerator = new WorldGenerator('constant-seed-5');
            const world = worldGenerator.generate(createTestPlayers());

            const arbiter = new Arbiter(world);
            const kingdom = world.getKingdomAt(new Hex(2, -1, -1));
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);
            world.setEntityAt(new Hex(2, -1, -1), new Died());

            for (let i = 0; i < 6; i++) {
                arbiter.endTurn();
            }

            expect(world.getEntityAt(new Hex(2, -1, -1))).to.be.an.instanceOf(Tree);
        });

        it('keeps a trace of kingdom economy', () => {
            const worldGenerator = new WorldGenerator('constant-seed-5');
            const world = worldGenerator.generate(createTestPlayers());

            const arbiter = new Arbiter(world);
            const kingdom = world.getKingdomAt(new Hex(2, -1, -1));
            kingdom.money = 25;
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);
            world.setEntityAt(new Hex(3, 0, -3), new Unit(1));
            world.setEntityAt(new Hex(2, -1, -1), new Unit(2));

            for (let i = 0; i < 6; i++) {
                arbiter.endTurn();
            }

            expect(kingdom.balance).to.not.be.null;
            kingdom.balance.lastCapital.should.be.equal(25);
            kingdom.balance.income.should.be.equal(5);
            kingdom.balance.maintenance.should.be.equal(2 + 6);
            kingdom.money.should.be.equal(25 + 5 - (2 + 6));
        });

        it('keeps a trace of kingdom economy when units die', () => {
            const worldGenerator = new WorldGenerator('constant-seed-5');
            const world = worldGenerator.generate(createTestPlayers());

            const arbiter = new Arbiter(world);
            const kingdom = world.getKingdomAt(new Hex(2, -1, -1));
            kingdom.money = 25;
            arbiter.setCurrentPlayer(kingdom.player);
            arbiter.setCurrentKingdom(kingdom);
            world.setEntityAt(new Hex(2, -1, -1), new Unit(2));
            world.setEntityAt(new Hex(1, 0, -1), new Unit(3));
            world.setEntityAt(new Hex(3, 0, -3), new Unit(4));

            for (let i = 0; i < 6; i++) {
                arbiter.endTurn();
            }

            expect(kingdom.balance).to.not.be.null;
            kingdom.balance.lastCapital.should.be.equal(25);
            kingdom.balance.income.should.be.equal(5);
            kingdom.balance.maintenance.should.be.equal(54 + 18 + 6);
            kingdom.money.should.be.equal(0);
        });
    });
});
