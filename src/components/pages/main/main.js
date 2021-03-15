import React, { Component } from 'react'

export default class main extends Component {
    render() {
        return (
            <div>
                this is main{this.props.match.params.name}
            </div>
        )
    }
}
