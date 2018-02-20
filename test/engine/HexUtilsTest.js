import { Player, LocalPlayer, Hex, World, WorldGenerator, HexUtils } from '../../src/engine';
import chai from 'chai';
import { generateTestWorld } from './TestUtils';

chai.should();

describe('HexUtils', function() {
    describe('getMiddleHex', function() {
        it('returns the middle hex of a thin kingdom', function() {
            const world = generateTestWorld('constant-seed-5');

            const kingdom = world.getKingdomAt(new Hex(0, -1, 1));
            const middleHex = HexUtils.getMiddleHex(world, kingdom);

            HexUtils.equals(middleHex, new Hex(-2, 1, 1)).should.be.true;
        });

        it('returns the middle hex of a small round kingdom', function() {
            const world = generateTestWorld('constant-seed-5');

            const kingdom = world.getKingdomAt(new Hex(3, -1, -2));
            const middleHex = HexUtils.getMiddleHex(world, kingdom);

            HexUtils.equals(middleHex, new Hex(2, 0, -2)).should.be.true;
        });

        it('returns any hex of a 2-hex kingdom', function() {
            const world = generateTestWorld('constant-seed-5');

            const kingdom = world.getKingdomAt(new Hex(0, -4, 4));
            const middleHex = HexUtils.getMiddleHex(world, kingdom);

            (
                HexUtils.equals(middleHex, new Hex(0, -4, 4)) ||
                HexUtils.equals(middleHex, new Hex(-1, -3, 4))
            ).should.be.true;
        });

        it('returns any hex of a 3-hex triangle kingdom', function() {
            const world = generateTestWorld('constant-seed-5');

            const kingdom = world.getKingdomAt(new Hex(1, 1, -2));
            const middleHex = HexUtils.getMiddleHex(world, kingdom);

            (
                HexUtils.equals(middleHex, new Hex(0, 1, -1)) ||
                HexUtils.equals(middleHex, new Hex(0, 2, -2)) ||
                HexUtils.equals(middleHex, new Hex(1, 1, -2))
            ).should.be.true;
        });
    });
});
