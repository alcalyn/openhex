import { Player, LocalPlayer, Hex, World, WorldGenerator } from '../../src/engine';
import chai from 'chai';
import { createTestPlayers } from './TestUtils';

chai.should();

describe('WorldGenerator', function() {
    describe('generateHexagon4NoInitialTree', function() {
        it('returns a well formed world', function() {
            const world = WorldGenerator.generateHexagon4NoInitialTree(createTestPlayers());

            // Random assertions
            world.should.be.an.instanceOf(World);
            world.config.players[0].should.be.an.instanceOf(Player);
            world.hexs[0].should.be.an.instanceOf(Hex);
            world.config.players[1].should.have.property('color', 1);
            world.hexs.length.should.satisfy(length => length % world.config.players.length === 0, 'Number of hex must be a multiple of player number');
            world.hexs[0].should.have.property('player');
        });
    });
});
