import React, { Component } from 'react';

export default class Alert extends Component {
    render() {
        return (
            <div className={'alert alert-' + this.props.alert.level}>
                <p>{ this.props.alert.message }</p>
            </div>
        );
    }
}
