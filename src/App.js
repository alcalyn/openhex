import React, { Component } from 'react';
import { HexGrid, Layout } from 'react-hexgrid';
import { WorldGenerator, Hex, Unit, Arbiter } from './engine';
import { KingdomMenu, Selection, SlayHex } from './components';
import './App.css';

class App extends Component {
    constructor(props, context) {
        super(props, context);

        const worldGenerator = new WorldGenerator('constant-seed-2');
        const world = worldGenerator.generate();

        world.setEntityAt(new Hex(3, -3, 0), new Unit());
        world.setEntityAt(new Hex(-1, 3, -2), new Unit());

        const arbiter = new Arbiter(world);
        arbiter.setCurrentPlayer(world.players[4]);

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

            this.update();
        } catch (e) {
            console.warn(e.message);
        }

        console.log('selection', this.arbiter.selection);
    }

    update() {
        this.setState({
            world: this.state.world,
            selection: this.arbiter.selection,
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
                <div id="grid">
                    <HexGrid id="grid" width={'100%'} height={'100%'} viewBox={viewBox}>
                        <Layout size={{ x: 2, y: 2 }} spacing={1.06}>
                            { world.hexs.map((hex, i) => <SlayHex key={i} hex={hex} onClick={() => { this.clickHex(hex); }} />) }
                        </Layout>
                    </HexGrid>
                </div>
            </div>
        );
    }
}

export default App;
