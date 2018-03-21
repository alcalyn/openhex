import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { WorldConfig, WorldGenerator } from '../engine';
import { OpenHexGrid } from '.';

export default class SizeButton extends Component {

    constructor(props, context) {
        super(props, context);

        this.world = WorldGenerator.generate(null, WorldConfig({
            size: this.props.size,
        }));
    }

    buttonClasses() {
        const classes = [];

        if (this.props.size === this.props.selectedSize) {
            classes.push('active');
        }

        return classes.join(' ');
    }

    visibleClasses() {
        const classes = [];

        if ('xs' !== this.props.visible) {
            classes.push('d-none');
            classes.push(`d-${this.props.visible}-block`);
        }

        return classes.join(' ');
    }

    render() {
        return (
            <div className={'col-sm-6 col-md-4 '+this.visibleClasses()}>
                <button
                    className={'btn btn-lg btn-block btn-success '+this.buttonClasses()}
                    onClick={ () => this.props.onSelectSize(this.props.size) }
                >
                    <OpenHexGrid world={ this.world } width={ '100%' } height={ 100 } />
                    <br/>
                    { this.props.label }
                </button>
            </div>
        );
    }
}

SizeButton.propTypes = {
    size: PropTypes.number.isRequired,
    seed: PropTypes.string,
    visible: PropTypes.string,
};

SizeButton.defaultProps = {
    seed: 'sample-3',
    visible: 'xs',
};
