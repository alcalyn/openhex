import React, { Component } from 'react';
import { Unit } from '../engine';
import Themes from '../themes';

export default class Selection extends Component {
    render() {
        const { entity } = this.props;

        if (entity instanceof Unit) {
            return (
                <img src={Themes.units[entity.level]} alt="selection" />
            );
        }

        return '';
    }
}
