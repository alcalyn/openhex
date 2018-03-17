import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import SizeButton from './SizeButton';

export default class CreateCustomGame extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            size: 14,
            seed: null,
        };
    }

    selectSize(size) {
        this.setState({ size });
    }

    onSeedInputChange(e) {
        this.setState({
            seed: e.target.value,
        });
    }

    render() {
        return (
            <div className={'container create-custom-game'}>
                <h2>Create custom game</h2>

                <h3>World size</h3>

                <div className={'row'}>
                    <SizeButton size={  6 } selectedSize={ this.state.size } onSelectSize={ size => this.selectSize(size) } label={'Tiny'} />
                    <SizeButton size={ 10 } selectedSize={ this.state.size } onSelectSize={ size => this.selectSize(size) } label={'Small'} />
                    <SizeButton size={ 14 } selectedSize={ this.state.size } onSelectSize={ size => this.selectSize(size) } label={'Medium'} visible={'sm'} />
                    <SizeButton size={ 24 } selectedSize={ this.state.size } onSelectSize={ size => this.selectSize(size) } label={'Large'} />
                    <SizeButton size={ 36 } selectedSize={ this.state.size } onSelectSize={ size => this.selectSize(size) } label={'Huuuge'} visible={'sm'} />
                </div>

                <h3>Seed</h3>

                <input
                    value={this.state.seed}
                    onChange={e => this.onSeedInputChange(e)}
                    placeholder={'Custom seed, let blank for random'}
                    className={'form-control form-control-lg'}
                ></input>

                <Link
                    to={{
                        pathname: '/game',
                        state: {
                            config: this.state,
                        },
                    }}
                    className={'btn btn-lg btn-success btn-block play-button'}
                >Play</Link>

            </div>
        );
    }
}
