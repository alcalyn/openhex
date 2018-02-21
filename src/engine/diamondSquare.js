/**
 * Generate a diamond-square generated matrix.
 * You can generate an island.
 * You can provide a seeded random function.
 * 
 * Modified version of:
 * https://pastebin.com/0HXRjFfJ
 * Thanks to "GUEST"
 *
 * @param {int} N Number of step, will results a 2^N + 1 array size
 * @param {bool} GENERATE_ISLAND Set true to set 0 on edges and max value at center
 * @param {Function} random Random function to use. Defaults to javascript Math.random.
 *                          Can be used to provide a known seed random function.
 *                          Function must return a number in [0; 1[
 *
 * @returns float[][] float numbers between 0 and 256
 */
export default function diamondSquare(N, GENERATE_ISLAND = false, random = Math.random) {
    const DATA_SIZE = 2 ** N + 1;

    //an initial seed value for the corners of the data
    const SEED = GENERATE_ISLAND ? 0.0 : 128.0;
    const data = [];

    for (let i = 0; i < DATA_SIZE; ++i) {
        data[i] = [];
    }

    //seed the data
    data[0][0] = data[0][DATA_SIZE - 1] = data[DATA_SIZE - 1][0] =
    data[DATA_SIZE - 1][DATA_SIZE - 1] = SEED;
 
    let h = 128.0;//the range (-h -> +h) for the average offset
 
    //side length is distance of a single square side
    //or distance of diagonal in diamond
    for (let sideLength = DATA_SIZE - 1;
        //side length must be >= 2 so we always have
        //a new value (if its 1 we overwrite existing values
        //on the last iteration)
        sideLength >= 2;
        //each iteration we are looking at smaller squares
        //diamonds, and we decrease the variation of the offset
        sideLength /= 2, h /= 2.0) {
        //half the length of the side of a square
        //or distance from diamond center to one corner
        //(just to make calcs below a little clearer)
        let halfSide = sideLength / 2;
 
        //generate the new square values
        for (let x = 0; x < DATA_SIZE - 1; x += sideLength) {
            for (let y = 0; y < DATA_SIZE - 1; y += sideLength) {
                //x, y is upper left corner of square
                //calculate average of existing corners
                let avg = data[x][y] + //top left
                data[x + sideLength][y] +//top right
                data[x][y + sideLength] + //lower left
                data[x + sideLength][y + sideLength];//lower right
                avg /= 4.0;
                //center is average plus random offset
                data[x + halfSide][y + halfSide] =
                //We calculate random value in range of 2h
                //and then subtract h so the end value is
                //in the range (-h, +h)
                avg + (random() * 2 * h) - h;

                // hack to generate an island
                if (GENERATE_ISLAND && (sideLength === DATA_SIZE - 1)) {
                    data[x + halfSide][y + halfSide] = 256.0;
                }
            }
        }
 
        //generate the diamond values
        //since the diamonds are staggered we only move x
        //by half side
        //NOTE: if the data shouldn't wrap then x < DATA_SIZE
        //to generate the far edge values
        for (let x = 0; x < DATA_SIZE - 1; x += halfSide) {
            //and y is x offset by half a side, but moved by
            //the full side length
            //NOTE: if the data shouldn't wrap then y < DATA_SIZE
            //to generate the far edge values
            for (let y = (x + halfSide) % sideLength; y < DATA_SIZE - 1; y += sideLength) {
            //x, y is center of diamond
            //note we must use mod  and add DATA_SIZE for subtraction
            //so that we can wrap around the array to find the corners
            let avg =
            data[(x - halfSide + DATA_SIZE - 1) % (DATA_SIZE - 1)][y] + //left of center
            data[(x + halfSide) % (DATA_SIZE - 1)][y] + //right of center
            data[x][(y + halfSide) % (DATA_SIZE - 1)] + //below center
            data[x][(y - halfSide + DATA_SIZE - 1) % (DATA_SIZE - 1)]; //above center
 
            avg /= 4.0;
 
            //new value = average plus random offset
            //We calculate random value in range of 2h
            //and then subtract h so the end value is
            //in the range (-h, +h)
            avg = avg + (random() * 2 * h) - h;

            // hack to generate an island
            if (GENERATE_ISLAND && (sideLength === DATA_SIZE - 1)) {
                avg = 0.0;
            }

            //update value for center of diamond
            data[x][y] = avg;

            //wrap values on the edges, remove
            //this and adjust loop condition above
            //for non-wrapping values.
            if (x === 0) data[DATA_SIZE - 1][y] = avg;
            if (y === 0) data[x][DATA_SIZE - 1] = avg;
            }
        }
    }
 
    //return the data
    return data;
}
