import React, { Component } from 'react';
import { Hexagon } from 'react-hexgrid';
import unitImg from '../themes/default/unit-0.png';

export default class SlayHex extends Component {
    onClick(e) {
        if (this.props.onClick) {
            this.props.onClick(e, this);
        }
    }

    hexClasses(hex) {
        const classes = ['hex'];

        classes.push('color-'+hex.player.color);

        if (hex.hasUnit()) {
            classes.push('unit-'+hex.entity.level);
        }

        return classes.join(' ');
    }

    hexContent(hex) {
        if (hex.hasUnit()) {
            return (
                <image
                    x={-1}
                    y={-1}
                    width={2}
                    height={2}
                    xlinkHref={unitImg}
                />
            );
        }

        return '';
    }

    render() {
        const { hex } = this.props;

        return (
            <Hexagon
                q={hex.q}
                r={hex.r}
                s={hex.s}
                className={this.hexClasses(hex)}
                onClick={e => this.onClick(e)}
            >
                {this.hexContent(hex)}
            </Hexagon>
        );
    }
}
