import {ReactSVGPanZoom} from 'react-svg-pan-zoom';
import React, { Component } from 'react';
import { HexGrid, Layout } from 'react-hexgrid';
import { WorldGenerator, Hex, Unit, Arbiter } from './engine';
import { KingdomMenu, Selection, HexCell, TurnMenu } from './components';
import './App.css';

class App extends Component {
    constructor(props, context) {
        super(props, context);

        const worldGenerator = new WorldGenerator('constant-seed-5');
        const world = worldGenerator.generate();

        world.setEntityAt(new Hex(2, 0, -2), new Unit());
        world.setEntityAt(new Hex(0, -4, 4), new Unit());

        const arbiter = new Arbiter(world);
        arbiter.setCurrentPlayer(world.players[0]);

        this.state = {
            world,
            selection: arbiter.selection,
        };

        this.arbiter = arbiter;
    }

    clickHex(hex) {
        console.log('hex', hex);

        try {
            this.arbiter.smartAction(hex);

        } catch (e) {
            console.warn(e.message);
        }

        this.update();

        console.log('selection', this.arbiter.selection);
    }

    hexUnitHasMove(hex) {
        if (this.arbiter.currentPlayer !== hex.player) {
            return false;
        }

        if (!hex.hasUnit()) {
            return false;
        }

        return !hex.entity.played;
    }

    update() {
        this.setState({
            world: this.state.world,
            selection: this.arbiter.selection,
            currentKingdom: this.arbiter.currentKingdom,
        });
    }

    render() {
        const { world, selection } = this.state;

        const viewBoxSize = 64;
        const viewBox = [
            -viewBoxSize / 2,
            -viewBoxSize / 2,
            viewBoxSize,
            viewBoxSize
        ].join(' ');

        return (
            <div className="App">
                <div id="selection">
                    <Selection entity={selection} />
                </div>
                <div id="kingdom-menu">
                    <KingdomMenu arbiter={this.arbiter} onUpdate={() => { this.update(); }} />
                </div>
                <div id="turn-menu">
                    <TurnMenu
                        onEndTurn={() => { this.arbiter.endTurn();this.update(); }}
                        onUndo={() => { this.arbiter.undo();this.update(); }}
                        onRedo={() => { this.arbiter.redo();this.update(); }}
                        onUndoAll={() => { this.arbiter.undoAll();this.update(); }}
                    />
                </div>
                <div id="grid">
                    <ReactSVGPanZoom
                        width={'100%'} height={'100%'}
                        tool={'auto'}
                        SVGBackground={'rgba(0, 0, 0, 0)'}
                        background={'rgba(0, 0, 0, 0)'}
                        toolbarPosition={'none'}
                        miniaturePosition={'none'}
                        disableDoubleClickZoomWithToolAuto={true}
                    >
                        <HexGrid id="grid" width={100} height={100} viewBox={viewBox}>
                            <Layout size={{ x: 2, y: 2 }} spacing={1.06}>
                                { world.hexs.map((hex, i) => <HexCell
                                    key={i}
                                    hex={hex}
                                    highlight={null !== hex.kingdom && hex.kingdom === this.state.currentKingdom}
                                    unitHasMove={this.hexUnitHasMove(hex)}
                                    onClick={() => { this.clickHex(hex); }}
                                />) }
                            </Layout>
                        </HexGrid>
                    </ReactSVGPanZoom>
                </div>
            </div>
        );
    }
}

export default App;
