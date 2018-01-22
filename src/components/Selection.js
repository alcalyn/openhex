import React, { Component } from 'react';
import Themes from '../themes';

export default class Selection extends Component {
    render() {
        if (null === this.props.entity) {
            return '';
        }

        return (
            <img
                src={Themes.getImageFor(this.props.entity)}
                alt="selection"
            />
        );
    }
}
