import React, { Component } from 'react';
import { Unit } from '../engine';
import unitImg from '../themes/default/unit-0.png';

export default class Selection extends Component {
    render() {
        const { entity } = this.props;

        console.log('render', entity, entity instanceof Unit);

        if (entity instanceof Unit) {
            return (
                <img src={unitImg} alt="selection" />
            );
        }

        return '';
    }
}
