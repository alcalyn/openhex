import { Player, Hex, World, WorldGenerator } from '../../src/engine';
import chai from 'chai';

chai.should();

describe('WorldGenerator', function() {
    describe('generate', function() {
        it('returns a well formed world', function() {
            const worldGenerator = new WorldGenerator();
            const world = worldGenerator.generate();

            // Random assertions
            world.should.be.an.instanceOf(World);
            world.players[0].should.be.an.instanceOf(Player);
            world.hexs[0].should.be.an.instanceOf(Hex);
            world.players[1].should.have.property('color', 1);
            world.hexs.length.should.satisfy(length => length % world.players.length === 0, 'Number of hex must be a multiple of player number');
            world.hexs[0].should.have.property('player');
        });

        it('returns a world with kingdoms', function() {
            const worldGenerator = new WorldGenerator();
            const world = worldGenerator.generate();
        });
    });
});
