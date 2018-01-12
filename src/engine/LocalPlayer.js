import Player from './Player';

export default class LocalPlayer extends Player {
    notifyTurn(arbiter) {
        console.log('my turn to play');
    }
}
