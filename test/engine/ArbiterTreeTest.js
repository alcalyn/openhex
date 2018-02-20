import chai from 'chai';
import { Arbiter, Player, Hex, Unit, Died, Tree, World, WorldGenerator } from '../../src/engine';
import { generateTestWorld } from './TestUtils';

chai.should();
const expect = chai.expect;

describe('Arbiter', () => {
    describe('Tree', () => {
        describe('placeAt', () => {
            it('makes the unit played his turn after cutting a tree', () => {
                const world = generateTestWorld('constant-seed-5');

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
        });

        describe('endTurn', () => {
            it('transforms dieds to trees', () => {
                const world = generateTestWorld('constant-seed-5');

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

            it('spawns continental tree with time', () => {
                const world = generateTestWorld('constant-seed-5');

                world.setEntityAt(new Hex(3, -1, -2), new Tree(Tree.CONTINENTAL));

                expect(world.getEntityAt(new Hex(2, -1, -1))).to.be.null;

                const arbiter = new Arbiter(world);

                for (let i = 0; i < 21; i++) {
                    arbiter.endTurn();
                }

                expect(world.getEntityAt(new Hex(2, -1, -1))).to.be.an.instanceOf(Tree);
                world.getEntityAt(new Hex(2, -1, -1)).type.should.be.equal(Tree.CONTINENTAL);
            });

            it('spawns coastal tree with time', () => {
                const world = generateTestWorld('constant-seed-5');

                world.setEntityAt(new Hex(-3, -1, 4), new Tree(Tree.COASTAL));

                expect(world.getEntityAt(new Hex(-4, 0, 4))).to.be.null;

                const arbiter = new Arbiter(world);

                for (let i = 0; i < 16; i++) {
                    arbiter.endTurn();
                }

                expect(world.getEntityAt(new Hex(-4, 0, 4))).to.be.an.instanceOf(Tree);
                world.getEntityAt(new Hex(-4, 0, 4)).type.should.be.equal(Tree.COASTAL);
            });

            it('spawns trees over and over from new spawned trees', () => {
                const world = generateTestWorld('constant-seed-5');

                world.setEntityAt(new Hex(-1, -1, 2), new Tree(Tree.CONTINENTAL));

                expect(world.getEntityAt(new Hex(-1, -2, 3))).to.be.null;
                expect(world.getEntityAt(new Hex(0, -2, 2))).to.be.null;
                expect(world.getEntityAt(new Hex(0, -3, 3))).to.be.null;

                const arbiter = new Arbiter(world);

                for (let i = 0; i < 21; i++) {
                    arbiter.endTurn();
                }

                expect(world.getEntityAt(new Hex(-1, -2, 3))).to.be.an.instanceOf(Tree);
                world.getEntityAt(new Hex(-1, -2, 3)).type.should.be.equal(Tree.CONTINENTAL);
                expect(world.getEntityAt(new Hex(0, -2, 2))).to.be.null;
                expect(world.getEntityAt(new Hex(0, -3, 3))).to.be.null;

                for (let i = 0; i < 27; i++) {
                    arbiter.endTurn();
                }

                expect(world.getEntityAt(new Hex(0, -2, 2))).to.be.an.instanceOf(Tree);
                world.getEntityAt(new Hex(0, -2, 2)).type.should.be.equal(Tree.CONTINENTAL);
                expect(world.getEntityAt(new Hex(0, -3, 3))).to.be.null;

                for (let i = 0; i < 3; i++) {
                    arbiter.endTurn();
                }

                expect(world.getEntityAt(new Hex(0, -3, 3))).to.be.an.instanceOf(Tree);
                world.getEntityAt(new Hex(0, -3, 3)).type.should.be.equal(Tree.CONTINENTAL);
            });
        });
    });
});
